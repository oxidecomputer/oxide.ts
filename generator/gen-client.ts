import type { OpenAPIV3 } from "openapi-types";
import { OpenAPIV3 as O } from "openapi-types";
const HttpMethods = O.HttpMethods;
import SwaggerParser from "@apidevtools/swagger-parser";
import fs from "fs";
import path from "path";

const destDir = process.argv[3];

const out = destDir
  ? fs.createWriteStream(path.resolve(process.cwd(), destDir, "Api.ts"))
  : (process.stdout as unknown as fs.WriteStream);

const snakeTo = (fn: (w: string, i: number) => string) => (s: string) =>
  s.split("_").map(fn).join("");

const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : "");

export const snakeToPascal = snakeTo(cap);
export const snakeToCamel = snakeTo((w, i) => (i > 0 ? cap(w) : w));

export const pascalToCamel = (s: string) =>
  s ? s[0].toLowerCase() + s.slice(1) : s;

// HACK: we will probably do this rename in Nexus at some point because
// "organization" is really long. Luckily it is only ever used as an
// interpolated variable in request paths, so renaming it is fine as long
// as we do it everywhere.
const toOrgName = (s: string) => s.replace("organization_name", "org_name");

const processParamName = (s: string) => snakeToCamel(toOrgName(s));

/** write to file with newline */
function w(s: string) {
  out.write(s + "\n");
}

/** same as w() but no newline */
function w0(s: string) {
  out.write(s);
}

/** `{project_name}` -> `${projectName}`. if no brackets, leave it alone */
const segmentToInterpolation = (s: string) =>
  s.startsWith("{") ? `\$\{${processParamName(s.slice(1, -1))}\}` : s;

export const pathToTemplateStr = (s: string) =>
  "`" + s.split("/").map(segmentToInterpolation).join("/") + "`";

const refToSchemaName = (s: string) => s.replace("#/components/schemas/", "");

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

type Schema = OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;

type SchemaToTypeOpts = {
  propsInline?: boolean;
  name?: string;
  schemaNames?: string[]; // only here to pass to docComment
};

function schemaToType(schema: Schema, opts: SchemaToTypeOpts = {}) {
  if ("$ref" in schema) {
    w0(refToSchemaName(schema.$ref));
    return;
  }

  if (schema.type === "string") {
    if (schema.enum) {
      if (schema.enum.length === 1) {
        w0(`'${schema.enum[0]}'`);
      } else {
        for (const item of schema.enum) {
          w(`  | "${item}"`);
        }
      }
    } else if (
      schema.format === "date-time" &&
      opts.name?.startsWith("time_")
    ) {
      w0("Date");
    } else {
      w0("string");
    }
  } else if (schema.oneOf) {
    for (const prop of schema.oneOf) {
      w0("  | ");
      schemaToType(prop, { ...opts, propsInline: true });
    }
  } else if (schema.type === "array") {
    schemaToType(schema.items, opts);
    w0("[]");
  } else if (schema.allOf && schema.allOf.length === 1) {
    schemaToType(schema.allOf[0], opts);
  } else if (schema.type === "integer" || schema.type === "number") {
    w0("number");
  } else if (schema.type === "boolean") {
    w0("boolean");
  } else if (schema.type === "object") {
    if (
      schema.additionalProperties &&
      typeof schema.additionalProperties === "object"
    ) {
      w0("Record<string, ");
      schemaToType(schema.additionalProperties, opts);
      w0(">");
    } else {
      // hack for getting cute inline object types for unions
      const suffix = opts.propsInline ? "" : "\n";
      w0("{ " + suffix);
      for (const propName in schema.properties) {
        const prop = schema.properties[propName];
        const nullable =
          ("nullable" in prop && prop.nullable) ||
          !schema.required ||
          !schema.required.includes(propName);

        if ("description" in prop) {
          docComment(prop.description, opts.schemaNames || []);
        }

        w0(snakeToCamel(propName));
        if (nullable) w0("?");
        w0(": ");
        schemaToType(prop, { ...opts, name: propName });
        if (nullable) w0(" | null");
        w0(", " + suffix);
      }
      w(" }");
    }
  } else if (typeof schema === "object" && Object.keys(schema).length === 0) {
    w0("any");
  } else {
    const err = { name: opts.name, schema };
    throw Error(`UNHANDLED SCHEMA: ${JSON.stringify(err, null, 2)}`);
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

export async function generateClient(specFile: string) {
  const spec = (await SwaggerParser.parse(specFile)) as OpenAPIV3.Document;

  if (!spec.components) return;

  w("/* eslint-disable */\n");

  const schemaNames = Object.keys(spec.components.schemas || {});

  for (const schemaName in spec.components.schemas) {
    const schema = spec.components.schemas[schemaName];
    if ("description" in schema) {
      docComment(schema.description, schemaNames);
    }

    // Special case for Error type because Error is already thing in JS.
    // Important: this rename only works because no other types refer to this
    // one
    if (schemaName === "Error") {
      w0(`export type ErrorBody =`);
    } else {
      w0(`export type ${schemaName} =`);
    }

    schemaToType(schema, { schemaNames });
    w("\n");

    if ("type" in schema && schema.type === "string" && schema.pattern) {
      w(`/** Regex pattern for validating ${schemaName} */`);
      w(`export const ${pascalToCamel(schemaName)}Pattern = `);
      // make pattern a string for now because one of them doesn't actually
      // parse as a regex. consider changing to `/${pattern}/` once fixed
      w(`"${schema.pattern}"\n`);
    }
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
            const nullable =
              "nullable" in param.schema && param.schema.nullable;

            if ("description" in param.schema) {
              docComment(param.schema.description, schemaNames);
            }

            w0(`  ${processParamName(param.name)}`);
            if (nullable || isQuery) w0("?");
            w0(": ");
            schemaToType(param.schema, { schemaNames });
            if (nullable) w0(" | null");
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

  // HACK: in order to make utils testable without polluting the generated
  // client's exports, we have exports in the file but strip them out here
  w(
    fs
      .readFileSync("./base/util.ts")
      .toString()
      .replace(/export /g, "")
  );
  w(fs.readFileSync("./base/client.ts").toString());

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
