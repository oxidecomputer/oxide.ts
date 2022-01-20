import type { OpenAPIV3 } from "openapi-types";
import { OpenAPIV3 as O } from "openapi-types";
const HttpMethods = O.HttpMethods;
import SwaggerParser from "@apidevtools/swagger-parser";
import fs from "fs";

const snakeTo = (fn: (w: string, i: number) => string) => (s: string) =>
  s.split("_").map(fn).join("");

const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : "");

const snakeToPascal = snakeTo(cap);
const snakeToCamel = snakeTo((w, i) => (i > 0 ? cap(w) : w));

function startFile() {
  fs.writeFileSync("../Api.ts", "");
}

/// write to file with newline
function w(s: string) {
  fs.writeFileSync("../Api.ts", s + "\n", { flag: "a+" });
}

/// same as w() but no newline
function w0(s: string) {
  fs.writeFileSync("../Api.ts", s, { flag: "a+" });
}

const commentizeMultiline = (s: string, prefix: string = " ") =>
  s
    .split("\n")
    .map((line) => prefix + "* " + line)
    .join("\n");

/// {project_name} -> ${projectName}. if no brackets, leave it alone
const segmentToInterpolation = (s: string) =>
  s.startsWith("{") ? `\$\{${snakeToCamel(s.slice(1, -1))}\}` : s;

const pathToTemplateStr = (s: string) =>
  "`" + s.split("/").map(segmentToInterpolation).join("/") + "`";

const refToSchemaName = (s: string) => s.replace("#/components/schemas/", "");

function docComment(description: string) {
  w("/**");
  w(commentizeMultiline(description));
  w(" */");
}

type Schema = OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;

function schemaToType(schema: Schema, propsInline = false) {
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
    } else {
      w0("string");
    }
  } else if (schema.type === "array") {
    schemaToType(schema.items);
    w0("[]");
  } else if (schema.allOf && schema.allOf.length === 1) {
    schemaToType(schema.allOf[0]);
  } else if (schema.type === "integer") {
    w0(`number`);
  } else if (schema.type === "object") {
    // hack for getting cute inline object types for unions
    const suffix = propsInline ? "" : "\n";
    w0("{ " + suffix);
    for (const propName in schema.properties) {
      const prop = schema.properties[propName];
      if ("description" in prop && prop.description) {
        docComment(prop.description);
      }
      w0(propName);

      const nullable =
        ("nullable" in prop && prop.nullable) ||
        !schema.required ||
        !schema.required.includes(propName);
      if (nullable) w0("?");
      w0(": ");
      schemaToType(prop);
      if (nullable) w0("| null");
      w0(", " + suffix);
    }
    w(" }");
  } else if (typeof schema === "object" && Object.keys(schema).length === 0) {
    w0("any");
  } else {
    w0(`/* UNHANDLED SCHEMA */`);
    console.log(schema);
  }
}

function contentRef(o: Schema | OpenAPIV3.RequestBodyObject | undefined) {
  return o &&
    "content" in o &&
    o.content?.["application/json"].schema &&
    "$ref" in o.content["application/json"].schema
    ? o.content["application/json"].schema.$ref
    : null;
}

async function generateClient() {
  startFile();

  const spec = (await SwaggerParser.parse(
    "../spec.json",
  )) as OpenAPIV3.Document;
  // console.log(spec);

  if (!spec.components) return;

  w("/* eslint-disable */\n");

  for (const schemaName in spec.components.schemas) {
    const schema = spec.components.schemas[schemaName];
    if ("$ref" in schema) {
      w0(`export interface ${schemaName} `);
      schemaToType(schema);
      continue;
    }

    if (schema.description) {
      docComment(schema.description);
    }

    if (schema.type === "object") {
      w0(`export interface ${schemaName} `);
      schemaToType(schema);
      w("");
      continue;
    }

    w0(`export type ${schemaName} =`);
    if (schema.oneOf) {
      for (const prop of schema.oneOf) {
        w0("  | ");
        schemaToType(prop, true);
      }
      w("");
      continue;
    }

    schemaToType(schema);
    w("\n");
  }

  for (const path in spec.paths) {
    const handlers = spec.paths[path]!;
    let method: keyof typeof HttpMethods;
    for (method in HttpMethods) {
      const conf = handlers[HttpMethods[method]];
      if (!conf?.operationId) continue;

      const opName = snakeToPascal(conf.operationId);
      const params = conf.parameters;
      // console.log(path, opName, method);
      w(`export interface ${opName}Params {`);
      for (const param of params || []) {
        // console.log(param);
        // TODO: call objectSchema probably
        if ("name" in param) {
          if (param.schema) {
            if ("description" in param.schema && param.schema.description) {
              docComment(param.schema.description);
            }
            w0(`  ${snakeToCamel(param.name)}`);
            const isQuery = param.in === "query";
            const nullable =
              "nullable" in param.schema && param.schema.nullable;
            if (nullable || isQuery) w0("?");
            w0(": ");
            schemaToType(param.schema);
            if (nullable) w0(" | null");
            w(",\n");
          }
        }
      }
      w(`}`);
      w("");
    }
  }

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
        (p) => "in" in p && p.in === "path",
      ) as OpenAPIV3.ParameterObject[];
      const queryParams = params.filter(
        (p) => "in" in p && p.in === "query",
      ) as OpenAPIV3.ParameterObject[];

      const bodyTypeRef = contentRef(conf.requestBody);
      const bodyType = bodyTypeRef ? refToSchemaName(bodyTypeRef) : null;

      const successResponse =
        conf.responses["200"] || conf.responses["201"] || conf.responses["202"];

      const successTypeRef = contentRef(successResponse);
      const successType = successTypeRef
        ? refToSchemaName(successTypeRef)
        : "void";

      if (conf.description) {
        docComment(conf.description);
      }

      w(`${methodName}: (`);
      if (pathParams.length > 0) {
        w0("{ ");
        w0(pathParams.map((p) => snakeToCamel(p.name)).join(", "));
        if (queryParams.length > 0) {
          w0(", ...query");
        }
        w(`}: ${paramsType},`);
      } else {
        w(`query: ${paramsType},`);
      }
      if (bodyType) {
        w(`data: ${bodyType},`);
      }
      w(`  params: RequestParams = {},
         ) =>
           this.request<${successType}, any>({
             path: ${pathToTemplateStr(path)},
             method: "${method.toUpperCase()}",`);
      if (bodyType) {
        w(`  body: data,`);
      }
      if (queryParams.length > 0) {
        w("  query: query,");
      }
      w(`    ...params,
           }),
      `);
    }
  }
  w(`  }
     }`);
}

generateClient();
