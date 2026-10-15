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
import { match } from "ts-pattern";

/**
 * Where dates live within a given schema definition (if anywhere), based off
 * of the `format: date-time` property.
 */
type DateNode =
  | { t: "date" } // an ISO string that should become a Date
  | { t: "array"; elem: DateNode } // an array of the same
  | { t: "ref"; name: string } // via a $ref to another schema
  | { t: "fields"; fields: [field: string, node: DateNode][] }; // on some object/union

/**
 * A shallower view for an initial pass: the refs that point to a schema, and
 * whether it has at least one date immediately reachable. E.g., being a date
 * itself, being an object with a date field, a oneOf with a date, etc.
 * Everything but a ref.
 */
type Scan = { date: boolean; refs: string[] };

export interface DateParsers {
  /** Full source of the generated `date-parsers.ts` file. */
  content: string;
  /**
   * Given an operation's success type (e.g. `"Instance"`, `"Instance[]"`, or
   * null), return the parser function a generated method should pass as
   * `parseResponse`, e.g. `"P.n2"`. Null if the type carries no dates.
   */
  parserExpr: (successType: string | null) => string | null;
}

type RefOrSchema = OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;

/**
 * A simplified view of an OpenAPI schema, for the purposes of traversing for
 * dates.
 */
type SchemaKind =
  | { type: "ref"; name: string }
  | { type: "date-time" }
  | { type: "array"; items: RefOrSchema }
  | { type: "object"; properties: Record<string, RefOrSchema> }
  /** A single-member oneOf/allOf is just that member (dropshot wraps a $ref
   * this way to attach a description). */
  | { type: "single"; item: RefOrSchema }
  | { type: "union"; items: RefOrSchema[] }
  | { type: "unimportant" }; // undefined, scalars, enums, etc

const schemaKind = (schema: Schema | undefined): SchemaKind => {
  if (!schema) return { type: "unimportant" };

  if ("$ref" in schema) {
    return { type: "ref", name: refToSchemaName(schema.$ref) };
  } else if (schema.type === "string" && schema.format === "date-time") {
    return { type: "date-time" };
  } else if (schema.type === "array") {
    return { type: "array", items: schema.items };
  } else if (schema.type === "object" && schema.properties) {
    return { type: "object", properties: schema.properties };
  } else if (schema.oneOf?.length === 1) {
    return { type: "single", item: schema.oneOf[0] };
  } else if (schema.allOf?.length === 1) {
    return { type: "single", item: schema.allOf[0] };
  } else if (schema.oneOf) {
    return { type: "union", items: schema.oneOf };
  } else if (schema.allOf) {
    return { type: "union", items: schema.allOf };
  }

  return { type: "unimportant" };
};

type SchemaReducers<R> = {
  unimportant: () => R;
  ref: (name: string) => R;
  date: () => R;
  array: (elem: R) => R;
  object: (fields: [name: string, sub: R][]) => R;
  single: (member: R) => R;
  /** A multi-member oneOf/allOf. */
  union: (members: R[]) => R;
};

/**
 * There are only two functions that do a depth-first search of the schema (not
 * recursing through refs), but it's very important that they traverse
 * identically, so we provide a fold implementation.
 */
const foldSchema = <R>(alg: SchemaReducers<R>) => {
  const go = (schema: Schema | undefined): R =>
    match(schemaKind(schema))
      .with({ type: "unimportant" }, () => alg.unimportant())
      .with({ type: "ref" }, ({ name }) => alg.ref(name))
      .with({ type: "date-time" }, () => alg.date())
      .with({ type: "array" }, ({ items }) => alg.array(go(items)))
      .with({ type: "object" }, ({ properties }) =>
        alg.object(
          Object.entries(properties).map(([name, sub]) => [name, go(sub)])
        )
      )
      .with({ type: "single" }, ({ item }) => alg.single(go(item)))
      .with({ type: "union" }, ({ items }) => alg.union(items.map(go)))
      .exhaustive();
  return go;
};

const mergeScans = (scans: Scan[]): Scan => ({
  date: scans.some((s) => s.date),
  refs: scans.flatMap((s) => s.refs),
});

const scanSchema = foldSchema<Scan>({
  unimportant: () => ({ date: false, refs: [] }),
  ref: (name) => ({ date: false, refs: [name] }),
  date: () => ({ date: true, refs: [] }),
  array: (elem) => elem,
  object: (fields) => mergeScans(fields.map(([, sub]) => sub)),
  single: (member) => member,
  union: (members) => mergeScans(members),
});

