import type { OpenAPIV3 } from "openapi-types";
import { OpenAPIV3 as O } from "openapi-types";
import { match } from "ts-pattern";
import { initIO } from "../io";
import { refToSchemaName } from "../schema/base";
import { snakeToCamel, snakeToPascal } from "../util";
import { contentRef, iterPathConfig } from "./base";

const HttpMethods = O.HttpMethods;

const io = initIO("msw-handlers.ts");
const { w, w0, out, copy } = io;

const formatPath = (path: string) =>
  path.replace(
    /{(\w+)}/g,
    (n) => `:${snakeToCamel(n.slice(1, -1)).replace("organization", "org")}`
  );

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

    type MaybePromise<T> = T | Promise<T>

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
        ? `body: Json<Api.${bodyType}>`
        : "";
    const params = conf.parameters?.length
      ? `params: Api.${snakeToPascal(opId)}Params`
      : "";

    const args = [body, params].filter(Boolean).join(", ");
    const statusResult =
      successType === "void"
        ? "number | ResponseTransformer"
        : `Json<${successType}> | ResponseTransformer<Json<${successType}>>`;

    w(`/** \`${formatPath(path)}\` */`);
    w(`  ${opName}: (${args}) => MaybePromise<${statusResult}>,`);
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
        ...req.params,
        ...Object.fromEntries(params),
      })
      if (result.success) {
        return { params: result.data }
      }
      return { paramsErr: json(result.error.issues, { status: 400 }) }
    }

    const handleResult = async (res: ResponseComposition, ctx: RestContext, handler: () => MaybePromise<unknown>) => {
      try {
        const result = await handler()
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
    const bodyType = bodyTypeRef ? refToSchemaName(bodyTypeRef) : null;
    const hasBody = bodyType && (method === "post" || method === "put");
    const paramType = snakeToPascal(opId) + "Params";
    const hasParams = !!conf.parameters?.length;

    w(`rest.${method}('${formatPath(path)}', async (req, res, ctx) => {
      const handler = handlers['${handler}']`);

    if (hasParams) {
      w(`
          const { params, paramsErr } = validateParams(schema.${paramType}, req)
          if (paramsErr) return res(paramsErr)
        `);
    }

    if (hasBody) {
      w(`
          const { body, bodyErr } = validateBody(schema.${bodyType}, await req.json())
          if (bodyErr) return res(bodyErr)
        `);
    }

    w(`
      return handleResult(res, ctx, () => handler(
        ${[hasBody && "body", hasParams && "params"].filter(Boolean).join(", ")}
      ))

    }),`);
  }
  w(` ]
    }
  `);
}
