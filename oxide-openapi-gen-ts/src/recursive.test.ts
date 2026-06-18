/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { test, expect, beforeAll, afterAll } from "vitest";
import { mkdtempSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { generate } from "./generate";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * OpenAPI spec exercising every recursion shape we need to support, plus a
 * non-recursive control. These tests are deliberately about the *behavior* of
 * the generated code — it must typecheck and validate recursive data at
 * runtime — not about how the generator achieves that, so the implementation
 * can change freely.
 */
const recursiveSpec = {
  openapi: "3.0.0",
  info: { title: "Recursive Test", version: "0.0.0" },
  paths: {},
  components: {
    schemas: {
      /** Self-referencing through an array, with a snake_case key to
       * exercise key camelization on recursive parses */
      TreeNode: {
        type: "object",
        properties: {
          value: { type: "string" },
          child_nodes: {
            type: "array",
            items: { $ref: "#/components/schemas/TreeNode" },
          },
        },
        required: ["value"],
      },
      /** Mutually recursive pair */
      TypeA: {
        type: "object",
        properties: {
          name: { type: "string" },
          b: { $ref: "#/components/schemas/TypeB" },
        },
        required: ["name"],
      },
      TypeB: {
        type: "object",
        properties: {
          label: { type: "string" },
          a: { $ref: "#/components/schemas/TypeA" },
        },
        required: ["label"],
      },
      /** Recursive tagged union, the shape dropshot generates for Rust enums
       * that contain themselves */
      Filter: {
        oneOf: [
          {
            type: "object",
            properties: {
              type: { type: "string", enum: ["value"] },
              value: { type: "string" },
            },
            required: ["type", "value"],
          },
          {
            type: "object",
            properties: {
              type: { type: "string", enum: ["and"] },
              operands: {
                type: "array",
                items: { $ref: "#/components/schemas/Filter" },
              },
            },
            required: ["type", "operands"],
          },
        ],
      },
      /** Externally tagged enum (serde's default representation):
       * `enum ExtTagged { Literal(String), AllOf(Vec<ExtTagged>) }` */
      ExtTagged: {
        oneOf: [
          {
            type: "object",
            properties: { literal: { type: "string" } },
            required: ["literal"],
            additionalProperties: false,
          },
          {
            type: "object",
            properties: {
              all_of: {
                type: "array",
                items: { $ref: "#/components/schemas/ExtTagged" },
              },
            },
            required: ["all_of"],
            additionalProperties: false,
          },
        ],
      },
      /** `Option<Box<Self>>` with a doc comment, which schemars renders as a
       * nullable allOf-wrapped ref. The uuid, date-time, and integer enum
       * fields stress the explicit type annotation: the zod schema's output
       * type must match what the types generator emits for them. */
      LinkedNode: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          time_created: { type: "string", format: "date-time" },
          version: { type: "integer", enum: [1, 2] },
          next: {
            nullable: true,
            description: "the next node",
            allOf: [{ $ref: "#/components/schemas/LinkedNode" }],
          },
        },
        required: ["id", "time_created", "version"],
      },
      /** Newtype cycle: `struct Forest(Vec<Tree>)`. The Forest edge of the
       * cycle has no object property to hide behind. */
      Forest: {
        type: "array",
        items: { $ref: "#/components/schemas/Tree" },
      },
      Tree: {
        type: "object",
        properties: {
          value: { type: "string" },
          forest: { $ref: "#/components/schemas/Forest" },
        },
        required: ["value"],
      },
      /** `HashMap<String, Self>` cycle through a record type */
      NodeMap: {
        type: "object",
        properties: {
          children: {
            type: "object",
            additionalProperties: { $ref: "#/components/schemas/NodeMap" },
          },
        },
      },
      /** Non-recursive control */
      Plain: {
        type: "object",
        properties: { id: { type: "integer" } },
        required: ["id"],
      },
    },
  },
};

let genDir: string;
// the generated validate.ts module, imported dynamically after generation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let v: Record<string, any>;

beforeAll(async () => {
  genDir = mkdtempSync(join(tmpdir(), "recursive-test-"));
  const specFile = join(genDir, "spec.json");
  writeFileSync(specFile, JSON.stringify(recursiveSpec));
  await generate(specFile, genDir, { zod: true, msw: false, typetests: false });
  v = await import(join(genDir, "validate.ts"));
});

afterAll(() => {
  rmSync(genDir, { recursive: true, force: true });
});

test("generated code typechecks", () => {
  const program = ts.createProgram([join(genDir, "validate.ts")], {
    strict: true,
    noEmit: true,
    skipLibCheck: true,
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    lib: ["lib.es2022.d.ts", "lib.dom.d.ts", "lib.dom.iterable.d.ts"],
    // the temp dir has no node_modules, so point bare imports at ours
    paths: { "*": [join(__dirname, "../node_modules/*")] },
  });
  const errors = ts.getPreEmitDiagnostics(program).map((d) => {
    const msg = ts.flattenDiagnosticMessageText(d.messageText, "\n");
    if (!d.file || d.start === undefined) return msg;
    const { line } = d.file.getLineAndCharacterOfPosition(d.start);
    return `${d.file.fileName}:${line + 1}: ${msg}`;
  });
  expect(errors).toEqual([]);
});

