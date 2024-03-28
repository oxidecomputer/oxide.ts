/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { OpenAPIV3 } from "openapi-types";
import { OpenAPIV3 as O } from "openapi-types";
const HttpMethods = O.HttpMethods;
import fs from "fs";
import assert from "assert";
import {
  extractDoc,
  pathToTemplateStr,
  processParamName,
  snakeToCamel,
  snakeToPascal,
} from "../util";
import { initIO } from "../io";
import type { Schema } from "../schema/base";
import { refToSchemaName } from "../schema/base";
import {
  contentRef,
  docComment,
  getSortedSchemas,
  iterParams,
  iterPathConfig,
} from "./base";
import { schemaToTypes } from "../schema/types";
import path from "path";

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

const queryParamsType = (opId: string) => `${opId}QueryParams`;
const pathParamsType = (opId: string) => `${opId}PathParams`;

function copyFile(file: string, destDir: string) {
  const dest = path.resolve(destDir, path.basename(file));
  fs.copyFileSync(file, dest);
}

export function generateApi(spec: OpenAPIV3.Document, destDir: string) {
  if (!spec.components) return;

  const io = initIO("Api.ts", destDir);
  const { w, w0, out } = io;

  w("/* eslint-disable */\n");

  w(`
    /**
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, you can obtain one at https://mozilla.org/MPL/2.0/.
     *
     * Copyright Oxide Computer Company
     */
  `);

  copyFile("./static/util.ts", destDir);
  copyFile("./static/http-client.ts", destDir);

  w(`import type { FetchParams } from './http-client'
    import { HttpClient, toQueryString } from './http-client'`);

  w(`export type {
      ApiConfig, 
      ApiResult,
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
      docComment(extractDoc(schema), schemaNames, io);
    }

    w(`export type ${schemaName} =`);
    schemaToTypes(schema, io);
    w(";\n");
  }

  // To generate separate path and query params
  for (const { params, opId } of iterParams(spec.paths)) {
    const opName = snakeToPascal(opId);
    const [pathParams, queryParams] = params;
    if (pathParams.length > 0) {
      w(`export interface ${pathParamsType(opName)} {`);
      for (const param of pathParams) {
        if ("description" in param.schema || "title" in param.schema) {
          docComment(extractDoc(param.schema), schemaNames, io);
        }
        w0(`  ${processParamName(param.name)}:`);
        schemaToTypes(param.schema, io);
        w(",");
      }
      w("}\n");
    }

    if (queryParams.length > 0) {
      w(`export interface ${queryParamsType(opName)} {`);
      for (const param of queryParams) {
        if ("description" in param.schema || "title" in param.schema) {
          docComment(extractDoc(param.schema), schemaNames, io);
        }

        w0(`  ${processParamName(param.name)}`);
        if (!param.required) w0("?");
        w0(": ");
        schemaToTypes(param.schema, io);
        w(",");
      }
      w("}\n");
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

  const listRoutes = ops.filter((op) => op.operationId?.match(/_list(_v1)?$/));
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

  w("type EmptyObj = Record<string, never>;");

  w(`export class Api extends HttpClient {
       methods = {`);

  for (const { conf, opId, method, path } of iterPathConfig(spec.paths)) {
    // websockets handled in the next loop
    if ("x-dropshot-websocket" in conf) continue;

    const methodName = snakeToCamel(opId);
    const methodNameType = snakeToPascal(opId);

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

    w0(`${methodName}: (`);

    if (pathParams.length > 0 || queryParams.length > 0 || bodyType) {
      w(`{ `);
      if (pathParams.length > 0) w0("path, ");
      if (queryParams.length > 0) {
        w0("query");
        // we can only default to empty object if there are no required params
        if (!queryParams.some((p) => p.required)) w0(" = {}");
        w0(", ");
      }
      if (bodyType) w0("body, ");
      w0("}: {");

      if (pathParams.length > 0) {
        w(`path: ${pathParamsType(methodNameType)},`);
      }

      if (queryParams.length > 0) {
        w(`query?: ${queryParamsType(methodNameType)},`);
      }
      if (bodyType) w(`body: ${bodyType},`);
      w("},");
    } else {
      w("_: EmptyObj,");
    }

    w(`params: FetchParams = {}) => {
         return this.request<${successType}>({
           path: ${pathToTemplateStr(path)},
           method: "${method.toUpperCase()}",`);
    if (bodyType) {
      w(`  body,`);
    }
    if (queryParams.length > 0) {
      w("  query,");
    }
    w(`  ...params,
         })
      },`);
  }

  w(`}
     ws = {`);

  // handle websockets endpoints separately so api.methods keep consistent
  // return types
  for (const { conf, opId, path } of iterPathConfig(spec.paths)) {
    if (!("x-dropshot-websocket" in conf)) continue;

    const methodName = snakeToCamel(opId);
    const methodNameType = snakeToPascal(opId);

    const params = conf.parameters || [];
    const pathParams = params.filter(
      (p) => "in" in p && p.in === "path"
    ) as OpenAPIV3.ParameterObject[];
    const queryParams = params.filter(
      (p) => "in" in p && p.in === "query"
    ) as OpenAPIV3.ParameterObject[];

    docComment(conf.summary || conf.description, schemaNames, io);

    w0(`${methodName}: (`);

    w(`{ `);
    w(" host, secure = true,");
    if (pathParams.length > 0) w0("path, ");
    if (queryParams.length > 0) w0("query = {}, ");
    w0("}: {");
    w("  host: string, secure?: boolean,");

    if (pathParams.length > 0) {
      w(`path: ${pathParamsType(methodNameType)},`);
    }

    if (queryParams.length > 0) {
      w(`query?: ${queryParamsType(methodNameType)},`);
    }
    w("},");

    // websocket endpoints can't use normal fetch so we return a WebSocket
    w(`) => {
        const protocol = secure ? 'wss:' : 'ws:'
        const route = ${pathToTemplateStr(path)}`);
    w0(`return new WebSocket(protocol + '//' + host + route`);
    if (queryParams.length > 0) w0(`+ toQueryString(query)`);
    w(`);
     },`);
  }

  w(`  }
     }`);
  out.end();
}
