import type { OpenAPIV3 } from "openapi-types";
import { OpenAPIV3 as O } from "openapi-types";
const HttpMethods = O.HttpMethods;
import assert from "assert";
import {
  pathToTemplateStr,
  processParamName,
  snakeToCamel,
  snakeToPascal,
} from "../util";
import { initIO } from "../io";
import { refToSchemaName, Schema } from "../schema/base";
import { contentRef, docComment, getSortedSchemas } from "./base";
import { schemaToTypes } from "../schema/types";

const io = initIO("Api.ts");
const { w, w0, out, copy } = io;

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

export function generateApi(spec: OpenAPIV3.Document) {
  if (!spec.components) return;

  w("/* eslint-disable */\n");

  copy("./static/util.ts");
  copy("./static/http-client.ts");

  w(`import type { RequestParams } from './http-client'
    import { HttpClient } from './http-client'`);

  w(`export type {
      ApiConfig, 
      ApiError, 
      ApiResult,
      ClientError, 
      ErrorBody,
      ErrorResult,
    } from './http-client'
    `);

  const schemaNames = getSortedSchemas(spec);
  for (const schemaName of schemaNames) {
    const schema = spec.components!.schemas![schemaName];
    // Special case for Error type for two reasons:
    //   1) Error is already a thing in JS, so we rename to ErrorBody. This
    //      rename only works because no other types refer to this one
    //   2) We hard-code the definition of `ErrorBody` in http-client.ts, so we
    //      want to skip writing it here
    if (schemaName === "Error") {
      checkErrorSchema(schema);
      continue;
    }

    if ("description" in schema || "title" in schema) {
      docComment(
        [schema.title, schema.description].filter((n) => n).join("\n\n"),
        schemaNames,
        io
      );
    }

    w(`export type ${schemaName} =`);
    schemaToTypes(schema, io);
    w(";\n");
  }

  for (const path in spec.paths) {
    const handlers = spec.paths[path]!;
    let method: keyof typeof HttpMethods;
    for (method in HttpMethods) {
      const conf = handlers[HttpMethods[method]];
      if (!conf?.operationId) continue;

      const opName = snakeToPascal(conf.operationId);
      const params = conf.parameters;
      w(`export interface ${opName}Params {`);
      for (const param of params || []) {
        if ("name" in param) {
          if (param.schema) {
            const isQuery = param.in === "query";
            if ("description" in param.schema || "title" in param.schema) {
              docComment(
                [param.schema.title, param.schema.description]
                  .filter((n) => n)
                  .join("\n\n"),
                schemaNames,
                io
              );
            }

            w0(`  ${processParamName(param.name)}`);
            w0(`${isQuery ? "?" : ""}: `);
            schemaToTypes(param.schema, io);
            w(",");
          }
        }
      }
      w(`}`);
      w("");
    }
  }

  const operations = Object.values(spec.paths)
    .map((handlers) =>
      Object.entries(handlers!)
        .filter(([method]) => method.toUpperCase() in HttpMethods)
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

  w("export type ApiPaths =");
  for (const path in spec.paths) {
    w(
      `  | '${path.replace(
        /{(\w+)}/g,
        (n) => `:${snakeToCamel(n.slice(1, -1)).replace("organization", "org")}`
      )}'`
    );
  }
  w("\n");

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

      docComment(conf.summary || conf.description, schemaNames, io);

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
