/*d
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { afterEach, expect, test } from "vitest";
import type { OpenAPIV3 } from "openapi-types";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  buildDateParsers,
  getSchemaEntrypoints,
  getSchemasNeedingParser,
  type DateParsers,
} from "./dateParsers";

const iso = "2022-05-01T02:03:04Z";
const date = new Date(Date.UTC(2022, 4, 1, 2, 3, 4));

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

const ref = (name: string): OpenAPIV3.ReferenceObject => ({
  $ref: `#/components/schemas/${name}`,
});

const dateTime: OpenAPIV3.SchemaObject = {
  type: "string",
  format: "date-time",
};

const object = (
  properties: Record<string, OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject>
): OpenAPIV3.SchemaObject => ({
  type: "object",
  properties,
});

const array = (
  items: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject
): OpenAPIV3.ArraySchemaObject => ({
  type: "array",
  items,
});

const okResponse = (
  schema: OpenAPIV3.ReferenceObject | OpenAPIV3.ArraySchemaObject
): OpenAPIV3.ResponseObject => ({
  description: "ok",
  content: { "application/json": { schema } },
});

const get = (
  operationId: string,
  schema: OpenAPIV3.ReferenceObject | OpenAPIV3.ArraySchemaObject
): OpenAPIV3.OperationObject => ({
  operationId,
  responses: { "200": okResponse(schema) },
});

const spec = (
  schemas: OpenAPIV3.ComponentsObject["schemas"],
  paths: OpenAPIV3.PathsObject = {}
): OpenAPIV3.Document => ({
  openapi: "3.0.3",
  info: { title: "test", version: "0.0.0" },
  paths,
  components: { schemas },
});

async function importGeneratedParsers(dateParsers: DateParsers) {
  const dir = mkdtempSync(join(tmpdir(), "date-parsers-test-"));
  tempDirs.push(dir);
  const file = join(dir, "date-parsers.ts");
  writeFileSync(file, dateParsers.content);
  return (await import(file)) as Record<string, (o: unknown) => unknown>;
}

async function parserFor(dateParsers: DateParsers, successType: string) {
  const expr = dateParsers.parserExpr(successType);
  if (!expr) throw new Error(`no date parser for ${successType}`);
  const P = await importGeneratedParsers(dateParsers);
  return P[expr.slice(2)];
}

test("builds parsers for object, results page, and array success types", async () => {
  const dateParsers = buildDateParsers(
    spec(
      {
        Thing: object({
          id: { type: "string" },
          time_created: dateTime,
        }),
        ThingResultsPage: object({
          items: array(ref("Thing")),
          next_page: { type: "string", nullable: true },
        }),
      },
      {
        "/things": { get: get("thing_list", ref("ThingResultsPage")) },
        "/things/all": {
          get: get("thing_list_all", array(ref("Thing"))),
        },
      }
    )
  );

  expect(dateParsers.parserExpr("Plain")).toBeNull();

  const pageParser = await parserFor(dateParsers, "ThingResultsPage");
  expect(pageParser({ items: [{ id: "x", timeCreated: iso }] })).toEqual({
    items: [{ id: "x", timeCreated: date }],
  });

  const arrayParser = await parserFor(dateParsers, "Thing[]");
  expect(arrayParser([{ id: "x", timeCreated: iso }])).toEqual([
    { id: "x", timeCreated: date },
  ]);
});

test("parses arrays of date-time strings", async () => {
  const dateParsers = buildDateParsers(
    spec(
      {
        Points: object({
          timestamps: array(dateTime),
        }),
      },
      { "/points": { get: get("points_view", ref("Points")) } }
    )
  );

  const parser = await parserFor(dateParsers, "Points");
  expect(parser({ timestamps: [iso, iso] })).toEqual({
    timestamps: [date, date],
  });
});

test("unparseable date-time values get rejected", async () => {
  const dateParsers = buildDateParsers(
    spec(
      {
        Thing: object({ time_created: dateTime }),
      },
      { "/thing": { get: get("thing_view", ref("Thing")) } }
    )
  );

  const parser = await parserFor(dateParsers, "Thing");
  expect(() =>
    parser({ timeCreated: "not a date" })
  ).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected a valid date string, instead received "not a date"]`
  );
});

// This should never be reached, but if it is, it's a problem in the codegen,
// and at client time the right thing to do is simply leave the value alone.
test("non-string values expected to be datetimes are ignored", async () => {
  const dateParsers = buildDateParsers(
    spec(
      {
        Thing: object({ actuallyANumber: dateTime }),
      },
      { "/thing": { get: get("thing_view", ref("Thing")) } }
    )
  );

  const parser = await parserFor(dateParsers, "Thing");
  const parsed = parser({ actuallyANumber: 4 }) as {
    actuallyANumber: Date;
  };
  expect(parsed.actuallyANumber).toEqual(4);
  // null and absent fields are also left alone
  expect(parser({ actuallyANumber: null })).toEqual({ actuallyANumber: null });
  expect(parser({})).toEqual({});
});

test("deduplicates schemas with the same date shape", () => {
  const dateParsers = buildDateParsers(
    spec(
      {
        AddressLot: object({
          time_created: dateTime,
          time_modified: dateTime,
        }),
        Project: object({
          time_created: dateTime,
          time_modified: dateTime,
        }),
      },
      {
        "/lots": { get: get("lot_view", ref("AddressLot")) },
        "/projects": { get: get("project_view", ref("Project")) },
      }
    )
  );

  expect(dateParsers.parserExpr("AddressLot")).toBe(
    dateParsers.parserExpr("Project")
  );
  expect(dateParsers.content.match(/^export const n/gm)).toHaveLength(1);
});

// Date fields that only travel toward the server have no parsing to do, so a
// schema referenced solely from query params (or a request body) gets no
// function, no matter what it contains.
test("skips date-bearing schemas that never appear in a response", () => {
  const dateParsers = buildDateParsers(
    spec(
      {
        TimeFilter: object({
          start_time: dateTime,
          end_time: dateTime,
        }),
        Thing: object({
          time_created: dateTime,
        }),
      },
      {
        "/things": {
          get: {
            operationId: "thing_list",
            parameters: [
              { name: "filter", in: "query", schema: ref("TimeFilter") },
            ],
            responses: { "200": okResponse(ref("Thing")) },
          },
        },
      }
    )
  );

  expect(dateParsers.parserExpr("Thing")).not.toBeNull();
  expect(dateParsers.parserExpr("TimeFilter")).toBeNull();
  // and no unreferenced function is left in the generated file
  expect(dateParsers.content.match(/^export const n/gm)).toHaveLength(1);
});

test("handles the Nexus-style oneOf shape where only one variant has dates", async () => {
  const dateParsers = buildDateParsers(
    spec(
      {
        ExternalIp: {
          oneOf: [
            object({
              kind: { type: "string", enum: ["snat"] },
              ip: { type: "string" },
            }),
            object({
              kind: { type: "string", enum: ["floating"] },
              ip: { type: "string" },
              time_created: dateTime,
              time_modified: dateTime,
            }),
          ],
        },
      },
      { "/ips": { get: get("ip_view", ref("ExternalIp")) } }
    )
  );

  const parser = await parserFor(dateParsers, "ExternalIp");

  expect(parser({ kind: "snat", ip: "192.0.2.1" })).toEqual({
    kind: "snat",
    ip: "192.0.2.1",
  });
  expect(
    parser({ kind: "floating", ip: "192.0.2.2", timeCreated: iso })
  ).toEqual({
    kind: "floating",
    ip: "192.0.2.2",
    timeCreated: date,
  });
});

// The Datum/datum shape: variants point at different schemas, but those
// schemas have the same date fields, so the merged parser is correct. Compared
// structurally rather than by schema name, or this would throw.
test("merges union variants whose date fields differ only by schema name", async () => {
  const dateParsers = buildDateParsers(
    spec(
      {
        Cumulativeint64: object({
          start_time: dateTime,
          value: { type: "integer" },
        }),
        Cumulativedouble: object({
          start_time: dateTime,
          value: { type: "number" },
        }),
        Datum: {
          oneOf: [
            object({ datum: ref("Cumulativeint64") }),
            object({ datum: ref("Cumulativedouble") }),
          ],
        },
      },
      { "/datum": { get: get("datum_view", ref("Datum")) } }
    )
  );

  const parser = await parserFor(dateParsers, "Datum");
  expect(parser({ datum: { startTime: iso, value: 1 } })).toEqual({
    datum: { startTime: date, value: 1 },
  });
});

// Note the path: schemas that can't appear in a response are never walked, so
// even a malformed union only aborts codegen when something would parse it.
test("rejects union variants that disagree on a date field's shape", () => {
  const build = () =>
    buildDateParsers(
      spec(
        {
          Mixed: {
            oneOf: [
              object({ when: dateTime }),
              object({ when: array(dateTime) }),
            ],
          },
        },
        { "/mixed": { get: get("mixed_view", ref("Mixed")) } }
      )
    );

  expect(build).toThrowErrorMatchingInlineSnapshot(
    `[Error: Union members disagree on the shape of date field 'when': 'date' vs 'array(date)']`
  );
});

// First-wins in `mergeFields` applies only to a name collision. A field that
// appears in just one variant still makes it into the merged parser.
test("merges distinct date fields from different union variants", async () => {
  const dateParsers = buildDateParsers(
    spec(
      {
        U: {
          oneOf: [
            object({ time_created: dateTime }),
            object({ time_modified: dateTime }),
          ],
        },
      },
      { "/u": { get: get("u_view", ref("U")) } }
    )
  );

  const parser = await parserFor(dateParsers, "U");
  expect(parser({ timeCreated: iso })).toEqual({ timeCreated: date });
  expect(parser({ timeModified: iso })).toEqual({ timeModified: date });
});

// Schemas in a $ref cycle get mutually recursive functions: names are
// assigned before bodies are rendered (skipping the body-keyed dedup, which
// can't name a function it hasn't rendered), and the generated consts can
// forward-reference each other because nothing calls a parser during module
// evaluation.
test("parses mutually recursive date-bearing schemas", async () => {
  const dateParsers = buildDateParsers(
    spec(
      {
        A: object({ b: ref("B"), time_created: dateTime }),
        B: object({ a: ref("A"), time_modified: dateTime }),
      },
      { "/a": { get: get("a_view", ref("A")) } }
    )
  );

  const parser = await parserFor(dateParsers, "A");
  expect(
    parser({
      timeCreated: iso,
      b: {
        timeModified: iso,
        a: { timeCreated: iso, b: { timeModified: iso } },
      },
    })
  ).toEqual({
    timeCreated: date,
    b: {
      timeModified: date,
      a: { timeCreated: date, b: { timeModified: date } },
    },
  });
  // B gets a function of its own rather than sharing A's
  expect(dateParsers.parserExpr("B")).not.toBeNull();
  expect(dateParsers.parserExpr("B")).not.toBe(dateParsers.parserExpr("A"));
});

test("parses a self-referential schema", async () => {
  const dateParsers = buildDateParsers(
    spec(
      {
        A: object({ a: ref("A"), time_created: dateTime }),
      },
      { "/a": { get: get("a_view", ref("A")) } }
    )
  );

  const parser = await parserFor(dateParsers, "A");
  expect(
    parser({
      timeCreated: iso,
      a: { timeCreated: iso, a: { timeCreated: iso } },
    })
  ).toEqual({
    timeCreated: date,
    a: { timeCreated: date, a: { timeCreated: date } },
  });
});

test("tolerates a reference cycle that carries no dates", () => {
  const dateParsers = buildDateParsers(
    spec({
      A: object({ b: ref("B") }),
      B: object({ a: ref("A") }),
    })
  );

  expect(dateParsers.parserExpr("A")).toBeNull();
  expect(dateParsers.parserExpr("B")).toBeNull();
});

// A neighbors a date-free cycle without being in one. B and C can't reach a
// date, so they aren't date-bearing, A's ref to B contributes nothing, and
// A's parser only handles its own field.
test("parses a schema that points into a date-free cycle", async () => {
  const dateParsers = buildDateParsers(
    spec(
      {
        A: object({ time_created: dateTime, b: ref("B") }),
        B: object({ c: ref("C") }),
        C: object({ b: ref("B") }),
      },
      { "/a": { get: get("a_view", ref("A")) } }
    )
  );

  const parser = await parserFor(dateParsers, "A");
  expect(parser({ timeCreated: iso })).toEqual({ timeCreated: date });
  expect(dateParsers.parserExpr("B")).toBeNull();
});

// B and C have no date fields of their own, but both reach one through D, so
// both are date-bearing and their parsers call each other. What makes a
// schema date-bearing is reachability, not a date sitting directly on it.
test("parses a cycle whose dates sit outside the cycle", async () => {
  const dateParsers = buildDateParsers(
    spec(
      {
        B: object({ c: ref("C") }),
        C: object({ b: ref("B"), d: ref("D") }),
        D: object({ time_created: dateTime }),
      },
      { "/b": { get: get("b_view", ref("B")) } }
    )
  );

  const parser = await parserFor(dateParsers, "B");
  expect(
    parser({
      c: { d: { timeCreated: iso }, b: { c: { d: { timeCreated: iso } } } },
    })
  ).toEqual({
    c: { d: { timeCreated: date }, b: { c: { d: { timeCreated: date } } } },
  });
});

test("parses an object nested in an object", async () => {
  const dateParsers = buildDateParsers(
    spec(
      {
        Outer: object({
          inner: object({ time_created: dateTime, id: { type: "string" } }),
        }),
      },
      { "/outer": { get: get("outer_view", ref("Outer")) } }
    )
  );

  const parser = await parserFor(dateParsers, "Outer");
  expect(parser({ inner: { timeCreated: iso, id: "x" } })).toEqual({
    inner: { timeCreated: date, id: "x" },
  });
  expect(parser({ inner: null })).toEqual({ inner: null });
  expect(parser({ inner: {} })).toEqual({ inner: {} });
  expect(parser({})).toEqual({});
});

test("parses a multi-member oneOf in an object", async () => {
  const dateParsers = buildDateParsers(
    spec(
      {
        A: object({ time_created: dateTime }),
        B: object({ time_modified: dateTime }),
        Outer: object({ inner: { oneOf: [ref("A"), ref("B")] } }),
      },
      { "/outer": { get: get("outer_view", ref("Outer")) } }
    )
  );

  const parser = await parserFor(dateParsers, "Outer");
  expect(parser({ inner: { timeCreated: iso } })).toEqual({
    inner: { timeCreated: date },
  });
  expect(parser({ inner: { timeModified: iso } })).toEqual({
    inner: { timeModified: date },
  });
  expect(parser({ inner: null })).toEqual({ inner: null });
});

test("parses arrays of objects", async () => {
  const dateParsers = buildDateParsers(
    spec(
      {
        Outer: object({
          events: array(object({ time: dateTime })),
        }),
      },
      { "/outer": { get: get("outer_view", ref("Outer")) } }
    )
  );

  const parser = await parserFor(dateParsers, "Outer");
  expect(parser({ events: [{ time: iso }, { time: null }, {}, null] })).toEqual(
    {
      events: [{ time: date }, { time: null }, {}, null],
    }
  );
});

test("parses arrays of arrays (of date-time strings)", async () => {
  const dateParsers = buildDateParsers(
    spec(
      {
        Outer: object({
          grid: array(array(dateTime)),
        }),
      },
      { "/outer": { get: get("outer_view", ref("Outer")) } }
    )
  );

  const parser = await parserFor(dateParsers, "Outer");
  expect(parser({ grid: [[iso], [], [iso, iso]] })).toEqual({
    grid: [[date], [], [date, date]],
  });
});

test("parses top-level arrays of objects", async () => {
  const dateParsers = buildDateParsers(
    spec(
      {
        Events: array(object({ time: dateTime })),
      },
      { "/events": { get: get("events_view", ref("Events")) } }
    )
  );

  const parser = await parserFor(dateParsers, "Events");
  expect(parser([{ time: iso }, {}])).toEqual([{ time: date }, {}]);
});

test("parses objects/arrays in a $ref cycle", async () => {
  const dateParsers = buildDateParsers(
    spec(
      {
        Tree: object({
          meta: object({ time_created: dateTime, parent: ref("Tree") }),
          children: array(object({ child: ref("Tree") })),
        }),
      },
      { "/items": { get: get("tree_view", ref("Tree")) } }
    )
  );

  const parser = await parserFor(dateParsers, "Tree");
  expect(
    parser({
      meta: { timeCreated: iso, parent: { meta: { timeCreated: iso } } },
      children: [{ child: { meta: { timeCreated: iso }, children: [] } }],
    })
  ).toEqual({
    meta: { timeCreated: date, parent: { meta: { timeCreated: date } } },
    children: [{ child: { meta: { timeCreated: date }, children: [] } }],
  });
});

// The one shape that stays fatal: merging a oneOf/allOf means flattening its
// members' fields into a single set (the generated parsers are type-blind, so
// there's no way to dispatch per variant), and members that $ref back into a
// union being flattened would expand forever.
test("rejects a union whose flattening cycles", () => {
  const build = () =>
    buildDateParsers(
      spec(
        {
          U: {
            oneOf: [ref("W"), object({ time_created: dateTime })],
          },
          W: {
            oneOf: [ref("U"), object({ time_modified: dateTime })],
          },
        },
        { "/u": { get: get("u_view", ref("U")) } }
      )
    );

  expect(build).toThrowError(/Union flattening cycles back through/);
});

// Other functions depend on getSchemasNeedingParser capturing 100% of the
// schemas that are relevant to date parser generation. If this function were
// to fail to capture one, no parser would be emitted for that type, leaving
// client instances of that type with a string where TS believes it to be a
// date!
test("getSchemasNeedingParser picks all response-reachable date-bearing schemas", () => {
  const s = spec(
    {
      Root: object({ w: ref("Wrapper"), name: { type: "string" } }),
      Wrapper: object({ d: ref("Dated") }),
      Dated: object({ time_created: dateTime }),
      Plain: object({ name: { type: "string" } }),
      // we do _not_ care to generate a parser for queries!
      QueryFilter: object({ start_time: dateTime }),
    },
    {
      "/roots": {
        get: {
          operationId: "root_list",
          parameters: [
            { name: "filter", in: "query", schema: ref("QueryFilter") },
          ],
          responses: {
            "200": okResponse(array(ref("Root"))),
          },
        },
      },
      "/plain": { get: get("plain_view", ref("Plain")) },
    }
  );

  const { schemaNames, scanOf } = getSchemaEntrypoints(s);
  expect(getSchemasNeedingParser(s, schemaNames, scanOf)).toEqual(
    new Set(["Root", "Wrapper", "Dated"])
  );
});
