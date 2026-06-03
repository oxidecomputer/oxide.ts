/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { afterEach, expect, test } from "vitest";
import type { OpenAPIV3 } from "openapi-types";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { buildDateParsers, type DateParsers } from "./dateParsers";

const iso = "2022-05-01T02:03:04Z";
const date = new Date(Date.UTC(2022, 4, 1, 2, 3, 4));

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

const ref = (name: string): OpenAPIV3.ReferenceObject => ({
  $ref: `#/components/schemas/${name}`,
});

const dateTime: OpenAPIV3.SchemaObject = {
  type: "string",
  format: "date-time",
};

const okResponse = (
  schema: OpenAPIV3.ReferenceObject | OpenAPIV3.ArraySchemaObject
): OpenAPIV3.ResponseObject => ({
  description: "ok",
  content: { "application/json": { schema } },
});

const get = (
  operationId: string,
  schema: OpenAPIV3.ReferenceObject | OpenAPIV3.ArraySchemaObject
): OpenAPIV3.OperationObject => ({
  operationId,
  responses: { "200": okResponse(schema) },
});

const spec = (
  schemas: OpenAPIV3.ComponentsObject["schemas"],
  paths: OpenAPIV3.PathsObject = {}
): OpenAPIV3.Document => ({
  openapi: "3.0.3",
  info: { title: "test", version: "0.0.0" },
  paths,
  components: { schemas },
});

async function importGeneratedParsers(dateParsers: DateParsers) {
  const dir = mkdtempSync(join(tmpdir(), "date-parsers-test-"));
  tempDirs.push(dir);
  const file = join(dir, "date-parsers.ts");
  writeFileSync(file, dateParsers.content);
  return (await import(file)) as Record<string, (o: unknown) => unknown>;
}

async function parserFor(dateParsers: DateParsers, successType: string) {
  const expr = dateParsers.parserExpr(successType);
  if (!expr) throw new Error(`no date parser for ${successType}`);
  const P = await importGeneratedParsers(dateParsers);
  return P[expr.slice(2)];
}

test("builds parsers for object, results page, and array success types", async () => {
  const dateParsers = buildDateParsers(
    spec(
      {
        Thing: {
          type: "object",
          properties: {
            id: { type: "string" },
            time_created: dateTime,
          },
        },
        ThingResultsPage: {
          type: "object",
          properties: {
            items: { type: "array", items: ref("Thing") },
            next_page: { type: "string", nullable: true },
          },
        },
      },
      {
        "/things": { get: get("thing_list", ref("ThingResultsPage")) },
        "/things/all": {
          get: get("thing_list_all", { type: "array", items: ref("Thing") }),
        },
      }
    )
  );

  expect(dateParsers.parserExpr("Plain")).toBeNull();

  const pageParser = await parserFor(dateParsers, "ThingResultsPage");
  expect(pageParser({ items: [{ id: "x", timeCreated: iso }] })).toEqual({
    items: [{ id: "x", timeCreated: date }],
  });

  const arrayParser = await parserFor(dateParsers, "Thing[]");
  expect(arrayParser([{ id: "x", timeCreated: iso }])).toEqual([
    { id: "x", timeCreated: date },
  ]);
});

test("deduplicates schemas with the same date shape", () => {
  const dateParsers = buildDateParsers(
    spec({
      AddressLot: {
        type: "object",
        properties: {
          time_created: dateTime,
          time_modified: dateTime,
        },
      },
      Project: {
        type: "object",
        properties: {
          time_created: dateTime,
          time_modified: dateTime,
        },
      },
    })
  );

  expect(dateParsers.parserExpr("AddressLot")).toBe(
    dateParsers.parserExpr("Project")
  );
  expect(dateParsers.content.match(/^export const n/gm)).toHaveLength(1);
});

test("handles the Nexus-style oneOf shape where only one variant has dates", async () => {
  const dateParsers = buildDateParsers(
    spec({
      ExternalIp: {
        oneOf: [
          {
            type: "object",
            properties: {
              kind: { type: "string", enum: ["snat"] },
              ip: { type: "string" },
            },
          },
          {
            type: "object",
            properties: {
              kind: { type: "string", enum: ["floating"] },
              ip: { type: "string" },
              time_created: dateTime,
              time_modified: dateTime,
            },
          },
        ],
      },
    })
  );

  const parser = await parserFor(dateParsers, "ExternalIp");

  expect(parser({ kind: "snat", ip: "192.0.2.1" })).toEqual({
    kind: "snat",
    ip: "192.0.2.1",
  });
  expect(
    parser({ kind: "floating", ip: "192.0.2.2", timeCreated: iso })
  ).toEqual({
    kind: "floating",
    ip: "192.0.2.2",
    timeCreated: date,
  });
});
