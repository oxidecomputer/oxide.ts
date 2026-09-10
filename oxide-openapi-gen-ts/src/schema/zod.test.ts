/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { beforeAll, afterAll, beforeEach, expect, test } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { type OpenAPIV3 } from "openapi-types";
import { type ZodType } from "zod/v4";

import { initIO, TestWritable } from "../io";
import { generateTestValidators } from "../test-util";
import { schemaToZod } from "./zod";

const out = new TestWritable();
const io = initIO(out);

beforeEach(() => {
  out.clear();
});

let genDir: string;

beforeAll(() => {
  genDir = mkdtempSync(join(tmpdir(), "zod-schema-test-"));
});

afterAll(() => {
  rmSync(genDir, { recursive: true, force: true });
});

async function generateValidator(
  schema: OpenAPIV3.SchemaObject,
): Promise<ZodType> {
  // Each fixture needs a distinct module path to avoid reusing cached imports.
  const destDir = mkdtempSync(join(genDir, "validator-"));
  const { Validator } = await generateTestValidators(
    {
      openapi: "3.0.0",
      info: { title: "Schema Test", version: "0.0.0" },
      paths: {},
      components: { schemas: { Validator: schema } },
    },
    destDir,
  );
  return Validator!;
}

test.each([
  undefined,
  "int8",
  "uint8",
  "int16",
  "uint16",
  "int32",
  "uint32",
  "int64",
  "uint64",
])(
  "integer format %s rejects fractions and accepts integers",
  async (format) => {
    const validator = await generateValidator({ type: "integer", format });
    for (const value of [2.5, 24.5, -2.5]) {
      expect(validator.safeParse(value).success).toBe(false);
    }
    for (const value of [0, 2, 24]) {
      expect(validator.parse(value)).toBe(value);
    }
    for (const value of [NaN, Infinity, -Infinity, "2", null, undefined]) {
      expect(validator.safeParse(value).success).toBe(false);
    }
  },
);

test.each([
  ["int8", -128, 127],
  ["uint8", 0, 255],
  ["int16", -32768, 32767],
  ["uint16", 0, 65535],
  ["int32", -2147483648, 2147483647],
  ["uint32", 0, 4294967295],
] as const)(
  "integer format %s preserves existing bounds",
  async (format, min, max) => {
    const validator = await generateValidator({ type: "integer", format });
    expect(validator.parse(min)).toBe(min);
    expect(validator.parse(max)).toBe(max);
    expect(validator.safeParse(min - 1).success).toBe(false);
    expect(validator.safeParse(max + 1).success).toBe(false);
  },
);

test.each([undefined, "int8", "uint8", "int64", "uint64"])(
  "explicit integer bounds override format %s bounds",
  async (format) => {
    const validator = await generateValidator({
      type: "integer",
      format,
      minimum: -200,
      maximum: 300,
    });
    expect(validator.parse(-200)).toBe(-200);
    expect(validator.parse(300)).toBe(300);
    for (const value of [-201, 301, 2.5]) {
      expect(validator.safeParse(value).success).toBe(false);
    }
  },
);

test.each([undefined, "int64", "uint64"])(
  "integer format %s preserves values beyond the safe-integer range",
  async (format) => {
    const validator = await generateValidator({ type: "integer", format });
    for (const value of [
      Number.MAX_SAFE_INTEGER,
      2 ** 53,
      2 ** 64,
      Number.MAX_VALUE,
    ]) {
      expect(validator.parse(value)).toBe(value);
      expect(validator.safeParse(-value).success).toBe(format !== "uint64");
    }
  },
);

test.each([undefined, "int32", "uint32", "int64", "uint64"])(
  "integer format %s can have explicit bounds beyond the safe-integer range",
  async (format) => {
    const validator = await generateValidator({
      type: "integer",
      format,
      minimum: -(2 ** 54),
      maximum: 2 ** 54,
    });
    expect(validator.parse(-(2 ** 54))).toBe(-(2 ** 54));
    expect(validator.parse(2 ** 54)).toBe(2 ** 54);
    expect(validator.safeParse(-(2 ** 55)).success).toBe(false);
    expect(validator.safeParse(2 ** 55).success).toBe(false);
  },
);

test("integer byte counts do not require whole GiB", async () => {
  const validator = await generateValidator({
    type: "integer",
    format: "uint64",
  });
  expect(validator.parse(1.5 * 2 ** 30)).toBe(1610612736);
});

