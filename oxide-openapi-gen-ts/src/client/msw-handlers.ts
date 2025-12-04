/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { OpenAPIV3 } from "openapi-types";
import { initIO } from "../io";
import { snakeToCamel, snakeToPascal } from "../util";
import { getOperations } from "./base";
import path from "node:path";
import fs from "node:fs";

const formatPath = (path: string) =>
  path.replace(/{(\w+)}/g, (n) => `:${snakeToCamel(n.slice(1, -1))}`);

export async function generateMSWHandlers(spec: OpenAPIV3.Document, destDir: string) {
  if (!spec.components) return;

  const outFile = path.resolve(destDir, "msw-handlers.ts");
  const out = fs.createWriteStream(outFile, { flags: "w" });
  const io = initIO(out);
  const { w } = io;

  w(`
    import {
      http,
      type HttpHandler,
      HttpResponse,
      type StrictResponse,
      type PathParams,
    } from "msw";
    import type { SnakeCasedPropertiesDeep as Snakify, Promisable } from "type-fest";
    import { type ZodType } from "zod/v4";
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

  const operations = getOperations(spec);

  w(`export interface MSWHandlers {`);
  for (const op of operations) {
    const opName = snakeToCamel(op.opId);
    const { pathParams, queryParams, bodyType, successType, method, path } = op;

    const body =
      bodyType && (method === "post" || method === "put")
        ? `body: Json<Api.${bodyType}>,`
        : "";
    const pathParamsType = pathParams.length
      ? `path: Api.${snakeToPascal(op.opId)}PathParams,`
      : "";
    const queryParamsType = queryParams.length
      ? `query: Api.${snakeToPascal(op.opId)}QueryParams,`
      : "";
    const params = `params: { ${pathParamsType} ${queryParamsType} ${body} req: Request, cookies: Record<string, string> }`;

    const resultType = successType
      ? `Promisable<HandlerResult<Api.${successType}>>`
      : "Promisable<StatusCode>";

    w(`/** \`${method.toUpperCase()} ${formatPath(path)}\` */`);
    w(`  ${opName}: (${params}) => ${resultType},`);
  }
  w("}");

  w(`
    function validateParams<S extends ZodType>(schema: S, req: Request, pathParams: PathParams) {
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
      const status = result.error.issues.some((e) => e.path[0] === 'path') ? 404 : 400
      const error_code = status === 404 ? 'NotFound' : 'InvalidRequest'
      const message = 'Zod error for params: ' + JSON.stringify(result.error)
      return { paramsErr: json({ error_code, message }, { status }) }
    }

    const handler = (handler: MSWHandlers[keyof MSWHandlers], 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      paramSchema: ZodType<any> | null, bodySchema: ZodType | null) => 
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
        if (paramsErr) return paramsErr;

        const { path, query } = params

        let body = undefined
        if (bodySchema) {
          const rawBody = await req.json()
          const result = bodySchema.transform(snakeify).safeParse(rawBody);
          if (!result.success) {
            const message = 'Zod error for body: ' + JSON.stringify(result.error)
            return json({ error_code: 'InvalidRequest', message }, { status: 400 })
          }
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
          if (result instanceof Response) {
            return result;
          }
          return json(result);
        } catch (thrown) {
          if (typeof thrown === 'number') {
            return new HttpResponse(null, { status: thrown });
          } 
          if (typeof thrown === "string") {
            return json({ message: thrown }, { status: 400 });
          }
          if (thrown instanceof Response) {
            return thrown;
          }
          
          // if it's not one of those, then we don't know what to do with it
          console.error('Unexpected mock error', thrown)
          if (typeof thrown === 'function') {
            console.error(
              "It looks like you've accidentally thrown an error constructor function from a mock handler without calling it!"
            )
          }
          // rethrow so everything breaks because this isn't supposed to happen
          throw thrown

        }
      }


    export function makeHandlers(
      handlers: MSWHandlers,
    ): HttpHandler[] {
      return [`);
  for (const op of operations) {
    const handler = snakeToCamel(op.opId);
    const { bodyType, method, path, pathParams, queryParams } = op;
    const bodySchema =
      bodyType && (method === "post" || method === "put")
        ? `schema.${bodyType}`
        : "null";
    const paramSchema =
      pathParams.length || queryParams.length
        ? `schema.${snakeToPascal(op.opId)}Params`
        : "null";

    w(
      `http.${method}('${formatPath(
        path
      )}', handler(handlers['${handler}'], ${paramSchema}, ${bodySchema})),`
    );
  }
  w(`]}`);
  await io.end();
}
