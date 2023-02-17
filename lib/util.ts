import { OpenAPIV3 } from "openapi-types";

const snakeTo = (fn: (w: string, i: number) => string) => (s: string) =>
  s.split("_").map(fn).join("");

const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : "");

export const snakeToPascal = snakeTo(cap);
export const snakeToCamel = snakeTo((w, i) => (i > 0 ? cap(w) : w));

export const pascalToCamel = (s: string) =>
  s ? s[0].toLowerCase() + s.slice(1) : s;

// HACK: we will probably do this rename in Nexus at some point because
// "organization" is really long. Luckily it is only ever used as an
// interpolated variable in request paths, so renaming it is fine as long
// as we do it everywhere.

const renameMap: Record<string, string> = {
  organization_name: "org_name",
  interface: "iface",
};

const renameParam = (s: string) => renameMap[s] || s;

export const processParamName = (s: string) => snakeToCamel(renameParam(s));

/** `{project_name}` -> `${projectName}`. if no brackets, leave it alone */
const segmentToInterpolation = (s: string) =>
  s.startsWith("{") ? `\$\{${processParamName(s.slice(1, -1))}\}` : s;

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
