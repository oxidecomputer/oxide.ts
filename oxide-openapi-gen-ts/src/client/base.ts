/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { OpenAPIV3 } from "openapi-types";
import { topologicalSort } from "../util";
import type { IO } from "../io";
import { refToSchemaName, type Schema } from "../schema/base";
import { OpenAPIV3 as O } from "openapi-types";
const HttpMethods = O.HttpMethods;

/**
 * Returns a list of schema names sorted by dependency order.
 */
export const getSortedSchemas = (spec: OpenAPIV3.Document) => {
  return topologicalSort(
    Object.keys(spec.components?.schemas || {}).map((name) => [
      name,
      JSON.stringify(spec.components!.schemas![name])
        .match(/#\/components\/schemas\/[a-zA-Z0-9.\-_]+/g)
        ?.map((s) => s.replace("#/components/schemas/", "")),
    ])
  );
};
/**
 * Convert ``[`Vpc`](crate::external_api::views::Vpc)`` or plain ``[`Vpc`]`` to
 * `{` `@link Vpc}`, but only if that name exists in the list of schemas.
 */
export const jsdocLinkify = (s: string, schemaNames: string[]) =>
  s.replace(/\[`([^`]+)`](\([^)]+\))?/g, (_, label) =>
    schemaNames.includes(label) ? `{@link ${label}}` : "`" + label + "`"
  );

export function contentRef(
  o: Schema | OpenAPIV3.RequestBodyObject | undefined,
  prefix = ""
) {
  if (!(o && "content" in o && o.content?.["application/json"]?.schema)) {
    return null;
  }
  const schema = o.content["application/json"].schema;

  if ("$ref" in schema) {
    return prefix + refToSchemaName(schema.$ref);
  }

  if (schema.type === "array") {
    if ("$ref" in schema.items) {
      return prefix + refToSchemaName(schema.items.$ref) + "[]";
    }
    return null;
  }

  return null;
}

/**
 * Turn a description into a block comment. We use the list of `schemaNames` to
 * decide whether to turn a given crate references into an `@link`.
 */
export function docComment(
  s: string | undefined,
  schemaNames: string[],
  { w }: IO
) {
  if (s) {
    const processed = jsdocLinkify(s, schemaNames);
    w("/**");
    for (const line of processed.split("\n")) {
      w("* " + line);
    }
    w(" */");
  }
}

export type Param = Omit<OpenAPIV3.ParameterObject, "schema"> &
  Required<Pick<OpenAPIV3.ParameterObject, "schema">>;

/**
 * A normalized representation of an API operation extracted from OpenAPI paths.
 */
export interface Operation {
  opId: string;
  method: string;
  path: string;
  pathParams: Param[];
  queryParams: Param[];
  bodyType: string | null;
  successType: string | null;
  doc: string | undefined;
  isWebSocket: boolean;
}

function getSuccessResponse(
  responses: OpenAPIV3.ResponsesObject
): OpenAPIV3.ResponseObject | OpenAPIV3.ReferenceObject | undefined {
  return (
    responses["200"] || responses["201"] || responses["202"] || responses["204"]
  );
}

function extractParams(params: OpenAPIV3.ParameterObject[] | undefined): {
  pathParams: Param[];
  queryParams: Param[];
} {
  const pathParams: Param[] = [];
  const queryParams: Param[] = [];
  for (const param of params || []) {
    if ("name" in param && param.schema) {
      if (param.in === "path") {
        pathParams.push(param as Param);
      } else if (param.in === "query") {
        queryParams.push(param as Param);
      }
    }
  }
  return { pathParams, queryParams };
}

/**
 * Extract all operations from an OpenAPI spec into a normalized form. Used for
 * generating both the client methods and the MSW handlers.
 */
export function getOperations(spec: OpenAPIV3.Document): Operation[] {
  const operations: Operation[] = [];

  for (const [path, handlers] of Object.entries(spec.paths)) {
    if (!handlers) continue;

    for (const method of Object.values(HttpMethods)) {
      const conf = handlers[method];
      if (!conf || !conf.operationId) continue;

      const { pathParams, queryParams } = extractParams(
        conf.parameters as OpenAPIV3.ParameterObject[] | undefined
      );

      operations.push({
        opId: conf.operationId,
        method,
        path,
        pathParams,
        queryParams,
        bodyType: contentRef(conf.requestBody),
        successType: contentRef(getSuccessResponse(conf.responses)),
        doc: conf.summary || conf.description,
        isWebSocket: "x-dropshot-websocket" in conf,
      });
    }
  }

  return operations;
}
