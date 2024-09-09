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
        .match(/#\/components\/schemas\/[a-zA-Z0-9.\-_]+$/g)
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

type PathConfig = ReturnType<typeof iterPathConfig>[number];
export function iterPathConfig(paths: OpenAPIV3.Document["paths"]) {
  return Object.entries(paths).flatMap(([path, handlers]) => {
    if (!handlers) return [];

    return Object.values(HttpMethods).flatMap((method) => {
      const conf = handlers[method];
      if (!conf || !conf.operationId) return [];
      return { path, conf, method, opId: conf.operationId };
    });
  });
}

type Param = Omit<OpenAPIV3.ParameterObject, "schema"> &
  Required<Pick<OpenAPIV3.ParameterObject, "schema">>;
type ParamGroup = [pathParams: Param[], queryParams: Param[]];
interface IterParamsResult extends PathConfig {
  params: ParamGroup;
}

export function iterParams(paths: OpenAPIV3.Document["paths"]) {
  const collectedParams: IterParamsResult[] = [];
  for (const { conf, ...others } of iterPathConfig(paths)) {
    const params = conf.parameters;
    const group: ParamGroup = [[], []];
    for (const param of params || []) {
      if ("name" in param && param.schema) {
        if (param.in === "path") {
          group[0].push(param as Param);
        }
        if (param.in === "query") {
          group[1].push(param as Param);
        }
      }
    }
    collectedParams.push({ conf, ...others, params: group });
  }
  return collectedParams;
}
