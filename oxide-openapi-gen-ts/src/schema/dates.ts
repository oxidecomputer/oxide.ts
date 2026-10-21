/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

/**
 * The generated client decides to parse response strings into `Date`s by
 * observing whether the property name leading to it is in the set of property
 * names that describe a string as `date-time` format within some response type
 * in the source OpenAPI spec. This module derives that set.
 *
 * This module also checks for soundness, particularly that no value in the
 * generated client is typed as `Date` when it's in fact a string, nor
 * vice-versa. That means the set of property names that point to date-time
 * strings must be mutually exclusive with the set of property names that point
 * to non-date-time strings. In the case that there is a conflict, the
 * generated client will treat all properties of that name as a `string` type.
 * API consumers can then convert it to a date and handle the case gracefully,
 * or even better, the schema definition could remove the name "collision".
 *
 * Note that this soundness requirement means we have to reject a few cases we
 * can't prove are safe (or we can't generate safe code with our current
 * approach):
 *
 * - records whose values are strings, or lead to strings (like string[], or a
 *   oneOf where one variant is a string)
 * - detected dates that don't have a key: response bodies that are just a
 *   date-time string, or fields that are a Record<string, Date> (what would we
 *   put in the set of date-time keys? all strings??)
 *
 * For the former case, you can use the `--unsound-date-types` flag to allow
 * client generation anyways, but if the client encounters one of your detected
 * date-time keys in the record, it'll convert the value to a date whenever it
 * looks like one (and throw, if it looks like a date but is invalid when
 * parsed). The latter case is unsupported.
 *
 * (Comments further down this file are claudese. Don't read them)
 */

import { match, P } from "ts-pattern";
import { OpenAPIV3 } from "openapi-types";
import { refToSchemaName, type Schema } from "./base";
import { getSchemaEdges, schemaRefs } from "../client/base";
import { isIsoDate } from "../client/static/util";
import { reachableFrom } from "../util";

/**
 * What the runtime could see at a value. `string` is any string that is not
 * a date, including an enum with a member that looks like a timestamp (other
 * enums are fixed literals and can't be parsed). `other` is everything the
 * date parser can't get wrong: numbers, booleans, objects, and untyped values.
 */
type Leaf = "date" | "string" | "other";

/** A leaf plus a human-readable description of the schema, for reports */
type Kind = { leaf: Leaf; detail: string };

/** One property `name` on the schema at path `owner`, with a possible kind */
type Occurrence = Kind & { name: string; owner: string };

/** A record (`additionalProperties`) at `owner` whose values can be `values` */
type Container = { owner: string; values: Kind[] };

/** A date key that some response schema also uses for a plain string */
type Conflict = {
  name: string;
  dates: Occurrence[];
  others: Occurrence[];
};

export type DateKeyReport = {
  /**
   * Sorted, snake-case names of `date-time` properties in responses, minus
   * the conflicting ones: those are demoted to `string` (see
   * `demoteConflicts`) and must not be parsed.
   */
  dateKeys: string[];
  /** Date names that are also plain strings somewhere in a response */
  conflicts: Conflict[];
  /** Records whose arbitrary keys could put a string under a date key */
  suspects: Container[];
  /**
   * Places a `date-time` appears in a response without a property name to
   * key on: a response body that is itself a date (or array of dates), or a
   * record of dates. The generated type says `Date`, but the runtime can't
   * parse them, so these are always errors.
   */
  unsupported: string[];
};

type Lookup = (ref: string) => Schema | undefined;

const schemaLookup =
  (spec: OpenAPIV3.Document): Lookup =>
  (ref) =>
    spec.components?.schemas?.[refToSchemaName(ref)];

const kind = (leaf: Leaf, detail: string): Kind => ({ leaf, detail });

const describe = (s: OpenAPIV3.SchemaObject) =>
  [s.type, s.format].filter(Boolean).join(":") || "untyped";

const uniqueKinds = (kinds: Kind[]): Kind[] => [
  ...new Map(kinds.map((k) => [`${k.leaf} ${k.detail}`, k])).values(),
];

/**
 * Every kind of value the runtime could see for a value with this schema.
 * Arrays take the kinds of their items, because `mapObj` hands array
 * elements to the date parser under the array's key. Unions take the kinds of
 * all their arms. `seen` holds the refs on the current path, so a recursive
 * ref contributes nothing new instead of looping.
 */