export const getSchemaEntrypoints = (
  spec: OpenAPIV3.Document
): {
  schemas: Record<string, RefOrSchema>;
  schemaNames: string[];
  scanOf: (name: string) => Scan;
} => {
  const schemas = spec.components?.schemas ?? {};
  const schemaNames = getSortedSchemas(spec);

  const scannedSchemas = new Map<string, Scan>();
  const scanOf = (name: string): Scan => {
    let scan = scannedSchemas.get(name);
    if (!scan) {
      scan = scanSchema(schemas[name]);
      scannedSchemas.set(name, scan);
    }
    return scan;
  };

  return { schemas, schemaNames, scanOf };
};

/**
 * Produce the collection of schemas that actually need a parser. That means
 * they are referenced in some success response, and a string of format
 * `date-time` is reachable from each.
 */
export const getSchemasNeedingParser = (
  spec: OpenAPIV3.Document,
  schemaNames: string[],
  scanOf: (name: string) => Scan
): Set<string> => {
  // A schema is "date-bearing" when some `date-time` is reachable from it,
  // either immediately (being a Scan with date: true) or via a ref to another
  // date-bearing schema (being a Scan where some ref down its tree is date:
  // true).
  const dateBearing = new Set<string>();
  {
    const parents = new Map<string, string[]>();
    const queue: string[] = [];
    for (const name of schemaNames) {
      const scan = scanOf(name);
      for (const target of scan.refs) {
        const r = parents.get(target);
        if (r) {
          r.push(name);
        } else {
          parents.set(target, [name]);
        }
      }
      if (scan.date) {
        dateBearing.add(name);
        queue.push(name);
      }
    }
    while (queue.length > 0) {
      for (const parent of parents.get(queue.pop()!) ?? []) {
        if (!dateBearing.has(parent)) {
          dateBearing.add(parent);
          queue.push(parent);
        }
      }
    }
  }

  const responseSchemas = new Set<string>();
  {
    const queue: string[] = [];
    for (const op of getOperations(spec)) {
      // success types coming from OpenAPI can only ever be a named type or an
      // array of named types (or null)
      const root = op.successType?.endsWith("[]")
        ? op.successType.slice(0, -2)
        : op.successType;
      if (root && !responseSchemas.has(root)) {
        responseSchemas.add(root);
        queue.push(root);
      }
    }
    while (queue.length > 0) {
      for (const target of scanOf(queue.pop()!).refs) {
        if (!responseSchemas.has(target)) {
          responseSchemas.add(target);
          queue.push(target);
        }
      }
    }
  }

  return dateBearing.intersection(responseSchemas);
};

const makeNodeForName = (
  needsParser: Set<string>,
  schemas: Record<string, RefOrSchema>
): ((name: string) => DateNode | null) => {
  const dateNodes = new Map<string, DateNode | null>();
  // The schemas currently being flattened. `computeNode` resolves `$ref`s
  // against `needsParser` without recursing, so the only recursion between
  // named schemas is union flattening in `fieldsOf`; a revisit there means a
  // union's members `$ref` back into a union being flattened, which would
  // expand forever.
  const flattening = new Set<string>();

  /** Resolve a node to its date fields, following refs. oneOf/allOf members
   * that are `$ref`s to object types get flattened into the merged field set
   * rather than referencing a separate function, since the union/intersection
   * has no function of its own. */
  const fieldsOf = (node: DateNode): [string, DateNode][] => {
    if (node.t === "fields") return node.fields;
    if (node.t === "ref") {
      const target = nodeForName(node.name);
      if (target) return fieldsOf(target);
    }
    throw new Error(
      `Cannot merge union/intersection member of shape '${node.t}' into date fields`
    );
  };

  /**
   * A rough stringification of DateNode for the sake of equality checking (and
   * printing, should there be a failure).
   */
  const dateNodeDebug = (node: DateNode): string =>
    match(node)
      .with({ t: "date" }, () => "date")
      .with({ t: "array" }, ({ elem }) => `array(${dateNodeDebug(elem)})`)
      .with({ t: "ref" }, ({ name }) => {
        const target = nodeForName(name);
        return target ? dateNodeDebug(target) : "null";
      })
      .with(
        { t: "fields" },
        ({ fields }) =>
          `{${fields
            .map(([field, child]) => `${field}:${dateNodeDebug(child)}`)
            .sort()
            .join(",")}}`
      )
      .exhaustive();

  /**
   * Merge the date fields of a union's members by field name. A field name
   * shared by two variants has to have the same shape in both.
   */
  const mergeFields = (members: (DateNode | null)[]): DateNode | null => {
    const merged = new Map<string, DateNode>();
    members
      .filter((m) => m !== null)
      .flatMap(fieldsOf)
      .forEach(([field, node]) => {
        const existing = merged.get(field);
        if (!existing) {
          merged.set(field, node);
        } else if (dateNodeDebug(existing) !== dateNodeDebug(node)) {
          throw new Error(
            `Union members disagree on the shape of date field '${field}': '${dateNodeDebug(
              existing
            )}' vs '${dateNodeDebug(node)}'`
          );
        }
      });
    return merged.size ? { t: "fields", fields: [...merged] } : null;
  };

  const computeNode = foldSchema<DateNode | null>({
    unimportant: () => null,
    // By using the reachability from {@link getSchemasNeedingParser}, we don't
    // have to worry about getting caught in a cycle. And because
    // {@link scanSchema} follows the same traversal path, any date-bearing ref
    // is guaranteed to have a parser (so we don't need to "compute" further
    // down than this).
    ref: (name) => (needsParser.has(name) ? { t: "ref", name } : null),
    date: () => ({ t: "date" }),
    array: (elem) => (elem ? { t: "array", elem } : null),
    object: (fields) => {
      const dated: [string, DateNode][] = [];
      for (const [name, node] of fields) {
        if (node) dated.push([snakeToCamel(name), node]);
      }
      return dated.length ? { t: "fields", fields: dated } : null;
    },
    single: (member) => member,
    union: mergeFields,
  });

  const nodeForName = (name: string): DateNode | null => {
    if (dateNodes.has(name)) return dateNodes.get(name)!;
    if (flattening.has(name)) {
      throw new Error(
        `Union flattening cycles back through '${name}'; a oneOf/allOf in a $ref cycle has no finite merged field set`
      );
    }
    flattening.add(name);
    const node = computeNode(schemas[name]);
    flattening.delete(name);
    dateNodes.set(name, node);
    return node;
  };

  return nodeForName;
};

