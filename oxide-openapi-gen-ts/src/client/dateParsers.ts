/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { OpenAPIV3 } from "openapi-types";

import { refToSchemaName, type Schema } from "../schema/base";
import { snakeToCamel } from "../util";
import { getSortedSchemas, getOperations } from "./base";

/**
 * Where dates live within a value of some type. Built from `format: date-time`
 * in the OpenAPI schema, so it carries the same information as the zod
 * `z.coerce.date()` annotations — just compiled to tiny mutating functions
 * instead of full validators (see the design notes for why we don't reuse zod).
 */
type DateNode =
  | { t: "date" } // an ISO string that should become a Date
  | { t: "array"; elem: DateNode } // array whose items carry dates
  | { t: "ref"; name: string } // $ref to another date-bearing schema
  | { t: "fields"; fields: [field: string, node: DateNode][] }; // object/union

/** A valid JS identifier can be accessed with dot notation; everything else
 * (none today, but cheap insurance) falls back to bracket notation. */
const access = (obj: string, field: string) =>
  /^[a-zA-Z_$][\w$]*$/.test(field)
    ? `${obj}.${field}`
    : `${obj}[${JSON.stringify(field)}]`;

export interface DateParsers {
  /** Full source of the generated `date-parsers.ts` file. */
  content: string;
  /**
   * Given an operation's success type (e.g. `"Instance"`, `"Instance[]"`, or
   * null), return the parser expression a generated method should pass as
   * `parseResponse`, e.g. `"P.n2"`, or null if the type carries no dates.
   */
  parserExpr: (successType: string | null) => string | null;
}

/**
 * Analyze a spec and compile a date-parsing function for every type that
 * transitively contains a `date-time`. Functions are deduplicated by body, so
 * the ~145 date-bearing types collapse to a few dozen functions (e.g. every
 * `{ time_created, time_modified }` type shares one).
 */