const kindsOf =
  (lookup: Lookup, seen: ReadonlySet<string> = new Set()) =>
  (schema: Schema): Kind[] =>
    uniqueKinds(
      match(schema)
        .with({ $ref: P.string }, ({ $ref }) => {
          if (seen.has($ref)) return [];
          const target = lookup($ref);
          if (!target) return [kind("other", `unresolved ${$ref}`)];
          return kindsOf(lookup, new Set([...seen, $ref]))(target);
        })
        .with({ type: "string", format: "date-time" }, () => [
          kind("date", "date-time"),
        ])
        .with({ enum: P.array(P.not(P.nullish)) }, (s) => [
          kind(s.enum.some(isIsoDate) ? "string" : "other", "enum"),
        ])
        .with({ type: "string" }, (s) => [kind("string", describe(s))])
        .with({ type: "array" }, (s) => kindsOf(lookup, seen)(s.items))
        .with({ oneOf: P.not(P.nullish) }, (s) =>
          s.oneOf.flatMap(kindsOf(lookup, seen)),
        )
        .with({ allOf: P.not(P.nullish) }, (s) =>
          s.allOf.flatMap(kindsOf(lookup, seen)),
        )
        .otherwise((s) => [kind("other", describe(s))]),
    );

/**
 * An inline subschema of a schema: a property (with its name), array items,
 * record values, or a union arm. `path` is the segment to append to the
 * parent's owner path for reports.
 */
type Child = { schema: Schema; path: string; prop?: string };

/**
 * Rebuild a schema with `f` applied to each inline child. This is the one
 * place the inline structure of a schema is spelled out; the walks below are
 * all derived from it.
 *
 * Refs are not followed. Every component schema reachable from a response is
 * walked on its own (see `responseSchemas`), so following refs here would
 * only revisit schemas and could loop on recursive types. Since a ref is the
 * only way a schema can contain itself, the inline structure is always a
 * finite tree and the walks need no cycle guard.
 *
 * The shapes covered are the ones `schemaToTypes` covers: properties, array
 * items, record values, and `oneOf`/`allOf` arms. Anything else (`anyOf`,
 * `not`) is typed `unknown` by the type generator, which the date parser can't
 * get wrong, so it is not walked here either.
 */
const mapChildren =
  (f: (child: Child) => Schema) =>
  (s: OpenAPIV3.SchemaObject): OpenAPIV3.SchemaObject => ({
    ...s,
    ...(s.properties && {
      properties: Object.fromEntries(
        Object.entries(s.properties).map(([prop, p]) => [
          prop,
          f({ schema: p, path: `.${prop}`, prop }),
        ]),
      ),
    }),
    ...(s.type === "array" && { items: f({ schema: s.items, path: "[]" }) }),
    ...(typeof s.additionalProperties === "object" && {
      additionalProperties: f({ schema: s.additionalProperties, path: ".*" }),
    }),
    ...(s.oneOf && { oneOf: s.oneOf.map((v) => f({ schema: v, path: "" })) }),
    ...(s.allOf && { allOf: s.allOf.map((v) => f({ schema: v, path: "" })) }),
  });

const children = (s: OpenAPIV3.SchemaObject): Child[] => {
  const out: Child[] = [];
  mapChildren((c) => {
    out.push(c);
    return c.schema;
  })(s);
  return out;
};

/** A non-ref schema at a location in the spec */
type Node = { schema: OpenAPIV3.SchemaObject; owner: string };

/** This schema and every inline schema under it, with their owner paths */
const inlineNodes = (schema: Schema, owner: string): Node[] =>
  "$ref" in schema
    ? []
    : [
        { schema, owner },
        ...children(schema).flatMap((c) =>
          inlineNodes(c.schema, owner + c.path),
        ),
      ];

const occurrencesAt =
  (lookup: Lookup) =>
  ({ schema, owner }: Node): Occurrence[] =>
    Object.entries(schema.properties ?? {}).flatMap(([name, prop]) =>
      kindsOf(lookup)(prop).map((k) => ({ ...k, name, owner })),
    );

