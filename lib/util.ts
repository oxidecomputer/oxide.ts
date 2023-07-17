/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { OpenAPIV3 } from "openapi-types";

const snakeTo = (fn: (w: string, i: number) => string) => (s: string) =>
  s.split("_").map(fn).join("");

const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : "");

export const snakeToPascal = snakeTo(cap);
export const snakeToCamel = snakeTo((w, i) => (i > 0 ? cap(w) : w));

export const pascalToCamel = (s: string) =>
  s ? s[0].toLowerCase() + s.slice(1) : s;

const renameMap: Record<string, string> = {
  organization_name: "org_name",
};

const renameParam = (s: string) => renameMap[s] || s;

export const processParamName = (s: string) => snakeToCamel(renameParam(s));

/** `{project_name}` -> `${projectName}`. if no brackets, leave it alone */
const segmentToInterpolation = (s: string) =>
  s.startsWith("{") ? `\$\{path.${processParamName(s.slice(1, -1))}\}` : s;

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
