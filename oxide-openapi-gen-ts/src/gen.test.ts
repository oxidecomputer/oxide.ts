/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { test, expect, beforeAll, afterAll } from "vitest";
import { generate } from "./generate";
import { mkdtempSync, rmSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { getSpecFilePath } from "./test-util";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SPEC_FILE = getSpecFilePath(join(__dirname, "../../OMICRON_VERSION"));

let tempDir: string;

beforeAll(async () => {
  tempDir = mkdtempSync(join(tmpdir(), "gen-test-"));
  await generate(SPEC_FILE, tempDir, { zod: true, msw: true, typetests: true });
});

afterAll(() => {
  rmSync(tempDir, { recursive: true, force: true });
});

const read = (file: string) => readFileSync(join(tempDir, file), "utf-8");

test("Api.ts", async () => {
  await expect(read("Api.ts")).toMatchFileSnapshot("./__snapshots__/Api.ts");
});

test("http-client.ts", async () => {
  await expect(read("http-client.ts")).toMatchFileSnapshot(
    "./__snapshots__/http-client.ts"
  );
});

test("msw-handlers.ts", async () => {
  await expect(read("msw-handlers.ts")).toMatchFileSnapshot(
    "./__snapshots__/msw-handlers.ts"
  );
});

test("type-test.ts", async () => {
  await expect(read("type-test.ts")).toMatchFileSnapshot(
    "./__snapshots__/type-test.ts"
  );
});

test("util.ts", async () => {
  await expect(read("util.ts")).toMatchFileSnapshot("./__snapshots__/util.ts");
});

test("validate.ts", async () => {
  await expect(read("validate.ts")).toMatchFileSnapshot(
    "./__snapshots__/validate.ts"
  );
});