test("integer properties preserve required, optional, nullable, and default behavior", async () => {
  const validator = await generateValidator({
    type: "object",
    properties: {
      required: { type: "integer" },
      optional: { type: "integer" },
      nullable: { type: "integer", nullable: true },
      defaulted: { type: "integer", minimum: 0, maximum: 10, default: 0 },
      nullDefault: { type: "integer", nullable: true, default: null },
    },
    required: ["required", "nullable"],
  });
  const input = { required: 2, nullable: null };
  expect(validator.parse(input)).toEqual({
    ...input,
    defaulted: 0,
    nullDefault: null,
  });
  expect(validator.safeParse({ nullable: null }).success).toBe(false);
  expect(validator.safeParse({ required: 2 }).success).toBe(false);
  expect(validator.safeParse({ ...input, optional: null }).success).toBe(false);
  expect(validator.safeParse({ ...input, defaulted: 11 }).success).toBe(false);
  for (const key of [
    "required",
    "optional",
    "nullable",
    "defaulted",
    "nullDefault",
  ]) {
    expect(validator.safeParse({ ...input, [key]: 2.5 }).success).toBe(false);
    expect(validator.parse({ ...input, [key]: 3 })).toMatchObject({ [key]: 3 });
  }
});

test.each([undefined, "float", "double"])(
  "number format %s still accepts fractions",
  async (format) => {
    const validator = await generateValidator({ type: "number", format });
    for (const value of [2.5, 24.5, -2.5]) {
      expect(validator.parse(value)).toBe(value);
    }
  },
);

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

test("boolean nullable with default", () => {
  schemaToZod({ type: "boolean", nullable: true, default: null }, io);
  expect(out.value()).toMatchInlineSnapshot(
    '"SafeBoolean.nullable().default(null)"',
  );
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
    '"z.number().nullable().default(null)"',
  );
});

test("integer", () => {
  schemaToZod({ type: "integer" }, io);
  expect(out.value()).toMatchInlineSnapshot(
    `"z.number().refine(Number.isInteger, "Expected integer")"`,
  );
});

test("integer with format uint8", () => {
  schemaToZod({ type: "integer", format: "uint8" }, io);
  expect(out.value()).toMatchInlineSnapshot(`"z.int().min(0).max(255)"`);
});

test("integer with format int16", () => {
  schemaToZod({ type: "integer", format: "int16" }, io);
  expect(out.value()).toMatchInlineSnapshot(`"z.int().min(-32768).max(32767)"`);
});

test("integer with explicit min/max", () => {
  schemaToZod({ type: "integer", minimum: 5, maximum: 10 }, io);
  expect(out.value()).toMatchInlineSnapshot(`"z.int().min(5).max(10)"`);
});

test("integer with default", () => {
  schemaToZod({ type: "integer", default: 42 }, io);
  expect(out.value()).toMatchInlineSnapshot(
    `"z.number().refine(Number.isInteger, "Expected integer").default(42)"`,
  );
});

test("integer with constraints and default", () => {
  schemaToZod({ type: "integer", minimum: 0, maximum: 65535, default: 0 }, io);
  expect(out.value()).toMatchInlineSnapshot(
    `"z.int().min(0).max(65535).default(0)"`,
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
    io,
  );
  expect(out.value()).toMatchInlineSnapshot(
    `"z.int().min(0).max(65535).nullable().default(null)"`,
  );
});

test("integer nullable", () => {
  schemaToZod({ type: "integer", nullable: true }, io);
  expect(out.value()).toMatchInlineSnapshot(
    `"z.number().refine(Number.isInteger, "Expected integer").nullable()"`,
  );
});

test("integer enum", async () => {
  schemaToZod({ type: "integer", enum: [1, 2, 3] }, io);
  expect(out.value()).toMatchInlineSnapshot('"IntEnum([1,2,3] as const)"');
  const validator = await generateValidator({
    type: "integer",
    enum: [1, 2, 3],
  });
  expect(validator.parse(2)).toBe(2);
  expect(validator.safeParse(2.5).success).toBe(false);
  expect(validator.safeParse(4).success).toBe(false);
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
    io,
  );
  expect(out.value()).toMatchInlineSnapshot(
    '"z.number().array().nullable().default([1,2])"',
  );
});

