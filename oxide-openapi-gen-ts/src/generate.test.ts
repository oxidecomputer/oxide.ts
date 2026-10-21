/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { OpenAPIV3 } from "openapi-types";
import { generate, type GenerateOptions } from "./generate";

const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const date: OpenAPIV3.SchemaObject = { type: "string", format: "date-time" };

/** One GET returning `Thing`, plus whatever schemas are given */
const makeSpec = (
  schemas: Record<string, OpenAPIV3.SchemaObject>,
): OpenAPIV3.Document => ({
  openapi: "3.0.3",
  info: { title: "test", version: "0.0.0" },
  paths: {
    "/thing": {
      get: {
        operationId: "thing_view",
        responses: {
          "200": {
            description: "ok",
            content: { "application/json": { schema: ref("Thing") } },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Error: {
        description: "Error information from a response.",
        type: "object",
        properties: {
          error_code: { type: "string" },
          message: { type: "string" },
          request_id: { type: "string" },
        },
        required: ["message", "request_id"],
      },
      ...schemas,
    },
  },
});

describe("generate date keys", () => {
  let dir: string;
  let warn: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "generate-test-"));
    warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    warn.mockRestore();
    rmSync(dir, { recursive: true, force: true });
  });

  const run = async (
    schemas: Record<string, OpenAPIV3.SchemaObject>,
    opts?: GenerateOptions,
  ) => {
    const specFile = join(dir, "spec.json");
    writeFileSync(specFile, JSON.stringify(makeSpec(schemas)));
    await generate(
      specFile,
      dir,
      { zod: true, msw: false, typetests: false },
      opts,
    );
    return {
      api: readFileSync(join(dir, "Api.ts"), "utf-8"),
      validate: readFileSync(join(dir, "validate.ts"), "utf-8"),
    };
  };

  it("emits the date keys and types them as Date", async () => {
    const { api, validate } = await run({
      Thing: {
        type: "object",
        properties: { created_at: date, name: { type: "string" } },
      },
    });
    expect(api).toContain('new Set([\n  "created_at",\n])');
    // Api.ts is not formatted by the generator, so property names are quoted
    expect(api).toMatch(/"createdAt"\?: Date/);
    expect(validate).toMatch(/"createdAt": z\.coerce\.date\(\)/);
    expect(warn).not.toHaveBeenCalled();
  });

  it("demotes a conflicting name to string everywhere and warns", async () => {
    const { api, validate } = await run({
      Thing: {
        type: "object",
        properties: { created: date, updated: date, other: ref("Other") },
      },
      Other: {
        type: "object",
        properties: { created: { type: "string", format: "uuid" } },
      },
      Body: { type: "object", properties: { created: date } },
    });
    expect(api).toContain('new Set([\n  "updated",\n])');
    // every `created` is a string, including the request-only Body
    expect(api).not.toMatch(/"created"\?: Date/);
    expect(api.match(/"created"\?: string/g)).toHaveLength(3);
    expect(api).toMatch(/"updated"\?: Date/);
    expect(validate).toMatch(/"created": z\.string\(\)/);
    expect(validate).not.toMatch(/"created": z\.coerce\.date\(\)/);
    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0]![0]).toContain("created: date-time in Thing");
  });

  it("fails on a record of strings unless unsound types are allowed", async () => {
    const schemas = {
      Thing: {
        type: "object" as const,
        properties: {
          time_created: date,
          labels: {
            type: "object" as const,
            additionalProperties: { type: "string" as const },
          },
        },
      },
    };
    await expect(run(schemas)).rejects.toThrow(
      /Thing\.labels[\s\S]*Pass --unsound-date-types/,
    );
    expect(warn).not.toHaveBeenCalled();

    const { api } = await run(schemas, { unsoundDateTypes: true });
    expect(api).toContain('"time_created"');
    expect(warn).toHaveBeenCalledOnce();
    const warning = warn.mock.calls[0]![0] as string;
    expect(warning).toContain("Thing.labels");
    expect(warning).toContain("Generating anyway");
    expect(warning).not.toContain("Pass --unsound-date-types");
  });

  it("always fails on a response that is itself a date", async () => {
    await expect(
      run({ Thing: date }, { unsoundDateTypes: true }),
    ).rejects.toThrow("GET /thing 200");
  });
});