export function buildDateParsers(spec: OpenAPIV3.Document): DateParsers {
  const schemas = spec.components?.schemas ?? {};

  // --- compute a DateNode for each schema, memoized -----------------------

  const nodeMemo = new Map<string, DateNode | null>();

  const nodeForName = (name: string, stack: Set<string>): DateNode | null => {
    if (nodeMemo.has(name)) return nodeMemo.get(name)!;
    // Break recursion on cycles. A date-bearing cycle would also break the
    // leaf-first emission order below and throw there with a clearer message;
    // benign (non-date) cycles just resolve to null on the back-edge.
    if (stack.has(name)) return null;
    stack.add(name);
    const node = computeNode(schemas[name], stack);
    stack.delete(name);
    nodeMemo.set(name, node);
    return node;
  };

  /** Resolve a node to its date fields, following refs. oneOf/allOf members
   * that are `$ref`s to object types get flattened into the merged field set
   * rather than referencing a separate function, since the union/intersection
   * has no function of its own. */
  const fieldsOf = (node: DateNode): [string, DateNode][] => {
    if (node.t === "fields") return node.fields;
    if (node.t === "ref") {
      const target = nodeForName(node.name, new Set());
      if (target) return fieldsOf(target);
    }
    throw new Error(
      `Cannot merge union/intersection member of shape '${node.t}' into date fields`
    );
  };

  /** Merge the date fields of several object-like schemas (oneOf/allOf) by
   * field name. Safe because no date field name maps to different shapes
   * across the spec. */
  const mergeFields = (
    members: (Schema | undefined)[],
    stack: Set<string>
  ): DateNode | null => {
    const merged = new Map<string, DateNode>();
    for (const member of members) {
      const sub = member && computeNode(member, stack);
      if (!sub) continue;
      for (const [field, node] of fieldsOf(sub)) {
        if (!merged.has(field)) merged.set(field, node);
      }
    }
    return merged.size ? { t: "fields", fields: [...merged] } : null;
  };

  const computeNode = (
    schema: Schema | undefined,
    stack: Set<string>
  ): DateNode | null => {
    if (!schema) return null;
    if ("$ref" in schema) {
      const name = refToSchemaName(schema.$ref);
      return nodeForName(name, stack) ? { t: "ref", name } : null;
    }
    if (schema.type === "string" && schema.format === "date-time") {
      return { t: "date" };
    }
    if (schema.type === "array") {
      const elem = computeNode(schema.items, stack);
      return elem ? { t: "array", elem } : null;
    }
    if (schema.type === "object" && schema.properties) {
      const fields: [string, DateNode][] = [];
      for (const [name, sub] of Object.entries(schema.properties)) {
        const node = computeNode(sub, stack);
        if (node) fields.push([snakeToCamel(name), node]);
      }
      return fields.length ? { t: "fields", fields } : null;
    }
    // A single-member oneOf/allOf is just that member (dropshot wraps a $ref
    // this way to attach a description); collapse so it stays a ref node.
    if (schema.oneOf?.length === 1) return computeNode(schema.oneOf[0], stack);
    if (schema.allOf?.length === 1) return computeNode(schema.allOf[0], stack);
    if (schema.oneOf) return mergeFields(schema.oneOf, stack);
    if (schema.allOf) return mergeFields(schema.allOf, stack);
    // scalars, enums, and record types (additionalProperties) carry no dates
    return null;
  };

  // --- assign deduplicated function names in dependency order -------------

  // schema name -> the function name that parses it (e.g. "n0"). Refs alias to
  // the referenced schema's function, so multiple names can share one.
  const fnForSchema = new Map<string, string>();
  // function body source -> assigned name, for dedup
  const nameForBody = new Map<string, string>();
  // assigned name -> { body, members }, in assignment order
  const fns: { name: string; body: string; members: string[] }[] = [];
  let counter = 0;

  /** Name of the function applied to each element of an array. */
  const elemFn = (node: DateNode): string => {
    if (node.t === "date") return "D";
    if (node.t === "ref") return fnForSchema.get(node.name)!;
    throw new Error(`Unsupported array element shape '${node.t}'`);
  };

  /** Source of the function that parses a value with the given node shape. */
  const bodyFor = (node: DateNode): string => {
    if (node.t === "date") return "(o: any) => D(o)";
    if (node.t === "array") return `(o: any) => A(o, ${elemFn(node.elem)})`;
    if (node.t === "ref") throw new Error("ref nodes alias, no body");
    const lines = node.fields.map(([field, child]) => {
      const lhs = access("o", field);
      if (child.t === "date")
        return `  if (${lhs} != null) ${lhs} = D(${lhs});`;
      if (child.t === "array")
        return `  if (${lhs} != null) ${lhs} = A(${lhs}, ${elemFn(
          child.elem
        )});`;
      if (child.t === "ref")
        return `  if (${lhs} != null) ${lhs} = ${fnForSchema.get(
          child.name
        )}(${lhs});`;
      throw new Error(`Unsupported nested object field shape '${child.t}'`);
    });
    return `(o: any) => {\n  if (!o) return o;\n${lines.join(
      "\n"
    )}\n  return o;\n}`;
  };

  /** Register a body, deduping. Returns the assigned function name. */
  const register = (body: string, member: string): string => {
    const existing = nameForBody.get(body);
    if (existing) {
      fns.find((f) => f.name === existing)!.members.push(member);
      return existing;
    }
    const name = `n${counter++}`;
    nameForBody.set(body, name);
    fns.push({ name, body, members: [member] });
    return name;
  };

  for (const schemaName of getSortedSchemas(spec)) {
    const node = nodeForName(schemaName, new Set());
    if (!node) continue;
    if (node.t === "ref") {
      const target = fnForSchema.get(node.name);
      if (!target) {
        throw new Error(
          `Date-bearing reference cycle through '${schemaName}'; option C needs a function-declaration fallback`
        );
      }
      fnForSchema.set(schemaName, target);
      continue;
    }
    fnForSchema.set(schemaName, register(bodyFor(node), schemaName));
  }

  // --- array success types (e.g. ScimClientBearerToken[]) need a wrapper --

  const arrayElemFn = new Map<string, string>(); // elem schema name -> fn name
  for (const op of getOperations(spec)) {
    const success = op.successType;
    if (!success || !success.endsWith("[]")) continue;
    const elem = success.slice(0, -2);
    if (arrayElemFn.has(elem) || !fnForSchema.has(elem)) continue;
    const body = `(o: any) => A(o, ${fnForSchema.get(elem)})`;
    arrayElemFn.set(elem, register(body, `${elem}[]`));
  }

  // --- render the file ----------------------------------------------------

  const decls = fns.map(({ name, body, members }) => {
    const shown = members.slice(0, 4).join(", ");
    const more = members.length > 4 ? `, +${members.length - 4} more` : "";
    return `// ${members.length} type${
      members.length > 1 ? "s" : ""
    }: ${shown}${more}\nexport const ${name} = ${body};`;
  });

  const content = `/* eslint-disable */

/**
 * Date parsing for API responses. Each exported function takes a (camelized)
 * response value and converts its \`date-time\` fields to \`Date\` in place,
 * recursing into nested objects and arrays. Generated from \`format: date-time\`
 * in the OpenAPI schema and deduplicated by body, so types with the same date
 * shape share one function. \`Api.ts\` passes the right one as \`parseResponse\`.
 */

const D = (v: any) => {
  if (typeof v !== "string") return v;
  const d = new Date(v);
  return isNaN(d.getTime()) ? v : d;
};

const A = (v: any, f: (x: any) => any) => (Array.isArray(v) ? v.map(f) : v);

${decls.join("\n\n")}
`;

  const parserExpr = (successType: string | null): string | null => {
    if (!successType) return null;
    if (successType.endsWith("[]")) {
      const name = arrayElemFn.get(successType.slice(0, -2));
      return name ? `P.${name}` : null;
    }
    const name = fnForSchema.get(successType);
    return name ? `P.${name}` : null;
  };

  return { content, parserExpr };
}
