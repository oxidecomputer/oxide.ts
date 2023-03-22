import type { OpenAPIV3 } from "openapi-types";
import { OpenAPIV3 as O } from "openapi-types";
import { initIO } from "../io";
import { refToSchemaName } from "../schema/base";
import { snakeToCamel, snakeToPascal } from "../util";
import { contentRef, iterPathConfig } from "./base";

const io = initIO("msw-handlers.ts");
const { w } = io;

const formatPath = (path: string) =>
  path.replace(/{(\w+)}/g, (n) => `:${snakeToCamel(n.slice(1, -1))}`);

export function generateMSWHandlers(spec: OpenAPIV3.Document) {
  if (!spec.components) return;

  w("/* eslint-disable */\n");

  w(`
    import {
      compose,
      context,
      ResponseComposition,
      ResponseTransformer,
      rest,
      RestContext,
      RestHandler,
      RestRequest,
    } from "msw";
    import type { SnakeCasedPropertiesDeep as Snakify } from "type-fest";
    import { z, ZodSchema } from "zod";
    import type * as Api from "./Api";
    import { snakeify } from "./util";
    import * as schema from "./validate";

    type HandlerResult<T> = Json<T> | ResponseTransformer<Json<T>>
    type StatusCode = number

    /**
     * Custom transformer: convenience function for setting response \`status\` and/or
     * \`delay\`.
     *
     * @see https://mswjs.io/docs/basics/response-transformer#custom-transformer
     */
    export function json<B>(
      body: B,
      options: { status?: number; delay?: number } = {}
    ): ResponseTransformer<B> {
      const { status = 200, delay = 0 } = options
      return compose(context.status(status), context.json(body), context.delay(delay))
    }


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
    const params =
      pathParamsType || queryParamsType || body
        ? `params: { ${pathParamsType} ${queryParamsType} ${body} }`
        : "";

    const resultType =
      successType === "void" ? "StatusCode" : `HandlerResult<${successType}>`;

    w(`/** \`${method.toUpperCase()} ${formatPath(path)}\` */`);
    w(`  ${opName}: (${params}) => ${resultType},`);
  }
  w("}");

  w(`
    function validateBody<S extends ZodSchema>(schema: S, body: unknown) {
      const result = schema.transform(snakeify).safeParse(body);
      if (result.success) {
        return { body: result.data as Json<z.infer<S>> }
      }
      return { bodyErr: json(result.error.issues, { status: 400 }) }
    }
    function validateParams<S extends ZodSchema>(schema: S, req: RestRequest) {
      const rawParams = new URLSearchParams(req.url.search)
      const params: [string, unknown][] = []

      // Ensure numeric params like \`limit\` are parsed as numbers
      for (const [name, value] of rawParams) {
        params.push([name, isNaN(Number(value)) ? value : Number(value)])
      }

      const result = schema.safeParse({
        path: req.params,
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
      async (req: RestRequest, res: ResponseComposition, ctx: RestContext) => {
        const { params, paramsErr } = paramSchema ? validateParams(paramSchema, req) : { params: {}, paramsErr: undefined }
        if (paramsErr) return res(paramsErr)

        const { path, query } = params

        const { body, bodyErr } = bodySchema ? validateBody(bodySchema, await req.json()) : { body: undefined, bodyErr: undefined }
        if (bodyErr) return res(bodyErr)

        try {
          // TypeScript can't narrow the handler down because there's not an explicit relationship between the schema
          // being present and the shape of the handler API. The type of this function could be resolved such that the
          // relevant schema is required if and only if the handler has a type that matches the inferred schema
          const result = await (handler as any).apply(null, [{path, query, body}])
          if (typeof result === "number") {
            return res(ctx.status(result))
          }
          if (typeof result === "function") {
            return res(result as ResponseTransformer)
          }
          return res(json(result))
        } catch (thrown) {
          if (typeof thrown === 'number') {
            return res(ctx.status(thrown))
          } 
          if (typeof thrown === "function") {
            return res(thrown as ResponseTransformer)
          }
          if (typeof thrown === "string") {
            return res(json({ message: thrown }, { status: 400 }))
          }
          console.error('Unexpected mock error', thrown)
          return res(json({ message: 'Unknown Server Error' }, { status: 500 }))
        }
      }


    export function makeHandlers(
      handlers: MSWHandlers, 
    ): RestHandler[] {
      return [`);
  for (const { path, method, opId, conf } of iterPathConfig(spec.paths)) {
    const handler = snakeToCamel(opId);
    const bodyTypeRef = contentRef(conf.requestBody);
    const bodySchema =
      bodyTypeRef && (method === "post" || method === "put")
        ? `schema.${refToSchemaName(bodyTypeRef)}`
        : "null";
    const paramSchema = !!conf.parameters?.length
      ? `schema.${snakeToPascal(opId)}Params`
      : "null";

    w(
      `rest.${method}('${formatPath(
        path
      )}', handler(handlers['${handler}'], ${paramSchema}, ${bodySchema})),`
    );
  }
  w(`]}`);
}
