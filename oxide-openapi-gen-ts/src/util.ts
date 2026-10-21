/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { OpenAPIV3 } from "openapi-types";
import { mapObj } from "./client/static/util";

const snakeTo = (fn: (w: string, i: number) => string) => (s: string) =>
  s.split("_").map(fn).join("");

const cap = (s: string) => (s ? s[0]!.toUpperCase() + s.slice(1) : "");

export const snakeToPascal = snakeTo(cap);
export const snakeToCamel = snakeTo((w, i) => (i > 0 ? cap(w) : w));

export const pascalToCamel = (s: string) =>
  s ? s[0]!.toLowerCase() + s.slice(1) : s;

export const processParamName = (s: string) => snakeToCamel(s);

/** `{project_name}` -> `${projectName}`. if no brackets, leave it alone */
const segmentToInterpolation = (s: string) =>
  s.startsWith("{") ? `$\{path.${processParamName(s.slice(1, -1))}}` : s;

export const pathToTemplateStr = (s: string) =>
  "`" + s.split("/").map(segmentToInterpolation).join("/") + "`";

export const topologicalSort = (edges: Map<string, string[]>) => {
  const result: string[] = [];
  const visited: Record<string, boolean> = {};

  const visit = (vertex: string, adjacents: string[] = []) => {
    visited[vertex] = true;
    for (const adj of adjacents) {
      if (!visited[adj]) {
        visit(adj, edges.get(adj) ?? []);
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

/** Every vertex reachable from `start` (inclusive) by following `edges`. */
export const reachableFrom = (
  edges: Map<string, string[]>,
  start: Iterable<string>,
): Set<string> => {
  const seen = new Set<string>();
  const queue = [...start];
  for (let v = queue.shift(); v !== undefined; v = queue.shift()) {
    if (seen.has(v)) continue;
    seen.add(v);
    queue.push(...(edges.get(v) ?? []));
  }
  return seen;
};

/**
 * Find all schemas involved in dependency cycles using Tarjan's algorithm.
 * Returns a set of schema names that are part of any cycle (including self-loops).
 */
export const findCyclicSchemas = (
  edges: Map<string, string[]>,
): Set<string> => {
  const cyclic = new Set<string>();
  const indexMap = new Map<string, number>();
  const lowlinkMap = new Map<string, number>();
  const onStack = new Set<string>();
  const stack: string[] = [];
  let index = 0;

  const strongconnect = (v: string) => {
    indexMap.set(v, index);
    lowlinkMap.set(v, index);
    index++;
    stack.push(v);
    onStack.add(v);

    for (const w of edges.get(v) ?? []) {
      if (!indexMap.has(w)) {
        strongconnect(w);
        lowlinkMap.set(v, Math.min(lowlinkMap.get(v)!, lowlinkMap.get(w)!));
      } else if (onStack.has(w)) {
        lowlinkMap.set(v, Math.min(lowlinkMap.get(v)!, indexMap.get(w)!));
      }
    }

    if (lowlinkMap.get(v) === indexMap.get(v)) {
      const scc: string[] = [];
      let w: string;
      do {
        w = stack.pop()!;
        onStack.delete(w);
        scc.push(w);
      } while (w !== v);

      if (scc.length > 1) {
        for (const node of scc) {
          cyclic.add(node);
        }
      } else {
        // Single-node SCC: check for self-loop
        const node = scc[0]!;
        const adj = edges.get(node) ?? [];
        if (adj.includes(node)) {
          cyclic.add(node);
        }
      }
    }
  };

  for (const [vertex] of edges) {
    if (!indexMap.has(vertex)) {
      strongconnect(vertex);
    }
  }

  return cyclic;
};

export const extractDoc = (schema: OpenAPIV3.SchemaObject): string =>
  [schema.title, schema.description].filter((n) => n).join("\n\n");

export const camelify = mapObj(snakeToCamel);
