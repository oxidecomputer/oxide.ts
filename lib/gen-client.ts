import type { OpenAPIV3 } from "openapi-types";
import { OpenAPIV3 as O } from "openapi-types";
const HttpMethods = O.HttpMethods;
import SwaggerParser from "@apidevtools/swagger-parser";
import assert from "assert";
import fs from "fs";
import path from "path";
import {
  pascalToCamel,
  pathToTemplateStr,
  processParamName,
  snakeToCamel,
  snakeToPascal,
  topologicalSort,
} from "./util";
import { schemaToZod, setupZod } from "./zodSchema";
import { initIO, outDir } from "./io";
import { refToSchemaName, Schema } from "./schema";

const destDir = outDir();
const io = initIO(destDir);
const { w, w0, out } = io;

/**
 * Convert ``[`Vpc`](crate::external_api::views::Vpc)`` or plain ``[`Vpc`]`` to
 * `{` `@link Vpc}`, but only if that name exists in the list of schemas.
 */
const jsdocLinkify = (s: string, schemaNames: string[]) =>
  s.replace(/\[`([^`]+)`](\([^)]+\))?/g, (_, label) =>
    schemaNames.includes(label) ? `{@link ${label}}` : "`" + label + "`"
  );

/**
 * Turn a description into a block comment. We use the list of `schemaNames` to
 * decide whether to turn a given crate references into an `@link`.
 */
function docComment(s: string | undefined, schemaNames: string[]) {
  if (s) {
    const processed = jsdocLinkify(s, schemaNames);
    w("/**");
    for (const line of processed.split("\n")) {
      w("* " + line);
    }
    w(" */");
  }
}

function contentRef(o: Schema | OpenAPIV3.RequestBodyObject | undefined) {
  return o &&
    "content" in o &&
    o.content?.["application/json"]?.schema &&
    "$ref" in o.content["application/json"].schema
    ? o.content["application/json"].schema.$ref
    : null;
}

/**
 * `Error` is hard-coded into `http-client.ts` as `ErrorBody` so we can check
 * and test that file statically, i.e., without doing any generation. We just
 * need to make sure `ErrorBody` has not gotten out of sync with the API spec.
 * If this check fails, update both this and `ErrorBody` to match the new spec.
 *
 * The keen-eyed observer will notice there is nothing keeping _this_ check in
 * sync with `ErrorBody`. It would be hard to do that without some real
 * shenanigans since that is a type and this is runtime code.
 */
function checkErrorSchema(schema: Schema) {
  assert.deepStrictEqual(
    schema,
    {
      description: "Error information from a response.",
      type: "object",
      properties: {
        error_code: { type: "string" },
        message: { type: "string" },
        request_id: { type: "string" },
      },
      required: ["message", "request_id"],
    },
    "Error schema does not match the one hard-coded as ErrorBody in http-client.ts."
  );
}

export async function generateClient(specFile: string) {
  const spec = (await SwaggerParser.parse(specFile)) as OpenAPIV3.Document;

  if (!spec.components) return;

  w("/* eslint-disable */\n");

  fs.copyFileSync("./static/util.ts", path.resolve(destDir, "util.ts"));

  fs.copyFileSync(
    "./static/http-client.ts",
    path.resolve(destDir, "http-client.ts")
  );

  w(`import type { RequestParams } from './http-client'
    import { HttpClient } from './http-client'`);

  setupZod(io);

  w(`export type {
      ApiConfig, 
      ApiError, 
      ApiResult,
      ClientError, 
      ErrorBody,
      ErrorResult,
    } from './http-client'
    `);

  const unsortedSchemaNames = Object.keys(spec.components.schemas || {});
  const schemaDeps: [name: string, deps: string[] | undefined][] =
    unsortedSchemaNames.map((name) => [
      name,
      JSON.stringify(spec.components!.schemas![name])
        .match(/#\/components\/schemas\/[A-Za-z0-9]+/g)
        ?.map((s) => s.replace("#/components/schemas/", "")),
    ]);
  const schemaNames = topologicalSort(schemaDeps);

  for (const schemaName of schemaNames) {
    const schema = spec.components.schemas![schemaName];

    // Special case for Error type for two reasons:
    //   1) Error is already a thing in JS, so we rename to ErrorBody. This
    //      rename only works because no other types refer to this one
    //   2) We hard-code the definition of `ErrorBody` in http-client.ts, so we
    //      want to skip writing it here
    if (schemaName === "Error") {
      checkErrorSchema(schema);
      continue;
    }

    if ("description" in schema) {
      docComment(schema.description, schemaNames);
    }

    w0(`export const ${schemaName} =`);
    schemaToZod(schema, io);
    w(`export type ${schemaName} = z.infer<typeof ${schemaName}>\n`);
  }

  for (const path in spec.paths) {
    const handlers = spec.paths[path]!;
    let method: keyof typeof HttpMethods;
    for (method in HttpMethods) {
      const conf = handlers[HttpMethods[method]];
      if (!conf?.operationId) continue;

      const opName = snakeToPascal(conf.operationId);
      const params = conf.parameters;
      w(`export const ${opName}Params = z.object({`);
      for (const param of params || []) {
        if ("name" in param) {
          if (param.schema) {
            const isQuery = param.in === "query";
            const nullable =
              "nullable" in param.schema && param.schema.nullable;

            if ("description" in param.schema) {
              docComment(param.schema.description, schemaNames);
            }

            w0(`  ${processParamName(param.name)}`);
            w0(": ");
            schemaToZod(param.schema, io);
            if (isQuery) w0(".optional()");
            w(",");
          }
        }
      }
      w(`})`);
      w(`export type ${opName}Params = z.infer<typeof ${opName}Params>`);
      w("");
    }
  }

  const operations = Object.values(spec.paths)
    .map((handlers) =>
      Object.entries(handlers!)
        .filter(([method, value]) => method.toUpperCase() in HttpMethods)
        .map(([_, conf]) => conf)
    )
    .flat()
    .filter((handler) => {
      return (
        !!handler && typeof handler === "object" && "operationId" in handler
      );
    });

  // TODO: Fix this type
  const ops = operations as Exclude<
    typeof operations[number],
    | string
    | (OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject)[]
    | OpenAPIV3.ServerObject[]
  >[];

  const idRoutes = ops.filter((op) => op.operationId?.endsWith("view_by_id"));
  if (idRoutes.length > 0) {
    w(
      "export type ApiViewByIdMethods = Pick<InstanceType<typeof Api>['methods'], "
    );
    w0(
      `${idRoutes
        .map((op) => `'${snakeToCamel(op.operationId!)}'`)
        .join(" | ")}`
    );
    w(">\n");
  }

  const listRoutes = ops.filter((op) => op.operationId?.endsWith("_list"));
  if (listRoutes.length > 0) {
    w(
      "export type ApiListMethods = Pick<InstanceType<typeof Api>['methods'], "
    );
    w0(
      `${listRoutes
        .map((op) => `'${snakeToCamel(op.operationId!)}'`)
        .join(" | ")}`
    );
    w(">\n");
  }

  w(`export class Api extends HttpClient {
       methods = {`);

  for (const path in spec.paths) {
    const handlers = spec.paths[path]!;
    let method: keyof typeof HttpMethods;
    for (method in HttpMethods) {
      const conf = handlers[HttpMethods[method]];
      if (!conf?.operationId) continue;
      const methodName = snakeToCamel(conf.operationId);

      const paramsType = snakeToPascal(conf.operationId) + "Params";
      const params = conf.parameters || [];
      const pathParams = params.filter(
        (p) => "in" in p && p.in === "path"
      ) as OpenAPIV3.ParameterObject[];
      const queryParams = params.filter(
        (p) => "in" in p && p.in === "query"
      ) as OpenAPIV3.ParameterObject[];

      const bodyTypeRef = contentRef(conf.requestBody);
      const bodyType = bodyTypeRef ? refToSchemaName(bodyTypeRef) : null;

      const successResponse =
        conf.responses["200"] ||
        conf.responses["201"] ||
        conf.responses["202"] ||
        conf.responses["204"];

      const successTypeRef = contentRef(successResponse);
      const successType = successTypeRef
        ? refToSchemaName(successTypeRef)
        : "void";

      docComment(conf.summary || conf.description, schemaNames);

      w(`${methodName}: (`);
      if (pathParams.length > 0) {
        w0("{ ");
        const params = pathParams
          .map((p) => processParamName(p.name))
          .join(", ");
        w0(params);
        if (queryParams.length > 0) {
          w0(", ...query");
        }
        w(`}: ${paramsType},`);
      } else {
        w(`query: ${paramsType},`);
      }
      if (bodyType) {
        w(`body: ${bodyType},`);
      }
      w(`  params: RequestParams = {},
         ) =>
           this.request<${successType}>({
             path: ${pathToTemplateStr(path)},
             method: "${method.toUpperCase()}",`);
      if (bodyType) {
        w(`  body,`);
      }
      if (queryParams.length > 0) {
        w("  query,");
      }
      w(`    ...params,
           }),
      `);
    }
  }
  w(`  }
     }`);
  out.end();
}
