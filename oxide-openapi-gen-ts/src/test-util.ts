/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

/**
 * Gets the path to the cached OpenAPI spec file based on OMICRON_VERSION.
 * Fetches the latest spec filename from GitHub and constructs the cached path.
 *
 * @param omicronVersionPath - Path to the OMICRON_VERSION file relative to the calling file
 * @returns The full path to the cached spec file in /tmp
 * @throws Error if the spec filename cannot be fetched (network issues, invalid version, etc.)
 */
export function getSpecFilePath(omicronVersionPath: string): string {
  const OMICRON_SHA = readFileSync(omicronVersionPath, "utf-8").trim();
  const SPEC_BASE = `https://raw.githubusercontent.com/oxidecomputer/omicron/${OMICRON_SHA}/openapi/nexus`;

  let LATEST_SPEC: string;
  try {
    LATEST_SPEC = execSync(`curl --fail "${SPEC_BASE}/nexus-latest.json"`, { encoding: 'utf-8' }).trim();
  } catch (error) {
    throw new Error(
      `Failed to fetch spec filename from ${SPEC_BASE}/nexus-latest.json. ` +
      `Please check network connectivity and verify OMICRON_VERSION (${OMICRON_SHA}) is valid.`
    );
  }

  return `/tmp/openapi-gen-ts-schemas/${OMICRON_SHA}-${LATEST_SPEC}`;
}
