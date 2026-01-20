/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { beforeEach, expect, test } from "vitest";
import { initIO, TestWritable } from "../io";
import { schemaToZod } from "./zod";

const out = new TestWritable();
const io = initIO(out);

beforeEach(() => {
  out.clear();
});

test("boolean", () => {
  schemaToZod({ type: "boolean" }, io);
  expect(out.value()).toMatchInlineSnapshot('"SafeBoolean"');
});

test("boolean with default", () => {
  schemaToZod({ type: "boolean", default: false }, io);
  expect(out.value()).toMatchInlineSnapshot('"SafeBoolean.default(false)"');
});

test("string", () => {
  schemaToZod({ type: "string" }, io);
  expect(out.value()).toMatchInlineSnapshot('"z.string()"');
});

test("string with default", () => {
  schemaToZod({ type: "string", default: "test" }, io);
  expect(out.value()).toMatchInlineSnapshot(`"z.string().default("test")"`);
});

test("string nullable", () => {
  schemaToZod({ type: "string", nullable: true }, io);
  expect(out.value()).toMatchInlineSnapshot('"z.string().nullable()"');
});

test("string with minLength and maxLength", () => {
  schemaToZod({ type: "string", minLength: 1, maxLength: 100 }, io);
  expect(out.value()).toMatchInlineSnapshot('"z.string().min(1).max(100)"');
});

test("string with pattern", () => {
  schemaToZod({ type: "string", pattern: "^[a-z]+$" }, io);
  expect(out.value()).toMatchInlineSnapshot('"z.string().regex(/^[a-z]+$/)"');
});

test("string format uuid", () => {
  schemaToZod({ type: "string", format: "uuid" }, io);
  expect(out.value()).toMatchInlineSnapshot('"z.uuid()"');
});

test("string format ip", () => {
  schemaToZod({ type: "string", format: "ip" }, io);
  expect(out.value()).toMatchInlineSnapshot('"z.union([z.ipv4(), z.ipv6()])"');
});

test("string format ipv4", () => {
  schemaToZod({ type: "string", format: "ipv4" }, io);
  expect(out.value()).toMatchInlineSnapshot('"z.ipv4()"');
});

test("string format ipv6", () => {
  schemaToZod({ type: "string", format: "ipv6" }, io);
  expect(out.value()).toMatchInlineSnapshot('"z.ipv6()"');
});

test("boolean nullable", () => {
  schemaToZod({ type: "boolean", nullable: true }, io);
  expect(out.value()).toMatchInlineSnapshot('"SafeBoolean.nullable()"');
});

test("number", () => {
  schemaToZod({ type: "number" }, io);
  expect(out.value()).toMatchInlineSnapshot('"z.number()"');
});

test("number nullable", () => {
  schemaToZod({ type: "number", nullable: true }, io);
  expect(out.value()).toMatchInlineSnapshot('"z.number().nullable()"');
});

test("number with default", () => {
  schemaToZod({ type: "number", default: 3.14 }, io);
  expect(out.value()).toMatchInlineSnapshot('"z.number().default(3.14)"');
});

test("number nullable with default", () => {
  schemaToZod({ type: "number", nullable: true, default: null }, io);
  expect(out.value()).toMatchInlineSnapshot(
    '"z.number().nullable().default(null)"'
  );
});

test("integer", () => {
  schemaToZod({ type: "integer" }, io);
  expect(out.value()).toMatchInlineSnapshot('"z.number()"');
});

test("integer with format uint8", () => {
  schemaToZod({ type: "integer", format: "uint8" }, io);
  expect(out.value()).toMatchInlineSnapshot('"z.number().min(0).max(255)"');
});

test("integer with format int16", () => {
  schemaToZod({ type: "integer", format: "int16" }, io);
  expect(out.value()).toMatchInlineSnapshot(
    '"z.number().min(-32767).max(32767)"'
  );
});

test("integer with explicit min/max", () => {
  schemaToZod({ type: "integer", minimum: 5, maximum: 10 }, io);
  expect(out.value()).toMatchInlineSnapshot('"z.number().min(5).max(10)"');
});

test("integer with default", () => {
  schemaToZod({ type: "integer", default: 42 }, io);
  expect(out.value()).toMatchInlineSnapshot('"z.number().default(42)"');
});

