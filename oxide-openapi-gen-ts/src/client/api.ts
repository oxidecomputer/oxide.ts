/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import fs from "node:fs";
import assert from "node:assert";
import { fileURLToPath } from "node:url";
import path from "node:path";

import type { OpenAPIV3 } from "openapi-types";
import {
  extractDoc,
  pathToTemplateStr,
  processParamName,
  snakeToCamel,
  snakeToPascal,
} from "../util";
import { type IO, initIO } from "../io";
import type { Schema } from "../schema/base";
import {
  type Param,
  docComment,
  getSortedSchemas,
  getOperations,
} from "./base";
import { schemaToTypes } from "../schema/types";

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

/**
 * Generate the type annotations for path and query params in a method signature.
 * Query params are marked optional only if there are no required params.
 */
function genParamTypes(
  pathParams: Param[],
  queryParams: Param[],
  opNameType: string,
  io: IO
) {
  if (pathParams.length > 0) {
    io.w(`path: ${pathParamsType(opNameType)},`);
  }
  if (queryParams.length > 0) {
    io.w0("query");
    if (!queryParams.some((p) => p.required)) io.w0("?");
    io.w(`: ${queryParamsType(opNameType)},`);
  }
}

/**
 * Source file is a relative path that we resolve relative to this
 * file, not the CWD or package root
 */
function copyFile(sourceRelPath: string, destDirAbs: string) {
  const thisFileDir = path.dirname(fileURLToPath(import.meta.url));
  const sourceAbsPath = path.resolve(thisFileDir, sourceRelPath);
  const destAbs = path.resolve(destDirAbs, path.basename(sourceRelPath));
  fs.copyFileSync(sourceAbsPath, destAbs);
}

export function copyStaticFiles(destDir: string) {
  copyFile("./static/util.ts", destDir);
  copyFile("./static/http-client.ts", destDir);
}

function genParamsInterface(
  params: Param[],
  interfaceName: string,
  schemaNames: string[],
  io: IO
) {
  io.w(`export interface ${interfaceName} {`);
  for (const param of params) {
    if ("description" in param.schema || "title" in param.schema) {
      docComment(extractDoc(param.schema), schemaNames, io);
    }
    io.w0(`  ${processParamName(param.name)}`);
    if (!param.required) io.w0("?");
    io.w0(": ");
    schemaToTypes(param.schema, io);
    io.w(",");
  }
  io.w("}\n");
}

export async function generateApi(spec: OpenAPIV3.Document, destDir: string) {
  if (!spec.components) return;

  const outFile = path.resolve(destDir, "Api.ts");
  const out = fs.createWriteStream(outFile, { flags: "w" });
  const io = initIO(out);
  const { w, w0 } = io;

  w(`/* eslint-disable */

    import type { FetchParams, FullParams, ApiResult } from "./http-client";
    import { dateReplacer, handleResponse, mergeParams, toQueryString } from './http-client'
    import { snakeify } from './util'

    export type { ApiResult, ErrorBody, ErrorResult } from './http-client'
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

  const operations = getOperations(spec);

  // Generate separate path and query param types
  for (const op of operations) {
    const opName = snakeToPascal(op.opId);
    if (op.pathParams.length > 0) {
      genParamsInterface(op.pathParams, pathParamsType(opName), schemaNames, io);
    }
    if (op.queryParams.length > 0) {
      genParamsInterface(op.queryParams, queryParamsType(opName), schemaNames, io);
    }
  }

  w("type EmptyObj = Record<string, never>;");

  w(`export interface ApiConfig {
      /**
       * No host means requests will be sent to the current host. This is used in
       * the web console.
       */
      host?: string;
      token?: string;
      baseParams?: FetchParams;
    }

    export class Api {
      host: string;
      token?: string;
      baseParams: FetchParams;
      /**
       * Pulled from info.version in the OpenAPI schema. Sent in the
       * \`api-version\` header on all requests.
       */
      apiVersion = "${spec.info.version}";

      constructor({ host = "", baseParams = {}, token }: ApiConfig = {}) {
        this.host = host;
        this.token = token;

        const headers = new Headers({
          "Content-Type": "application/json",
          "api-version": this.apiVersion,
        });

        if (token) headers.append("Authorization", \`Bearer \${token}\`);

        this.baseParams = mergeParams({ headers }, baseParams);
      }

      public async request<Data>({
        body,
        path,
        query,
        host,
        ...fetchParams
      }: FullParams): Promise<ApiResult<Data>> {
        const url = (host || this.host) + path + toQueryString(query);
        const init = {
          ...mergeParams(this.baseParams, fetchParams),
          body: JSON.stringify(snakeify(body), dateReplacer),
        };
        return handleResponse(await fetch(url, init));
      }
       
      methods = {`);

  for (const op of operations) {
    // websockets handled in the next loop
    if (op.isWebSocket) continue;

    const methodName = snakeToCamel(op.opId);
    const methodNameType = snakeToPascal(op.opId);
    const { pathParams, queryParams, bodyType, successType } = op;

    docComment(op.doc, schemaNames, io);

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

      genParamTypes(pathParams, queryParams, methodNameType, io);
      if (bodyType) w(`body: ${bodyType},`);
      w("},");
    } else {
      w("_: EmptyObj,");
    }

    w(`params: FetchParams = {}) => {
         return this.request<${successType || "void"}>({
           path: ${pathToTemplateStr(op.path)},
           method: "${op.method.toUpperCase()}",`);
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
  for (const op of operations) {
    if (!op.isWebSocket) continue;

    const methodName = snakeToCamel(op.opId);
    const methodNameType = snakeToPascal(op.opId);
    const { pathParams, queryParams } = op;

    docComment(op.doc, schemaNames, io);

    w0(`${methodName}: (`);

    w(`{ `);
    w(" host, secure = true,");
    if (pathParams.length > 0) w0("path, ");
    if (queryParams.length > 0) {
      w0("query");
      if (!queryParams.some((p) => p.required)) w0(" = {}");
      w0(", ");
    }
    w0("}: {");
    w("  host: string, secure?: boolean,");
    genParamTypes(pathParams, queryParams, methodNameType, io);
    w("},");

    // websocket endpoints can't use normal fetch so we return a WebSocket
    w(`) => {
        const protocol = secure ? 'wss:' : 'ws:'
        const route = ${pathToTemplateStr(op.path)}`);
    w0(`return new WebSocket(protocol + '//' + host + route`);
    if (queryParams.length > 0) w0(`+ toQueryString(query)`);
    w(`);
     },`);
  }

  w(`  }
     }

   export default Api;`);
  await io.end();
}
