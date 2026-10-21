/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { describe, expect, it } from "vitest";
import type { OpenAPIV3 } from "openapi-types";
import {
  analyzeDateKeys,
  demoteConflicts,
  formatConflicts,
  formatSuspects,
} from "./dates";

type Schemas = Record<string, OpenAPIV3.SchemaObject>;

const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const json = (schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject) => ({
  content: { "application/json": { schema } },
});
const date: OpenAPIV3.SchemaObject = { type: "string", format: "date-time" };
const obj = (
  properties: OpenAPIV3.SchemaObject["properties"],
): OpenAPIV3.SchemaObject => ({ type: "object", properties });

/**
 * Spec with one GET whose 200 response is `response`, and optionally a POST
 * whose request body is `request`.
 */
const makeSpec = ({
  schemas,
  response,
  request,
}: {
  schemas: Schemas;
  response: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
  request?: OpenAPIV3.ReferenceObject;
}): OpenAPIV3.Document => ({
  openapi: "3.0.3",
  info: { title: "test", version: "0.0.0" },
  paths: {
    "/thing": {
      get: {
        operationId: "thing_view",
        responses: {
          "200": { description: "ok", ...json(response) },
          "4XX": { $ref: "#/components/responses/Error" },
        },
      },
      ...(request && {
        post: {
          operationId: "thing_create",
          requestBody: json(request),
          responses: { "204": { description: "ok" } },
        },
      }),
    },
  },
  components: {
    schemas: {
      Error: obj({ message: { type: "string" } }),
      ...schemas,
    },
    responses: { Error: { description: "error", ...json(ref("Error")) } },
  },
});

const analyze = (args: Parameters<typeof makeSpec>[0]) =>
  analyzeDateKeys(makeSpec(args));