test("integer with constraints and default", () => {
  schemaToZod({ type: "integer", minimum: 0, maximum: 65535, default: 0 }, io);
  expect(out.value()).toMatchInlineSnapshot(
    '"z.number().min(0).max(65535).default(0)"'
  );
});

test("integer nullable with constraints and default", () => {
  schemaToZod(
    {
      type: "integer",
      minimum: 0,
      maximum: 65535,
      nullable: true,
      default: null,
    },
    io
  );
  expect(out.value()).toMatchInlineSnapshot(
    '"z.number().min(0).max(65535).nullable().default(null)"'
  );
});

test("integer nullable", () => {
  schemaToZod({ type: "integer", nullable: true }, io);
  expect(out.value()).toMatchInlineSnapshot('"z.number().nullable()"');
});

test("integer enum", () => {
  schemaToZod({ type: "integer", enum: [1, 2, 3] }, io);
  expect(out.value()).toMatchInlineSnapshot('"IntEnum([1,2,3] as const)"');
});

test("string enum", () => {
  schemaToZod({ type: "string", enum: ["a", "b", "c"] }, io);
  expect(out.value()).toMatchInlineSnapshot(`"z.enum(["a","b","c"])"`);
});

test("string enum nullable", () => {
  schemaToZod({ type: "string", enum: ["a", "b"], nullable: true }, io);
  expect(out.value()).toMatchInlineSnapshot(`"z.enum(["a","b"]).nullable()"`);
});

test("date", () => {
  schemaToZod({ type: "string", format: "date-time" }, io);
  expect(out.value()).toMatchInlineSnapshot('"z.coerce.date()"');
});

test("date nullable", () => {
  schemaToZod({ type: "string", format: "date-time", nullable: true }, io);
  expect(out.value()).toMatchInlineSnapshot('"z.coerce.date().nullable()"');
});

test("array", () => {
  schemaToZod({ type: "array", items: { type: "string" } }, io);
  expect(out.value()).toMatchInlineSnapshot('"z.string().array()"');
});

test("array nullable", () => {
  schemaToZod({ type: "array", items: { type: "string" }, nullable: true }, io);
  expect(out.value()).toMatchInlineSnapshot('"z.string().array().nullable()"');
});

test("array with default", () => {
  schemaToZod({ type: "array", items: { type: "string" }, default: [] }, io);
  expect(out.value()).toMatchInlineSnapshot('"z.string().array().default([])"');
});

test("array nullable with default", () => {
  schemaToZod(
    {
      type: "array",
      items: { type: "number" },
      nullable: true,
      default: [1, 2],
    },
    io
  );
  expect(out.value()).toMatchInlineSnapshot(
    '"z.number().array().nullable().default([1,2])"'
  );
});

test("array with uniqueItems", () => {
  schemaToZod(
    { type: "array", items: { type: "string" }, uniqueItems: true },
    io
  );
  expect(out.value()).toMatchInlineSnapshot(
    '"z.string().array().refine(...uniqueItems)"'
  );
});

test("ref", () => {
  schemaToZod({ $ref: "#/components/schemas/MyType" }, io);
  expect(out.value()).toMatchInlineSnapshot('"MyType"');
});

test("object with properties", () => {
  schemaToZod(
    {
      type: "object",
      properties: {
        name: { type: "string" },
        age: { type: "integer" },
      },
      required: ["name"],
    },
    io
  );
  expect(out.value()).toMatchInlineSnapshot(`
    "z.object({"name": z.string(),
    "age": z.number().optional(),
    })"
  `);
});

test("object with optional property that has default", () => {
  schemaToZod(
    {
      type: "object",
      properties: {
        name: { type: "string" },
        count: { type: "integer", default: 0 },
      },
      required: ["name"],
    },
    io
  );
  expect(out.value()).toMatchInlineSnapshot(`
    "z.object({"name": z.string(),
    "count": z.number().default(0),
    })"
  `);
});

test("object with optional array that has default", () => {
  schemaToZod(
    {
      type: "object",
      properties: {
        name: { type: "string" },
        tags: { type: "array", items: { type: "string" }, default: [] },
      },
      required: ["name"],
    },
    io
  );
  expect(out.value()).toMatchInlineSnapshot(`
    "z.object({"name": z.string(),
    "tags": z.string().array().default([]),
    })"
  `);
});