/**
 * Analyze a spec and compile a date-parsing function for every type that
 * appears in at least one response and contains (directly or transitively) a
 * `date-time`. Functions are deduplicated by body (e.g. every
 * `{ time_created, time_modified }` type shares one). Schemas in a `$ref` cycle
 * get mutually recursive functions (named up front, skipping the dedup).
 *
 * The one unsupported shape is a oneOf/allOf with a cycle among the members,
 * since merging a union means flattening its members into one field set and
 * a cyclic union would flatten forever.
 */
export function buildDateParsers(spec: OpenAPIV3.Document): DateParsers {
  const { schemas, schemaNames, scanOf } = getSchemaEntrypoints(spec);

  const needsParser = getSchemasNeedingParser(spec, schemaNames, scanOf);

  const nodeForName = makeNodeForName(needsParser, schemas);

  // Tarjan's strongly connected component algorithm, applied only to the
  // subgraph of schemas that actually need date parsers. It pops a component
  // only after every component it references, so iterating `sccs` in order is
  // leaf-first: callees have their functions before any caller renders a body
  // that mentions them. Seeded in getSortedSchemas order so that on a
  // cycle-free spec the function numbering matches a plain dependency-order
  // walk.
  const sccs: string[][] = [];
  {
    const index = new Map<string, number>();
    const low = new Map<string, number>();
    const onStack = new Set<string>();
    const stack: string[] = [];

    const connect = (v: string) => {
      index.set(v, index.size);
      low.set(v, index.get(v)!);
      stack.push(v);
      onStack.add(v);
      for (const w of scanOf(v).refs) {
        if (!needsParser.has(w)) continue;
        if (!index.has(w)) {
          connect(w);
          low.set(v, Math.min(low.get(v)!, low.get(w)!));
        } else if (onStack.has(w)) {
          low.set(v, Math.min(low.get(v)!, index.get(w)!));
        }
      }
      if (low.get(v) === index.get(v)) {
        const scc: string[] = [];
        let w: string;
        do {
          w = stack.pop()!;
          onStack.delete(w);
          scc.push(w);
        } while (w !== v);
        sccs.push(scc.reverse());
      }
    };

    for (const name of schemaNames) {
      if (needsParser.has(name) && !index.has(name)) connect(name);
    }
  }

  // --- assign deduplicated function names, leaf components first -----------

  // schema name -> the function name that parses it (e.g. "n0"). Refs alias to
  // the referenced schema's function, so multiple names can share one.
  const fnForSchema = new Map<string, string>();
  // function body source -> assigned name, for dedup
  const nameForBody = new Map<string, string>();
  // assigned name -> body, in assignment order
  const fns: { name: string; body: string }[] = [];
  let counter = 0;

  /** Function parsing a $ref'd schema. A miss means we're emitting a component
   * before one it depends on; fail here rather than interpolating the string
   * `undefined` into the generated file, where it becomes a TypeError at
   * whatever point the client first parses that response. */
  const fnFor = (name: string): string => {
    const fn = fnForSchema.get(name);
    if (!fn) {
      throw new Error(
        `No date parser assigned for '${name}' yet; components are being emitted out of dependency order`
      );
    }
    return fn;
  };

  /** Register a body, deduping. Returns the assigned function name. */
  const register = (body: string): string => {
    const existing = nameForBody.get(body);
    if (existing) return existing;
    const name = `n${counter++}`;
    nameForBody.set(body, name);
    fns.push({ name, body });
    return name;
  };

  /** Name of the function applied to an array element or object field. If that
   * element/field's value is itself an array/object, it has no explicit name,
   * so we just register it to get one. */
  const elemFn = (node: DateNode): string =>
    match(node)
      .with({ t: "date" }, () => "D")
      .with({ t: "ref" }, ({ name }) => fnFor(name))
      .with({ t: "array" }, { t: "fields" }, () => register(bodyFor(node)))
      .exhaustive();

  /** Source of the function that parses a value with the given node shape. */
  const bodyFor = (node: DateNode): string =>
    match(node)
      .with({ t: "date" }, () => "(o: any) => D(o)")
      .with({ t: "array" }, ({ elem }) => `(o: any) => A(o, ${elemFn(elem)})`)
      .with({ t: "ref" }, () => {
        throw new Error("ref nodes alias, no body");
      })
      .with({ t: "fields" }, ({ fields }) => {
        const lines = fields.map(([field, value]) => {
          const lhs = `o[${JSON.stringify(field)}]`;
          const transformation = match(value)
            .with({ t: "date" }, () => `D(${lhs})`)
            .with({ t: "array" }, ({ elem }) => `A(${lhs}, ${elemFn(elem)})`)
            .with(
              { t: "ref" },
              { t: "fields" },
              () => `${elemFn(value)}(${lhs})`
            )
            .exhaustive();

          return `  if (${lhs} != null) ${lhs} = ${transformation};`;
        });

        return `(o: any) => {\n  if (!o) return o;\n${lines.join(
          "\n"
        )}\n  return o;\n}`;
      })
      .exhaustive();

  for (const scc of sccs) {
    const cyclic = scc.length > 1 || scanOf(scc[0]).refs.includes(scc[0]);

    if (!cyclic) {
      const name = scc[0];
      const node = nodeForName(name);
      if (!node) {
        throw new Error(
          `'${name}' is date-bearing but produced no parser (generator bug: the scan and the walk disagree)`
        );
      }
      // A ref node aliases: this schema shares the target's function instead
      // of getting one of its own, so there's no body to build or register.
      if (node.t === "ref") fnForSchema.set(name, fnFor(node.name));
      else fnForSchema.set(name, register(bodyFor(node)));
      continue;
    }

    // A $ref cycle: these parsers call each other, so every member needs its
    // name before any body can be rendered. Pre-assign names, then render.
    // Forward references are fine in the generated file — module-level consts
    // are all initialized before a parser is ever called. The body-keyed dedup
    // is skipped: it can't name a function it hasn't rendered, which is
    // exactly the chicken-and-egg a cycle creates.
    const bodied: string[] = [];
    for (const name of scc) {
      const node = nodeForName(name);
      if (!node) {
        throw new Error(
          `'${name}' is date-bearing but produced no parser (generator bug: the scan and the walk disagree)`
        );
      }
      if (node.t !== "ref") {
        fnForSchema.set(name, `n${counter++}`);
        bodied.push(name);
      }
    }
    // Members that are bare ref wrappers alias another member of this cycle or
    // a schema in an earlier component; chase through alias chains to a named
    // function.
    for (const name of scc) {
      const node = nodeForName(name)!;
      if (node.t !== "ref") continue;
      let target = node.name;
      const seen = new Set([name]);
      while (!fnForSchema.has(target)) {
        if (seen.has(target)) {
          throw new Error(`'${name}' is part of a pure-alias $ref cycle`);
        }
        seen.add(target);
        target = (nodeForName(target) as { t: "ref"; name: string }).name;
      }
      fnForSchema.set(name, fnForSchema.get(target)!);
    }
    for (const name of bodied) {
      fns.push({
        name: fnForSchema.get(name)!,
        body: bodyFor(nodeForName(name)!),
      });
    }
  }

  // --- array success types (e.g. ScimClientBearerToken[]) need a wrapper --

  const arrayElemFn = new Map<string, string>(); // elem schema name -> fn name
  for (const op of getOperations(spec)) {
    const success = op.successType;
    if (!success || !success.endsWith("[]")) continue;
    const elem = success.slice(0, -2);
    if (arrayElemFn.has(elem) || !fnForSchema.has(elem)) continue;
    const body = `(o: any) => A(o, ${fnForSchema.get(elem)})`;
    arrayElemFn.set(elem, register(body));
  }

  // --- render the file ----------------------------------------------------

  const decls = fns.map(({ name, body }) => `export const ${name} = ${body};`);

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
  if (isNaN(d.getTime())) throw new Error(\`Expected a valid date string, instead received "\${v}"\`);
  return d;
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