describe("analyzeDateKeys", () => {
  it("collects keys from response-reachable schemas only", () => {
    const r = analyze({
      schemas: {
        Thing: obj({ time_created: date, inner: ref("Inner") }),
        Inner: obj({ last_seen: { ...date, nullable: true } }),
        Unused: obj({ time_unused: date }),
        Body: obj({ time_requested: date }),
      },
      response: ref("Thing"),
      request: ref("Body"),
    });
    expect(r).toEqual({
      dateKeys: ["last_seen", "time_created"],
      conflicts: [],
      suspects: [],
      unsupported: [],
    });
  });

  it("follows inline response schemas and error responses", () => {
    const r = analyze({
      schemas: {
        Item: obj({ created_at: date }),
        Error: obj({ message: { type: "string" }, time_failed: date }),
      },
      response: { type: "array", items: ref("Item") },
    });
    expect(r.dateKeys).toEqual(["created_at", "time_failed"]);
  });

  it("counts date-time in array items and nested arrays", () => {
    const r = analyze({
      schemas: {
        Thing: obj({
          timestamps: { type: "array", items: date },
          grid: { type: "array", items: { type: "array", items: date } },
        }),
      },
      response: ref("Thing"),
    });
    expect(r.dateKeys).toEqual(["grid", "timestamps"]);
    expect(r.conflicts).toEqual([]);
  });

  it("counts date-time behind allOf and $ref", () => {
    const r = analyze({
      schemas: {
        Timestamp: date,
        Thing: obj({
          expires: { nullable: true, allOf: [ref("Timestamp")] },
        }),
      },
      response: ref("Thing"),
    });
    expect(r.dateKeys).toEqual(["expires"]);
  });

  it("flags a same-named string property as a conflict", () => {
    const r = analyze({
      schemas: {
        Thing: obj({ created: date, other: ref("Other") }),
        Other: obj({ created: { type: "string", format: "uuid" } }),
      },
      response: ref("Thing"),
    });
    expect(r.dateKeys).toEqual([]);
    expect(r.conflicts).toEqual([
      {
        name: "created",
        dates: [
          {
            name: "created",
            owner: "Thing",
            leaf: "date",
            detail: "date-time",
          },
        ],
        others: [
          {
            name: "created",
            owner: "Other",
            leaf: "string",
            detail: "string:uuid",
          },
        ],
      },
    ]);
  });

  it("does not flag same-named numbers, plain enums, or untyped values", () => {
    const r = analyze({
      schemas: {
        Thing: obj({ start: date, a: ref("A"), b: ref("B"), c: ref("C") }),
        A: obj({ start: { type: "integer", format: "uint32" } }),
        B: obj({ start: {} }),
        C: obj({ start: { type: "string", enum: ["now", "later"] } }),
      },
      response: ref("Thing"),
    });
    expect(r.conflicts).toEqual([]);
  });

  it("flags an enum with a timestamp-like member as a conflict", () => {
    const r = analyze({
      schemas: {
        Thing: obj({ start: date, a: ref("A") }),
        A: obj({
          start: { type: "string", enum: ["2024-01-01T00:00:00Z", "never"] },
        }),
      },
      response: ref("Thing"),
    });
    expect(r.conflicts.map((c) => c.others.map((o) => o.detail))).toEqual([
      ["enum"],
    ]);
  });

  it("does not flag a same-named object property", () => {
    const r = analyze({
      schemas: {
        Thing: obj({ created: date, other: ref("Other") }),
        Other: obj({ created: ref("Info") }),
        Info: obj({ by: { type: "string" } }),
      },
      response: ref("Thing"),
    });
    expect(r.conflicts).toEqual([]);
  });

  it("flags a oneOf with a string variant as a conflict", () => {
    const r = analyze({
      schemas: {
        Thing: obj({ created: date, other: ref("Other") }),
        Other: obj({
          created: { oneOf: [ref("Info"), { type: "string" }] },
        }),
        Info: obj({ by: { type: "string" } }),
      },
      response: ref("Thing"),
    });
    expect(r.conflicts.map((c) => c.others.map((o) => o.leaf))).toEqual([
      ["string"],
    ]);
  });

  it("ignores conflicts that only occur in request bodies", () => {
    const r = analyze({
      schemas: {
        Thing: obj({ created: date }),
        Body: obj({ created: { type: "string" } }),
      },
      response: ref("Thing"),
      request: ref("Body"),
    });
    expect(r.dateKeys).toEqual(["created"]);
    expect(r.conflicts).toEqual([]);
  });

  it("flags only records whose values can be plain strings", () => {
    // untyped, free-form, object, number, and plain-enum values are never
    // misparsed, so none of those are findings
    const r = analyze({
      schemas: {
        Thing: obj({
          strings: { type: "object", additionalProperties: { type: "string" } },
          unknowns: { type: "object", additionalProperties: {} },
          anything: { type: "object", additionalProperties: true },
          free: { type: "object" },
          objects: { type: "object", additionalProperties: ref("Info") },
          ints: { type: "object", additionalProperties: { type: "integer" } },
          enums: {
            type: "object",
            additionalProperties: {
              type: "array",
              items: { type: "string", enum: ["a", "b"] },
            },
          },
        }),
        Info: obj({ by: { type: "integer" } }),
      },
      response: ref("Thing"),
    });
    expect(r.suspects.map((s) => s.owner)).toEqual(["Thing.strings"]);
  });

  it("ignores records that are only in request bodies", () => {
    const r = analyze({
      schemas: {
        Thing: obj({ id: { type: "string" } }),
        Body: obj({
          tags: { type: "object", additionalProperties: { type: "string" } },
        }),
      },
      response: ref("Thing"),
      request: ref("Body"),
    });
    expect(r.suspects).toEqual([]);
  });

  it("reports a response that is itself a date as unsupported", () => {
    expect(analyze({ schemas: {}, response: date }).unsupported).toEqual([
      "GET /thing 200",
    ]);
    expect(
      analyze({ schemas: {}, response: { type: "array", items: date } })
        .unsupported,
    ).toEqual(["GET /thing 200"]);
  });

  it("reports a record of dates as unsupported", () => {
    const r = analyze({
      schemas: {
        Thing: obj({ by_id: { type: "object", additionalProperties: date } }),
      },
      response: ref("Thing"),
    });
    expect(r.unsupported).toEqual(["Thing.by_id.*"]);
  });

  it("handles recursive schemas", () => {
    const r = analyze({
      schemas: {
        Node: obj({
          time_created: date,
          children: { type: "array", items: ref("Node") },
        }),
      },
      response: ref("Node"),
    });
    expect(r.dateKeys).toEqual(["time_created"]);
  });
});

