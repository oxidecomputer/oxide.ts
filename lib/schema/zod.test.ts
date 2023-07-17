/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { expect, test, beforeEach } from "vitest";
import { initIO, TestWritable } from "../io";
import { schemaToZod } from "./zod";

const io = initIO();
const out = io.out as TestWritable;

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
  expect(out.value()).toMatchInlineSnapshot('"z.string().default(\\"test\\")"');
});
