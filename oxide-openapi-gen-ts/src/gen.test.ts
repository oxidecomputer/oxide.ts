/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { test, describe, expect, beforeAll, afterAll } from "vitest";
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

describe("Api.ts handleResponse date and date array mapping", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let handleResponse: (response: Response) => Promise<any>;
  beforeAll(async () => {
    const { parseIfDate } = await import(join(tempDir, "Api.ts"));
    const { handleResponseWithMapper } = await import(
      join(tempDir, "http-client.ts")
    );
    handleResponse = handleResponseWithMapper(parseIfDate);
  });

  const timestamp = 1643092429315;
  const dateStr = new Date(timestamp).toISOString();
  const json = (body: unknown) =>
    new Response(JSON.stringify(body), {
      headers: { "Content-Type": "application/json" },
    });

  test("maps a date property to a Date", async () => {
    const { data } = await handleResponse(json({ time_created: dateStr }));
    expect(data.timeCreated).toBeInstanceOf(Date);
    expect((data.timeCreated as Date).getTime()).toEqual(timestamp);
  });

  test("maps a date-array property to Date[]", async () => {
    const { data } = await handleResponse(
      json({ start_times: [dateStr, dateStr, dateStr] }),
    );
    expect(Array.isArray(data.startTimes)).toBe(true);
    expect(data.startTimes[0]).toBeInstanceOf(Date);
    expect(data.startTimes[1]).toBeInstanceOf(Date);
    expect((data.startTimes[0] as Date).getTime()).toEqual(timestamp);
  });
});

test("http-client.ts", async () => {
  await expect(read("http-client.ts")).toMatchFileSnapshot(
    "./__snapshots__/http-client.ts",
  );
});

test("msw-handlers.ts", async () => {
  await expect(read("msw-handlers.ts")).toMatchFileSnapshot(
    "./__snapshots__/msw-handlers.ts",
  );
});

test("type-test.ts", async () => {
  await expect(read("type-test.ts")).toMatchFileSnapshot(
    "./__snapshots__/type-test.ts",
  );
});

test("util.ts", async () => {
  await expect(read("util.ts")).toMatchFileSnapshot("./__snapshots__/util.ts");
});

test("validate.ts", async () => {
  await expect(read("validate.ts")).toMatchFileSnapshot(
    "./__snapshots__/validate.ts",
  );
});
