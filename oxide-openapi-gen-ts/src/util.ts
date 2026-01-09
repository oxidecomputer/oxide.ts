/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { OpenAPIV3 } from "openapi-types";

const snakeTo = (fn: (w: string, i: number) => string) => (s: string) =>
  s.split("_").map(fn).join("");

const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : "");

export const snakeToPascal = snakeTo(cap);
export const snakeToCamel = snakeTo((w, i) => (i > 0 ? cap(w) : w));

export const pascalToCamel = (s: string) =>
  s ? s[0].toLowerCase() + s.slice(1) : s;

export const processParamName = (s: string) => snakeToCamel(s);

/** `{project_name}` -> `${projectName}`. if no brackets, leave it alone */
const segmentToInterpolation = (s: string) =>
  s.startsWith("{") ? `$\{path.${processParamName(s.slice(1, -1))}}` : s;

export const pathToTemplateStr = (s: string) =>
  "`" + s.split("/").map(segmentToInterpolation).join("/") + "`";

export const topologicalSort = (
  edges: [vertex: string, adjacents: string[] | undefined][]
) => {
  const result: string[] = [];
  const visited: Record<string, boolean> = {};

  const visit = (vertex: string, adjacents: string[] = []) => {
    visited[vertex] = true;
    for (const adj of adjacents) {
      if (!visited[adj]) {
        visit(adj, edges.find(([v]) => v === adj)?.[1]);
      }
    }
    result.push(vertex);
  };

  for (const [vertex, adjacents] of edges) {
    if (!visited[vertex]) {
      visit(vertex, adjacents);
    }
  }

  return result;
};

export const extractDoc = (schema: OpenAPIV3.SchemaObject): string =>
  [schema.title, schema.description].filter((n) => n).join("\n\n");

const isObjectOrArray = (o: unknown) =>
  typeof o === "object" &&
  !(o instanceof Date) &&
  !(o instanceof RegExp) &&
  !(o instanceof Error) &&
  o !== null;

/**
 * Recursively map (k, v) pairs using Object.entries
 *
 * Note that value transform function takes both k and v so we can use the key
 * to decide whether to transform the value.
 *
 * @param kf maps key to key
 * @param vf maps key + value to value
 */
const mapObj =
  (
    kf: (k: string) => string,
    vf: (k: string | undefined, v: unknown) => unknown = (_, v) => v
  ) =>
  (o: unknown): unknown => {
    if (!isObjectOrArray(o)) return o;

    if (Array.isArray(o)) return o.map(mapObj(kf, vf));

    const newObj: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(o as Record<string, unknown>)) {
      newObj[kf(k)] = isObjectOrArray(v) ? mapObj(kf, vf)(v) : vf(k, v);
    }
    return newObj;
  };

export const camelify = mapObj(snakeToCamel);
