/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { type OpenAPIV3 } from "openapi-types";
import { type ZodType } from "zod/v4";
import { generate } from "./generate";

/** Generate and import validators in a temporary directory owned by the caller. */
export async function generateTestValidators(
  spec: OpenAPIV3.Document,
  destDir: string,
): Promise<Record<string, ZodType>> {
  const specFile = join(destDir, "spec.json");
  writeFileSync(specFile, JSON.stringify(spec));
  await generate(specFile, destDir, {
    zod: true,
    msw: false,
    typetests: false,
  });
  return import(join(destDir, "validate.ts"));
}

/**
 * Gets the path to the cached OpenAPI spec file based on OMICRON_VERSION.
 *
 * @param omicronVersionPath - Path to the OMICRON_VERSION file
 * @returns The full path to the cached spec file in /tmp
 * @throws Error if the spec file doesn't exist
 */
export function getSpecFilePath(omicronVersionPath: string): string {
  // Use split("\n")[0] to match bash's `head -n 1` behavior
  const OMICRON_SHA = readFileSync(omicronVersionPath, "utf-8")
    .split("\n")[0]!
    .trim();
  const SPEC_CACHE_DIR = "/tmp/openapi-gen-ts-schemas";
  const SPEC_FILE = `${SPEC_CACHE_DIR}/${OMICRON_SHA}.json`;

  // Check if the spec file exists
  if (!existsSync(SPEC_FILE)) {
    throw new Error(
      `Spec file not found at ${SPEC_FILE}. ` +
        `Please run \`npm run pretest\` or \`../tools/gen.sh\` to download the spec file first.`,
    );
  }

  return SPEC_FILE;
}
