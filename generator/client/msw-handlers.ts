/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { OpenAPIV3 } from "openapi-types";
import { initIO } from "../io";
import { refToSchemaName } from "../schema/base";
import { snakeToCamel, snakeToPascal } from "../util";
import { contentRef, iterPathConfig } from "./base";
import path from "node:path";
import fs from "node:fs";

const formatPath = (path: string) =>
  path.replace(/{(\w+)}/g, (n) => `:${snakeToCamel(n.slice(1, -1))}`);

export function generateMSWHandlers(spec: OpenAPIV3.Document, destDir: string) {
  if (!spec.components) return;

  const outFile = path.resolve(destDir, "msw-handlers.ts");
  const out = fs.createWriteStream(outFile, { flags: "w" });
  const io = initIO(out);
  const { w } = io;

  w(`
    /**
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, you can obtain one at https://mozilla.org/MPL/2.0/.
     *
     * Copyright Oxide Computer Company
     */

    import {
      http,
      type HttpHandler,
      HttpResponse,
      type StrictResponse,
      type PathParams,
    } from "msw";
    import type { SnakeCasedPropertiesDeep as Snakify, Promisable } from "type-fest";
    import { type ZodSchema } from "zod";
    import type * as Api from "./Api";
    import { snakeify } from "./util";
    import * as schema from "./validate";

    type HandlerResult<T> = Json<T> | StrictResponse<Json<T>>;
    type StatusCode = number

    // these are used for turning our nice JS-ified API types back into the original
    // API JSON types (snake cased and dates as strings) for use in our mock API

    type StringifyDates<T> = T extends Date
      ? string
      : {
          [K in keyof T]: T[K] extends Array<infer U>
            ? Array<StringifyDates<U>>
            : StringifyDates<T[K]>
        }

    /**
     * Snake case fields and convert dates to strings. Not intended to be a general
     * purpose JSON type!
     */
    export type Json<B> = Snakify<StringifyDates<B>>
    export const json = HttpResponse.json


    // Shortcut to reduce number of imports required in consumers
    export { HttpResponse }
  `);

  w(`export interface MSWHandlers {`);
  for (const { conf, method, opId, path } of iterPathConfig(spec.paths)) {
    const opName = snakeToCamel(opId);

    const successResponse =
      conf.responses["200"] ||
      conf.responses["201"] ||
      conf.responses["202"] ||
      conf.responses["204"];

    const successTypeRef = contentRef(successResponse);
    const successType = successTypeRef
      ? "Api." + refToSchemaName(successTypeRef)
      : "void";

    const bodyTypeRef = contentRef(conf.requestBody);
    const bodyType = bodyTypeRef ? refToSchemaName(bodyTypeRef) : null;
    const body =
      bodyType && (method === "post" || method === "put")
        ? `body: Json<Api.${bodyType}>,`
        : "";
    const pathParams = conf.parameters?.filter(
      (param) => "name" in param && param.schema && param.in === "path"
    );
    const queryParams = conf.parameters?.filter(
      (param) => "name" in param && param.schema && param.in === "query"
    );
    const pathParamsType = pathParams?.length
      ? `path: Api.${snakeToPascal(opId)}PathParams,`
      : "";
    const queryParamsType = queryParams?.length
      ? `query: Api.${snakeToPascal(opId)}QueryParams,`
      : "";
    const params = `params: { ${pathParamsType} ${queryParamsType} ${body} req: Request, cookies: Record<string, string> }`;

    const resultType =
      successType === "void"
        ? "Promisable<StatusCode>"
        : `Promisable<HandlerResult<${successType}>>`;

    w(`/** \`${method.toUpperCase()} ${formatPath(path)}\` */`);
    w(`  ${opName}: (${params}) => ${resultType},`);
  }
  w("}");

  w(`
    function validateParams<S extends ZodSchema>(schema: S, req: Request, pathParams: PathParams) {
      const rawParams = new URLSearchParams(new URL(req.url).search)
      const params: [string, unknown][] = []

      // Ensure numeric params like \`limit\` are parsed as numbers
      for (const [name, value] of rawParams) {
        params.push([name, isNaN(Number(value)) ? value : Number(value)])
      }

      const result = schema.safeParse({
        path: pathParams,
        query: Object.fromEntries(params),
      })

      if (result.success) {
        return { params: result.data }
      }

      // if any of the errors come from path params, just 404 — the resource cannot
      // exist if there's no valid name
      const { issues } = result.error
      const status = issues.some(e => e.path[0] === 'path') ? 404 : 400
      return { paramsErr: json(issues, { status }) }
    }

    const handler = (handler: MSWHandlers[keyof MSWHandlers], paramSchema: ZodSchema | null, bodySchema: ZodSchema | null) => 
      async ({
        request: req,
        params: pathParams,
        cookies
      }: {
        request: Request;
        params: PathParams;
        cookies: Record<string, string | string[]>;
      }) => {
        const { params, paramsErr } = paramSchema
          ? validateParams(paramSchema, req, pathParams)
          : { params: {}, paramsErr: undefined };
        if (paramsErr) return json(paramsErr, { status: 400 });

        const { path, query } = params

        let body = undefined
        if (bodySchema) {
          const rawBody = await req.json()
          const result = bodySchema.transform(snakeify).safeParse(rawBody);
          if (!result.success) return json(result.error.issues, { status: 400 })
          body = result.data
        }

        try {
          // TypeScript can't narrow the handler down because there's not an explicit relationship between the schema
          // being present and the shape of the handler API. The type of this function could be resolved such that the
          // relevant schema is required if and only if the handler has a type that matches the inferred schema
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const result = await (handler as any).apply(null, [{path, query, body, req, cookies}])
          if (typeof result === "number") {
            return new HttpResponse(null, { status: result });
          }
          if (typeof result === "function") {
            return result();
          }
          if (result instanceof Response) {
            return result;
          }
          return json(result);
        } catch (thrown) {
          if (typeof thrown === 'number') {
            return new HttpResponse(null, { status: thrown });
          } 
          if (typeof thrown === "function") {
            return thrown();
          }
          if (typeof thrown === "string") {
            return json({ message: thrown }, { status: 400 });
          }
          if (thrown instanceof Response) {
            return thrown;
          }
          console.error('Unexpected mock error', thrown)
          return json({ message: "Unknown Server Error" }, { status: 500 });
        }
      }


    export function makeHandlers(
      handlers: MSWHandlers, 
    ): HttpHandler[] {
      return [`);
  for (const { path, method, opId, conf } of iterPathConfig(spec.paths)) {
    const handler = snakeToCamel(opId);
    const bodyTypeRef = contentRef(conf.requestBody);
    const bodySchema =
      bodyTypeRef && (method === "post" || method === "put")
        ? `schema.${refToSchemaName(bodyTypeRef)}`
        : "null";
    const paramSchema = conf.parameters?.length
      ? `schema.${snakeToPascal(opId)}Params`
      : "null";

    w(
      `http.${method}('${formatPath(
        path
      )}', handler(handlers['${handler}'], ${paramSchema}, ${bodySchema})),`
    );
  }
  w(`]}`);
}