describe("demoteConflicts", () => {
  const demoted = (schemas: Schemas, names: string[]) =>
    demoteConflicts(makeSpec({ schemas, response: ref("Thing") }), names)
      .components!.schemas! as Schemas;

  it("returns the spec unchanged when there is nothing to demote", () => {
    const spec = makeSpec({
      schemas: { Thing: obj({ created: date }) },
      response: ref("Thing"),
    });
    expect(demoteConflicts(spec, [])).toBe(spec);
  });

  it("turns named date-time properties into plain strings everywhere", () => {
    const schemas = demoted(
      {
        Thing: obj({
          created: { ...date, nullable: true, description: "when" },
          updated: date,
        }),
        Body: obj({ created: date }),
      },
      ["created"],
    );
    expect(schemas.Thing!.properties!.created).toEqual({
      type: "string",
      nullable: true,
      description: "when",
    });
    expect(schemas.Thing!.properties!.updated).toEqual(date);
    expect(schemas.Body!.properties!.created).toEqual({ type: "string" });
  });

  it("demotes inside arrays, unions, and nested inline objects", () => {
    const schemas = demoted(
      {
        Timestamp: date,
        Thing: obj({
          created: { type: "array", items: date },
          expires: { nullable: true, allOf: [ref("Timestamp")] },
          inner: obj({ created: date }),
          list: { type: "array", items: obj({ created: date }) },
        }),
      },
      ["created", "expires"],
    );
    const props = schemas.Thing!.properties!;
    expect(props.created).toEqual({
      type: "array",
      items: { type: "string" },
    });
    expect(props.expires).toEqual({
      nullable: true,
      allOf: [{ type: "string" }],
    });
    expect((props.inner as OpenAPIV3.SchemaObject).properties!.created).toEqual(
      { type: "string" },
    );
    const list = props.list as OpenAPIV3.ArraySchemaObject;
    expect((list.items as OpenAPIV3.SchemaObject).properties!.created).toEqual({
      type: "string",
    });
    // the named date schema itself is untouched; only refs to it are inlined
    expect(schemas.Timestamp).toEqual(date);
  });

  it("leaves refs to object schemas alone", () => {
    const schemas = demoted(
      {
        Thing: obj({ created: ref("Info") }),
        Info: obj({ created: date }),
      },
      ["created"],
    );
    expect(schemas.Thing!.properties!.created).toEqual(ref("Info"));
    expect(schemas.Info!.properties!.created).toEqual({ type: "string" });
  });

  it("makes the analysis conflict-free", () => {
    const spec = makeSpec({
      schemas: {
        Thing: obj({ created: date, updated: date, other: ref("Other") }),
        Other: obj({ created: { type: "string", format: "uuid" } }),
      },
      response: ref("Thing"),
    });
    const r = analyzeDateKeys(spec);
    expect(r.conflicts.map((c) => c.name)).toEqual(["created"]);
    const after = analyzeDateKeys(
      demoteConflicts(
        spec,
        r.conflicts.map((c) => c.name),
      ),
    );
    expect(after.conflicts).toEqual([]);
    expect(after.dateKeys).toEqual(["updated"]);
  });
});

describe("report formatting", () => {
  const r = analyze({
    schemas: {
      Thing: obj({
        created: date,
        other: ref("Other"),
        labels: { type: "object", additionalProperties: { type: "string" } },
      }),
      Other: obj({
        created: { type: "string", format: "uuid" },
        also: ref("Also"),
      }),
      Also: obj({ created: { type: "boolean" } }),
    },
    response: ref("Thing"),
  });

  it("lists conflicts", () => {
    expect(formatConflicts(r)).toMatchInlineSnapshot(`
      "Date-time property names that are also plain strings in a response. Response dates are parsed into Date by property name, so these are declared as string everywhere and never parsed. Use date-time consistently in the spec to get Date:
        created: date-time in Thing; string:uuid in Other"
    `);
  });

  it("lists suspects", () => {
    expect(formatSuspects(r)).toMatchInlineSnapshot(`
      "Response objects with arbitrary keys and string values. Response dates are parsed into Date by property name, so a key equal to a date-time property name would have its value parsed despite being typed string:
        Thing.labels: record with string values"
    `);
  });
});
