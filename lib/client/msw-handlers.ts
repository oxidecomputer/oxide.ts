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

export function generateMSWHandlers(spec: OpenAPIV3.Document) {
  if (!spec.components) return;

  w("/* eslint-disable */\n");

  w(`
    import { z, ZodSchema } from "zod";
    import {
      rest,
      compose,
      context,
      DefaultBodyType as DBT,
      RestHandler,
      RestRequest,
      ResponseTransformer,
    } from "msw";
    import type * as Api from "./Api";
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
  `);

  w(`export interface MSWHandlers {`);
  for (const { conf, method, opId } of iterPathConfig(spec.paths)) {
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
        ? `body: Api.${bodyType}`
        : "";
    const params = conf.parameters?.length
      ? `params: Api.${snakeToPascal(opId)}Params`
      : "";

    const args = [body, params].filter(Boolean).join(", ");
    const statusResult =
      successType === "void"
        ? "number"
        : `${successType} | [result: ${successType}, status: number]`;

    w(`  ${opName}: (${args}) => MaybePromise<${statusResult}>,`);
  }
  w("}");

  w(`
    type ValidateBody = <S extends ZodSchema>(schema: S, body: unknown) => { body: z.infer<S>, bodyErr?: undefined } | { body?: undefined, bodyErr: ResponseTransformer }
    type ValidateParams = <S extends ZodSchema>(schema: S, req: RestRequest) => { params: z.infer<S>, paramsErr?: undefined } | { params?: undefined, paramsErr: ResponseTransformer }

    export function makeHandlers(
      handlers: MSWHandlers, 
      validateBody: ValidateBody,
      validateParams: ValidateParams,
    ): RestHandler[] {
      return [`);
  for (const { path, method, opId, conf } of iterPathConfig(spec.paths)) {
    const handler = snakeToCamel(opId);
    const bodyTypeRef = contentRef(conf.requestBody);
    const bodyType = bodyTypeRef ? refToSchemaName(bodyTypeRef) : null;
    const hasBody = bodyType && (method === "post" || method === "put");
    const paramType = snakeToPascal(opId) + "Params";
    const hasParams = !!conf.parameters?.length;
    const formattedPath = path.replace(
      /{(\w+)}/g,
      (n) => `:${snakeToCamel(n.slice(1, -1)).replace("organization", "org")}`
    );
    w(`rest.${method}('${formattedPath}', async (req, res, ctx) => {
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

    w(`try {
        const result = await handler(${[
          hasBody && "body",
          hasParams && "params",
        ]
          .filter(Boolean)
          .join(", ")})

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }))
        } 
        if (typeof result === "number") {
          return res(ctx.status(result))
        }
        return res(json(result))

      } catch(thrown) {
        if (typeof thrown === 'number') {
          return res(ctx.status(thrown))
        } 
        return res(thrown as ResponseTransformer)
      }

    }),`);
  }
  w(` ]
    }
  `);
}
