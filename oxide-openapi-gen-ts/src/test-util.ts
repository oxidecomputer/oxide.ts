/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { readFileSync, existsSync } from "node:fs";

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
    .split("\n")[0]
    .trim();
  const SPEC_CACHE_DIR = "/tmp/openapi-gen-ts-schemas";
  const SPEC_FILE = `${SPEC_CACHE_DIR}/${OMICRON_SHA}.json`;

  // Check if the spec file exists
  if (!existsSync(SPEC_FILE)) {
    throw new Error(
      `Spec file not found at ${SPEC_FILE}. ` +
        `Please run \`npm run pretest\` or \`../tools/gen.sh\` to download the spec file first.`
    );
  }

  return SPEC_FILE;
}
