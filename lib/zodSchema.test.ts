import { expect, test, beforeEach } from "vitest";
import { initIO, TestWritable } from "./io";
import { schemaToZod } from "./zodSchema";

const io = initIO();
const out = io.out as TestWritable;

beforeEach(() => {
  out.clear();
});

test("boolean", () => {
  schemaToZod({ type: "boolean" }, io);
  expect(out.value()).toMatchInlineSnapshot('"z.boolean()"');
});

test("boolean with default", () => {
  schemaToZod({ type: "boolean", default: false }, io);
  expect(out.value()).toMatchInlineSnapshot('"z.boolean().default(false)"');
});

test("string", () => {
  schemaToZod({ type: "string" }, io);
  expect(out.value()).toMatchInlineSnapshot('"z.string()"');
});

test("string with default", () => {
  schemaToZod({ type: "string", default: "test" }, io);
  expect(out.value()).toMatchInlineSnapshot('"z.string().default(\\"test\\")"');
});