test("object with optional nullable property that has default", () => {
  schemaToZod(
    {
      type: "object",
      properties: {
        name: { type: "string" },
        description: { type: "string", nullable: true, default: null },
      },
      required: ["name"],
    },
    io
  );
  expect(out.value()).toMatchInlineSnapshot(`
    "z.object({"name": z.string(),
    "description": z.string().nullable().default(null),
    })"
  `);
});

test("object with optional property WITHOUT default", () => {
  schemaToZod(
    {
      type: "object",
      properties: {
        name: { type: "string" },
        email: { type: "string" },
        phone: { type: "string" },
      },
      required: ["name"],
    },
    io
  );
  expect(out.value()).toMatchInlineSnapshot(`
    "z.object({"name": z.string(),
    "email": z.string().optional(),
    "phone": z.string().optional(),
    })"
  `);
});

test("object mixing required, optional without default, and optional with default", () => {
  schemaToZod(
    {
      type: "object",
      properties: {
        name: { type: "string" },
        age: { type: "integer" },
        count: { type: "integer", default: 0 },
        tags: { type: "array", items: { type: "string" }, default: [] },
      },
      required: ["name"],
    },
    io
  );
  expect(out.value()).toMatchInlineSnapshot(`
    "z.object({"name": z.string(),
    "age": z.number().optional(),
    "count": z.number().default(0),
    "tags": z.string().array().default([]),
    })"
  `);
});

test("object nullable", () => {
  schemaToZod(
    {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
      nullable: true,
    },
    io
  );
  expect(out.value()).toMatchInlineSnapshot(`
    "z.object({"id": z.string(),
    }).nullable()"
  `);
});

test("object as record with additionalProperties", () => {
  schemaToZod({ type: "object", additionalProperties: { type: "number" } }, io);
  expect(out.value()).toMatchInlineSnapshot(
    '"z.record(z.string(),z.number())"'
  );
});

test("object as record without additionalProperties", () => {
  schemaToZod({ type: "object" }, io);
  expect(out.value()).toMatchInlineSnapshot(
    '"z.record(z.string(),z.unknown())"'
  );
});

test("object as record nullable", () => {
  schemaToZod({ type: "object", nullable: true }, io);
  expect(out.value()).toMatchInlineSnapshot(
    '"z.record(z.string(),z.unknown()).nullable()"'
  );
});

test("oneOf single element", () => {
  schemaToZod({ oneOf: [{ type: "string" }] }, io);
  expect(out.value()).toMatchInlineSnapshot('"z.string()"');
});

test("oneOf flattened single-element enums", () => {
  schemaToZod(
    {
      oneOf: [
        { type: "string", enum: ["a"] },
        { type: "string", enum: ["b"] },
        { type: "string", enum: ["c"] },
      ],
    },
    io
  );
  expect(out.value()).toMatchInlineSnapshot(`"z.enum(["a", "b", "c"])"`);
});

test("oneOf union", () => {
  schemaToZod(
    {
      oneOf: [{ type: "string" }, { type: "number" }],
    },
    io
  );
  expect(out.value()).toMatchInlineSnapshot(`
    "z.union([
    z.string(),
    z.number(),
    ])"
  `);
});

test("oneOf nullable", () => {
  schemaToZod(
    {
      oneOf: [{ type: "string" }, { type: "number" }],
      nullable: true,
    },
    io
  );
  expect(out.value()).toMatchInlineSnapshot(`
    "z.union([
    z.string(),
    z.number(),
    ])
    .nullable()"
  `);
});

test("allOf single element", () => {
  schemaToZod({ allOf: [{ type: "string" }] }, io);
  expect(out.value()).toMatchInlineSnapshot('"z.string()"');
});

test("allOf intersection", () => {
  schemaToZod(
    {
      allOf: [
        { $ref: "#/components/schemas/Base" },
        { $ref: "#/components/schemas/Extended" },
      ],
    },
    io
  );
  expect(out.value()).toMatchInlineSnapshot(`
    "z.intersection([
    Base,
    Extended,
    ])"
  `);
});

