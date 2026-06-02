/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { test, expect, beforeAll, afterAll } from "vitest";
import SwaggerParser from "@apidevtools/swagger-parser";
import type { OpenAPIV3 } from "openapi-types";
import { generate } from "./generate";
import { buildDateParsers } from "./client/dateParsers";
import { mkdtempSync, rmSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { getSpecFilePath } from "./test-util";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SPEC_FILE = getSpecFilePath(join(__dirname, "../../OMICRON_VERSION"));

let tempDir: string;
// schema name -> parser expression (e.g. "P.n20"), the same mapping the
// generator bakes into Api.ts. Lets the behavioral test below resolve parsers
// by type name instead of hard-coding `nXX`, which renumbers when the spec does.
let parserExpr: (successType: string | null) => string | null;

beforeAll(async () => {
  tempDir = mkdtempSync(join(tmpdir(), "gen-test-"));
  await generate(SPEC_FILE, tempDir, { zod: true, msw: true, typetests: true });
  const spec = (await SwaggerParser.parse(SPEC_FILE)) as OpenAPIV3.Document;
  parserExpr = buildDateParsers(spec).parserExpr;
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

test("date-parsers.ts", async () => {
  await expect(read("date-parsers.ts")).toMatchFileSnapshot(
    "./__snapshots__/date-parsers.ts"
  );
});

test("generated date parsers convert dates in place", async () => {
  // import the freshly generated module and exercise a few representative
  // shapes: a flat type, a results page, an array-of-dates, and an array
  // success wrapper. Resolve each parser by schema name via parserExpr rather
  // than hard-coding `nXX`, so the test keeps asserting the right type even
  // when the spec changes and the generated function numbers shift.
  const P = (await import(join(tempDir, "date-parsers.ts"))) as Record<
    string,
    <T>(o: T) => T
  >;
  const parser = (successType: string) => {
    const expr = parserExpr(successType);
    if (!expr) throw new Error(`no date parser for '${successType}'`);
    return P[expr.slice(2)]; // strip the "P." prefix Api.ts imports under
  };

  const iso = "2022-05-01T02:03:04Z";
  const date = new Date(Date.UTC(2022, 4, 1, 2, 3, 4));

  // Instance: flat date fields, including a nullable one left untouched
  expect(
    parser("Instance")({
      timeCreated: iso,
      timeModified: iso,
      timeLastAutoRestarted: null,
    })
  ).toEqual({
    timeCreated: date,
    timeModified: date,
    timeLastAutoRestarted: null,
  });

  // a results page recurses into items
  const page = parser("AddressLotResultsPage")({
    items: [{ timeCreated: iso, timeModified: iso }],
  });
  expect(page.items[0]).toEqual({ timeCreated: date, timeModified: date });

  // Points: arrays of dates
  expect(parser("Points")({ timestamps: [iso, iso] })).toEqual({
    timestamps: [date, date],
  });

  // unparseable strings are left alone, absent fields are not added
  expect(parser("Instance")({ timeCreated: "nope" })).toEqual({
    timeCreated: "nope",
  });

  // array success wrapper maps the element parser over the array
  expect(parser("ScimClientBearerToken[]")([{ timeCreated: iso }])).toEqual([
    { timeCreated: date },
  ]);
});

test("validate.ts", async () => {
  await expect(read("validate.ts")).toMatchFileSnapshot(
    "./__snapshots__/validate.ts"
  );
});