const containerAt =
  (lookup: Lookup) =>
  ({ schema, owner }: Node): Container[] =>
    typeof schema.additionalProperties === "object"
      ? [{ owner, values: kindsOf(lookup)(schema.additionalProperties) }]
      : [];

const derefResponse = (
  spec: OpenAPIV3.Document,
  r: OpenAPIV3.ResponseObject | OpenAPIV3.ReferenceObject,
): OpenAPIV3.ResponseObject | undefined =>
  match(r)
    .with(
      { $ref: P.string },
      ({ $ref }) =>
        spec.components?.responses?.[
          $ref.replace("#/components/responses/", "")
        ] as OpenAPIV3.ResponseObject | undefined,
    )
    .otherwise((r) => r);

const mediaSchemas = (r: OpenAPIV3.ResponseObject | undefined): Schema[] =>
  Object.values(r?.content ?? {}).flatMap((m) => (m.schema ? [m.schema] : []));

type Root = { schema: Schema; owner: string };

/**
 * Response body schemas of every operation, for every status code: error
 * bodies go through the same parser as success bodies.
 *
 * Only response bodies are parsed, so only schemas reachable from them can
 * make the date keys unsound. Request bodies are serialized from whatever the
 * caller passes and never go through the parser, so a name that is a date in
 * a response and a plain string in a request-only schema is not a conflict,
 * and a record of strings in a request-only schema is not a suspect. (A
 * conflict, once found, is still demoted everywhere, including request-only
 * schemas, so the name has one type throughout the client.)
 */
const responseRoots = (spec: OpenAPIV3.Document): Root[] =>
  Object.entries(spec.paths).flatMap(([path, item]) =>
    Object.values(OpenAPIV3.HttpMethods).flatMap((method) =>
      Object.entries(item?.[method]?.responses ?? {}).flatMap(([code, r]) =>
        mediaSchemas(derefResponse(spec, r)).map((schema) => ({
          schema,
          owner: `${method.toUpperCase()} ${path} ${code}`,
        })),
      ),
    ),
  );

/**
 * Response roots plus every component schema reachable from them.
 *
 * Reachability is computed once, as a breadth-first search over the ref graph
 * between component schemas (`getSchemaEdges`), starting from the refs in the
 * response roots. That is the only place refs are chased for walking
 * purposes: each reachable component is then walked by `inlineNodes` as its
 * own tree. `kindsOf` and `demoteSchema` do look through refs, but only to
 * answer what a single value's type is, never to enumerate schemas.
 */
const responseSchemas = (spec: OpenAPIV3.Document, roots: Root[]): Root[] => {
  const names = reachableFrom(
    getSchemaEdges(spec),
    roots.flatMap((r) => schemaRefs(r.schema)),
  );
  const components = [...names].sort().flatMap((name) => {
    const schema = spec.components?.schemas?.[name];
    return schema ? [{ schema, owner: name }] : [];
  });
  return [...components, ...roots];
};

const isDate = (k: Kind) => k.leaf === "date";
const isString = (k: Kind) => k.leaf === "string";

const conflictFor =
  (occurrences: Occurrence[]) =>
  (name: string): Conflict[] => {
    const named = occurrences.filter((o) => o.name === name);
    const others = named.filter(isString);
    return others.length > 0
      ? [{ name, dates: named.filter(isDate), others }]
      : [];
  };

export function analyzeDateKeys(spec: OpenAPIV3.Document): DateKeyReport {
  const lookup = schemaLookup(spec);
  const roots = responseRoots(spec);
  const nodes = responseSchemas(spec, roots).flatMap((r) =>
    inlineNodes(r.schema, r.owner),
  );

  const occurrences = nodes.flatMap(occurrencesAt(lookup));
  const containers = nodes.flatMap(containerAt(lookup));

  const dateNames = [
    ...new Set(occurrences.filter(isDate).map((o) => o.name)),
  ].sort();
  const conflicts = dateNames.flatMap(conflictFor(occurrences));
  const conflicting = new Set(conflicts.map((c) => c.name));

  const unsupported = [
    ...roots
      .filter((r) => kindsOf(lookup)(r.schema).some(isDate))
      .map((r) => r.owner),
    ...containers
      .filter((c) => c.values.some(isDate))
      .map((c) => `${c.owner}.*`),
  ];

  return {
    dateKeys: dateNames.filter((n) => !conflicting.has(n)),
    conflicts,
    suspects: containers.filter((c) => c.values.some(isString)),
    unsupported,
  };
}