test("allOf nullable", () => {
  schemaToZod(
    {
      allOf: [{ type: "string" }],
      nullable: true,
    },
    io
  );
  expect(out.value()).toMatchInlineSnapshot('"z.string().nullable()"');
});

test("allOf with default", () => {
  schemaToZod(
    {
      allOf: [{ $ref: "#/components/schemas/Config" }],
      default: { enabled: true },
    },
    io
  );
  expect(out.value()).toMatchInlineSnapshot(
    '"Config.default({"enabled":true})"'
  );
});

test("empty schema", () => {
  schemaToZod({}, io);
  expect(out.value()).toMatchInlineSnapshot(
    '"z.record(z.string(), z.unknown())"'
  );
});

test("object property with default: undefined should still be optional", () => {
  schemaToZod(
    {
      type: "object",
      properties: {
        name: { type: "string" },
        description: { type: "string", default: undefined },
      },
      required: ["name"],
    },
    io
  );
  expect(out.value()).toMatchInlineSnapshot(`
    "z.object({"name": z.string(),
    "description": z.string().optional(),
    })"
  `);
});

test("array default", () => {
  schemaToZod({ type: "array", items: { type: "string" }, default: [] }, io);
  expect(out.value()).toMatchInlineSnapshot('"z.string().array().default([])"');
});

test("array default with values", () => {
  schemaToZod(
    { type: "array", items: { type: "number" }, default: [1, 2, 3] },
    io
  );
  expect(out.value()).toMatchInlineSnapshot(
    '"z.number().array().default([1,2,3])"'
  );
});

test("object default", () => {
  schemaToZod(
    {
      allOf: [{ $ref: "#/components/schemas/Config" }],
      default: { enabled: true },
    },
    io
  );
  expect(out.value()).toMatchInlineSnapshot(
    '"Config.default({"enabled":true})"'
  );
});

test("$ref property should be optional when not required", () => {
  schemaToZod(
    {
      type: "object",
      properties: {
        name: { type: "string" },
        config: { $ref: "#/components/schemas/Config" },
      },
      required: ["name"],
    },
    io
  );
  expect(out.value()).toMatchInlineSnapshot(`
    "z.object({"name": z.string(),
    "config": Config.optional(),
    })"
  `);
});

test("object-typed property with default", () => {
  schemaToZod(
    {
      type: "object",
      properties: {
        name: { type: "string" },
        config: {
          type: "object",
          properties: {
            enable_feature: { type: "boolean" },
            max_retries: { type: "integer" },
          },
          required: ["enable_feature", "max_retries"],
          default: { enable_feature: true, max_retries: 3 },
        },
      },
      required: ["name"],
    },
    io
  );
  expect(out.value()).toMatchInlineSnapshot(`
    "z.object({"name": z.string(),
    "config": z.object({"enableFeature": SafeBoolean,
    "maxRetries": z.number(),
    }).default({"enableFeature":true,"maxRetries":3}),
    })"
  `);
});

test("object-typed property with default should not get .optional()", () => {
  schemaToZod(
    {
      type: "object",
      properties: {
        name: { type: "string" },
        settings: {
          type: "object",
          properties: { foo: { type: "string" } },
          required: ["foo"],
          default: { foo: "bar" },
        },
      },
      required: ["name"],
    },
    io
  );
  const result = out.value();
  // Should have .default() but NOT .optional()
  expect(result).toContain('.default({"foo":"bar"})');
  expect(result).not.toContain('default({"foo":"bar"}).optional()');
});

test("default null without nullable should be skipped and property marked optional", () => {
  schemaToZod(
    {
      type: "object",
      properties: {
        name: { type: "string" },
        value: { type: "string", default: null }, // null default but not nullable
      },
      required: ["name"],
    },
    io
  );
  expect(out.value()).toMatchInlineSnapshot(`
    "z.object({"name": z.string(),
    "value": z.string().optional(),
    })"
  `);
});

test("default null with nullable should emit default", () => {
  schemaToZod(
    {
      type: "object",
      properties: {
        name: { type: "string" },
        value: { type: "string", nullable: true, default: null },
      },
      required: ["name"],
    },
    io
  );
  expect(out.value()).toMatchInlineSnapshot(`
    "z.object({"name": z.string(),
    "value": z.string().nullable().default(null),
    })"
  `);
});