test("array with uniqueItems", () => {
  schemaToZod(
    { type: "array", items: { type: "string" }, uniqueItems: true },
    io,
  );
  expect(out.value()).toMatchInlineSnapshot(
    '"z.string().array().refine(...uniqueItems)"',
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
    io,
  );
  expect(out.value()).toMatchInlineSnapshot(`
    "z.object({"name": z.string(),
    "age": z.number().refine(Number.isInteger, "Expected integer").optional(),
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
    io,
  );
  expect(out.value()).toMatchInlineSnapshot(`
    "z.object({"name": z.string(),
    "count": z.number().refine(Number.isInteger, "Expected integer").default(0),
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
    io,
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
    io,
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
    io,
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
    io,
  );
  expect(out.value()).toMatchInlineSnapshot(`
    "z.object({"name": z.string(),
    "age": z.number().refine(Number.isInteger, "Expected integer").optional(),
    "count": z.number().refine(Number.isInteger, "Expected integer").default(0),
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
    io,
  );
  expect(out.value()).toMatchInlineSnapshot(`
    "z.object({"id": z.string(),
    }).nullable()"
  `);
});

test("object as record with additionalProperties", () => {
  schemaToZod({ type: "object", additionalProperties: { type: "number" } }, io);
  expect(out.value()).toMatchInlineSnapshot(
    '"z.record(z.string(),z.number())"',
  );
});

test("object as record without additionalProperties", () => {
  schemaToZod({ type: "object" }, io);
  expect(out.value()).toMatchInlineSnapshot(
    '"z.record(z.string(),z.unknown())"',
  );
});

test("object as record nullable", () => {
  schemaToZod({ type: "object", nullable: true }, io);
  expect(out.value()).toMatchInlineSnapshot(
    '"z.record(z.string(),z.unknown()).nullable()"',
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
    io,
  );
  expect(out.value()).toMatchInlineSnapshot(`"z.enum(["a", "b", "c"])"`);
});

test("oneOf union", () => {
  schemaToZod(
    {
      oneOf: [{ type: "string" }, { type: "number" }],
    },
    io,
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
    io,
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
    io,
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
    io,
  );
  expect(out.value()).toMatchInlineSnapshot('"z.string().nullable()"');
});

test("allOf with default", () => {
  schemaToZod(
    {
      allOf: [{ $ref: "#/components/schemas/Config" }],
      default: { enabled: true },
    },
    io,
  );
  expect(out.value()).toMatchInlineSnapshot(
    '"Config.default({"enabled":true})"',
  );
});

test("empty schema", () => {
  schemaToZod({}, io);
  expect(out.value()).toMatchInlineSnapshot(
    '"z.record(z.string(), z.unknown())"',
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
    io,
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
    io,
  );
  expect(out.value()).toMatchInlineSnapshot(
    '"z.number().array().default([1,2,3])"',
  );
});

test("object default", () => {
  schemaToZod(
    {
      allOf: [{ $ref: "#/components/schemas/Config" }],
      default: { enabled: true },
    },
    io,
  );
  expect(out.value()).toMatchInlineSnapshot(
    '"Config.default({"enabled":true})"',
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
    io,
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
    io,
  );
  expect(out.value()).toMatchInlineSnapshot(`
    "z.object({"name": z.string(),
    "config": z.object({"enableFeature": SafeBoolean,
    "maxRetries": z.number().refine(Number.isInteger, "Expected integer"),
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
    io,
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
    io,
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
    io,
  );
  expect(out.value()).toMatchInlineSnapshot(`
    "z.object({"name": z.string(),
    "value": z.string().nullable().default(null),
    })"
  `);
});

test("ref with lazy schema", () => {
  const lazyIO = { ...io, lazySchemas: new Set(["MyType"]) };
  schemaToZod({ $ref: "#/components/schemas/MyType" }, lazyIO);
  expect(out.value()).toMatchInlineSnapshot('"z.lazy(() => MyType)"');
});

test("ref without lazy schema unchanged", () => {
  const lazyIO = { ...io, lazySchemas: new Set(["OtherType"]) };
  schemaToZod({ $ref: "#/components/schemas/MyType" }, lazyIO);
  expect(out.value()).toMatchInlineSnapshot('"MyType"');
});

test("object with lazy ref property", () => {
  const lazyIO = { ...io, lazySchemas: new Set(["TypeB"]) };
  schemaToZod(
    {
      type: "object",
      properties: {
        name: { type: "string" },
        other: { $ref: "#/components/schemas/TypeB" },
      },
      required: ["name"],
    },
    lazyIO,
  );
  expect(out.value()).toMatchInlineSnapshot(`
    "z.object({"name": z.string(),
    "other": z.lazy(() => TypeB).optional(),
    })"
  `);
});

test("array of lazy ref", () => {
  const lazyIO = { ...io, lazySchemas: new Set(["TreeNode"]) };
  schemaToZod(
    {
      type: "array",
      items: { $ref: "#/components/schemas/TreeNode" },
    },
    lazyIO,
  );
  expect(out.value()).toMatchInlineSnapshot('"z.lazy(() => TreeNode).array()"');
});
