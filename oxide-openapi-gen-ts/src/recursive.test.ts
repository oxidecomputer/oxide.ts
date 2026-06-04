/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { test, expect, beforeAll, afterAll } from "vitest";
import { mkdtempSync, rmSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { OpenAPIV3 } from "openapi-types";
import { generateZodValidators } from "./client/zodValidators";

/**
 * Minimal OpenAPI spec with recursive types to verify z.lazy() generation.
 *
 * Contains three kinds of recursion:
 * 1. Self-referencing: TreeNode has children of type TreeNode[]
 * 2. Mutual recursion: TypeA references TypeB and TypeB references TypeA
 * 3. Non-recursive: Plain is a simple type that should NOT use z.lazy()
 */
const recursiveSpec: OpenAPIV3.Document = {
  openapi: "3.0.0",
  info: { title: "Recursive Test", version: "0.0.0" },
  paths: {},
  components: {
    schemas: {
      TreeNode: {
        type: "object",
        properties: {
          value: { type: "string" },
          children: {
            type: "array",
            items: { $ref: "#/components/schemas/TreeNode" },
          },
        },
        required: ["value"],
      },
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
      Plain: {
        type: "object",
        properties: {
          id: { type: "integer" },
        },
        required: ["id"],
      },
    },
  },
};

let tempDir: string;
let validateContent: string;

beforeAll(async () => {
  tempDir = mkdtempSync(join(tmpdir(), "recursive-test-"));
  await generateZodValidators(recursiveSpec, tempDir);
  validateContent = readFileSync(join(tempDir, "validate.ts"), "utf-8");
});

afterAll(() => {
  rmSync(tempDir, { recursive: true, force: true });
});

test("self-referencing type uses z.lazy", () => {
  // TreeNode references itself, so the $ref to TreeNode should be wrapped
  expect(validateContent).toContain("z.lazy(() => TreeNode)");
});

test("mutually recursive types use z.lazy", () => {
  // TypeA and TypeB reference each other
  // The ref to TypeA inside TypeB's definition should be lazy
  expect(validateContent).toContain("z.lazy(() => TypeA)");
  // The ref to TypeB inside TypeA's definition should be lazy
  expect(validateContent).toContain("z.lazy(() => TypeB)");
});

test("non-recursive type does NOT use z.lazy", () => {
  // Plain has no cycles, so it should appear as a normal const, not wrapped
  // Make sure "Plain" appears as a direct export, not inside z.lazy
  expect(validateContent).toContain("export const Plain");
  expect(validateContent).not.toContain("z.lazy(() => Plain)");
});

test("generated code snapshot", () => {
  // Snapshot the full output to catch regressions
  expect(validateContent).toMatchSnapshot();
});
