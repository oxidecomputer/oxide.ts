/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";

/**
 * Gets the path to the cached OpenAPI spec file based on OMICRON_VERSION.
 * First checks for an existing cached file, only fetching the spec filename from GitHub if needed.
 *
 * @param omicronVersionPath - Path to the OMICRON_VERSION file relative to the calling file
 * @returns The full path to the cached spec file in /tmp
 * @throws Error if the spec filename cannot be fetched or if the spec file doesn't exist
 */
export function getSpecFilePath(omicronVersionPath: string): string {
  // Use split("\n")[0] to match bash's `head -n 1` behavior
  const OMICRON_SHA = readFileSync(omicronVersionPath, "utf-8")
    .split("\n")[0]
    .trim();
  const SPEC_CACHE_DIR = "/tmp/openapi-gen-ts-schemas";

  // Check if a cached file already exists for this OMICRON_SHA
  if (existsSync(SPEC_CACHE_DIR)) {
    const cachedFiles = readdirSync(SPEC_CACHE_DIR);
    const matchingFile = cachedFiles.find((file) =>
      file.startsWith(`${OMICRON_SHA}-`)
    );

    if (matchingFile) {
      return `${SPEC_CACHE_DIR}/${matchingFile}`;
    }
  }

  // No cached file found, fetch the latest spec filename from GitHub
  const SPEC_BASE = `https://raw.githubusercontent.com/oxidecomputer/omicron/${OMICRON_SHA}/openapi/nexus`;

  let LATEST_SPEC: string;
  try {
    LATEST_SPEC = execSync(`curl --fail "${SPEC_BASE}/nexus-latest.json"`, {
      encoding: "utf-8",
    }).trim();
  } catch (error) {
    throw new Error(
      `Failed to fetch spec filename from ${SPEC_BASE}/nexus-latest.json. ` +
        `Please check network connectivity and verify OMICRON_VERSION (${OMICRON_SHA}) is valid.`
    );
  }

  const SPEC_FILE = `${SPEC_CACHE_DIR}/${OMICRON_SHA}-${LATEST_SPEC}`;

  // Check if the spec file exists after determining the filename
  if (!existsSync(SPEC_FILE)) {
    throw new Error(
      `Spec file not found at ${SPEC_FILE}. ` +
        `Please run \`npm run pretest\` or \`../tools/gen.sh\` to download the spec file first.`
    );
  }

  return SPEC_FILE;
}