/**
 * Rewrite a property's schema so it holds no `date-time`: the format is
 * dropped, array items and union arms are rewritten inside, and a `$ref` to a
 * schema that is itself a date is replaced by an inlined plain-string copy.
 * Nested object properties are left to `demoteProperties`.
 */
const demoteSchema =
  (lookup: Lookup) =>
  (schema: Schema): Schema =>
    match(schema)
      .with({ $ref: P.string }, (s) => {
        const target = lookup(s.$ref);
        return target && kindsOf(lookup)(target).some(isDate)
          ? demoteSchema(lookup)(target)
          : s;
      })
      .with({ type: "string", format: "date-time" }, (s) => {
        const plain: OpenAPIV3.SchemaObject = { ...s };
        delete plain.format;
        return plain;
      })
      .otherwise(
        mapChildren((c) =>
          c.prop === undefined ? demoteSchema(lookup)(c.schema) : c.schema,
        ),
      );

/** Demote every property named in `names`, at any inline depth */
const demoteProperties =
  (lookup: Lookup, names: ReadonlySet<string>) =>
  (schema: Schema): Schema =>
    "$ref" in schema
      ? schema
      : mapChildren((c) =>
          c.prop !== undefined && names.has(c.prop)
            ? demoteSchema(lookup)(c.schema)
            : demoteProperties(lookup, names)(c.schema),
        )(schema);

/**
 * A copy of the spec in which every component-schema property named in
 * `names` is a plain string instead of a `date-time`. Used for conflicting
 * date keys: rather than parse a name that is sometimes a date and sometimes
 * a string, the client declares it `string` everywhere and never parses it.
 * The demotion applies to every component schema, request and response
 * alike, so the same name has the same type throughout the client.
 */
export const demoteConflicts = (
  spec: OpenAPIV3.Document,
  names: Iterable<string>,
): OpenAPIV3.Document => {
  const nameSet = new Set(names);
  if (nameSet.size === 0 || !spec.components?.schemas) return spec;
  const rewrite = demoteProperties(schemaLookup(spec), nameSet);
  return {
    ...spec,
    components: {
      ...spec.components,
      schemas: Object.fromEntries(
        Object.entries(spec.components.schemas).map(([name, s]) => [
          name,
          rewrite(s),
        ]),
      ),
    },
  };
};

const MAX_OWNERS = 5;

const listOwners = (owners: string[]) => {
  const unique = [...new Set(owners)];
  const shown = unique.slice(0, MAX_OWNERS).join(", ");
  const rest = unique.length - MAX_OWNERS;
  return rest > 0 ? `${shown}, and ${rest} more` : shown;
};

const formatConflict = ({ name, dates, others }: Conflict) =>
  `  ${name}: date-time in ${listOwners(dates.map((o) => o.owner))}; ` +
  listOwners(others.map((o) => `${o.detail} in ${o.owner}`));

const formatSuspect = ({ owner, values }: Container) =>
  `  ${owner}: record with ${values.map((v) => v.detail).join(" | ")} values`;

/**
 * Notice for conflicts: these names are generated as `string` everywhere and
 * never parsed, and the schema should be fixed. One line per name.
 */
export const formatConflicts = (r: DateKeyReport): string =>
  [
    "Date-time property names that are also plain strings in a response. " +
      "Response dates are parsed into Date by property name, so these are " +
      "declared as string everywhere and never parsed. Use date-time " +
      "consistently in the spec to get Date:",
    ...r.conflicts.map(formatConflict),
  ].join("\n");

/**
 * Report for suspects, one line per record. The caller says what it did
 * about them (failed, or generated anyway under the override).
 */
export const formatSuspects = (r: DateKeyReport): string =>
  [
    "Response objects with arbitrary keys and string values. Response dates " +
      "are parsed into Date by property name, so a key equal to a date-time " +
      "property name would have its value parsed despite being typed string:",
    ...r.suspects.map(formatSuspect),
  ].join("\n");

export const formatUnsupported = (r: DateKeyReport): string =>
  [
    "Response date-times without a property name can't be parsed by name:",
    ...r.unsupported.map((u) => `  ${u}`),
  ].join("\n");