test("self-referencing type parses recursively", () => {
  const result = v.TreeNode.parse({
    value: "root",
    child_nodes: [{ value: "kid", child_nodes: [{ value: "grandkid" }] }],
  });
  // snake_case keys are camelized at every level, not just the top
  expect(result).toEqual({
    value: "root",
    childNodes: [{ value: "kid", childNodes: [{ value: "grandkid" }] }],
  });
});

test("self-referencing type rejects bad data at depth", () => {
  expect(
    v.TreeNode.safeParse({
      value: "root",
      child_nodes: [{ value: "kid", child_nodes: [{ value: 5 }] }],
    }).success,
  ).toBe(false);
});

test("mutually recursive types parse", () => {
  const result = v.TypeA.parse({
    name: "a1",
    b: { label: "b1", a: { name: "a2" } },
  });
  expect(result).toEqual({ name: "a1", b: { label: "b1", a: { name: "a2" } } });

  expect(
    v.TypeA.safeParse({ name: "a1", b: { label: "b1", a: { name: 5 } } })
      .success,
  ).toBe(false);
});

test("recursive tagged union parses", () => {
  const filter = {
    type: "and",
    operands: [
      { type: "value", value: "x" },
      { type: "and", operands: [{ type: "value", value: "y" }] },
    ],
  };
  expect(v.Filter.parse(filter)).toEqual(filter);

  expect(
    v.Filter.safeParse({
      type: "and",
      operands: [{ type: "value", value: 5 }],
    }).success,
  ).toBe(false);
});

test("externally tagged union parses", () => {
  // all_of keys are camelized at every level on the way through
  expect(
    v.ExtTagged.parse({
      all_of: [{ literal: "x" }, { all_of: [{ literal: "y" }] }],
    }),
  ).toEqual({
    allOf: [{ literal: "x" }, { allOf: [{ literal: "y" }] }],
  });

  expect(v.ExtTagged.safeParse({ all_of: [{ literal: 5 }] }).success).toBe(
    false,
  );
});

test("nullable allOf-wrapped self ref parses, with coercions at depth", () => {
  const result = v.LinkedNode.parse({
    id: "07eed6a4-4d80-4b13-9bf4-9d5fb4a1d2cd",
    time_created: "2026-06-12T00:00:00Z",
    version: 1,
    next: {
      id: "362f0941-a3a7-4593-9514-5b4d4d7b1a7d",
      time_created: "2026-06-12T01:00:00Z",
      version: 2,
      next: null,
    },
  });
  // date coercion applies at depth, not just the top level
  expect(result.timeCreated).toBeInstanceOf(Date);
  expect(result.next.timeCreated).toBeInstanceOf(Date);
  expect(result.next.next).toBeNull();

  // the integer enum rejects out-of-range values at depth
  expect(
    v.LinkedNode.safeParse({
      id: "07eed6a4-4d80-4b13-9bf4-9d5fb4a1d2cd",
      time_created: "2026-06-12T00:00:00Z",
      version: 1,
      next: {
        id: "362f0941-a3a7-4593-9514-5b4d4d7b1a7d",
        time_created: "2026-06-12T01:00:00Z",
        version: 3,
      },
    }).success,
  ).toBe(false);
});

test("newtype array cycle parses", () => {
  expect(
    v.Forest.parse([{ value: "a", forest: [{ value: "b" }] }, { value: "c" }]),
  ).toEqual([{ value: "a", forest: [{ value: "b" }] }, { value: "c" }]);

  expect(v.Tree.safeParse({ value: "a", forest: [{ value: 5 }] }).success).toBe(
    false,
  );
});

test("record cycle parses", () => {
  const map = { children: { a: { children: { b: {} } } } };
  expect(v.NodeMap.parse(map)).toEqual(map);

  expect(
    v.NodeMap.safeParse({ children: { a: { children: { b: 5 } } } }).success,
  ).toBe(false);
});

test("deeply nested data parses", () => {
  type Node = { value: string; child_nodes?: Node[] };
  let node: Node = { value: "leaf" };
  for (let i = 0; i < 100; i++) {
    node = { value: `level ${i}`, child_nodes: [node] };
  }
  expect(v.TreeNode.parse(node).childNodes[0].value).toBe("level 98");
});

test("non-recursive type still works", () => {
  expect(v.Plain.parse({ id: 4 })).toEqual({ id: 4 });
  expect(v.Plain.safeParse({ id: "x" }).success).toBe(false);
});

test("generated code snapshot", async () => {
  await expect(
    readFileSync(join(genDir, "validate.ts"), "utf-8"),
  ).toMatchFileSnapshot("./__snapshots__/recursive-validate.ts");
});
