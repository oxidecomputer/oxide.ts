/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import SwaggerParser from "@apidevtools/swagger-parser";
import type { OpenAPIV3 } from "openapi-types";

import { copyStaticFiles, generateApi } from "./client/api";
import { generateMSWHandlers } from "./client/msw-handlers";
import { generateTypeTests } from "./client/type-tests";
import { generateZodValidators } from "./client/zodValidators";
import {
  analyzeDateKeys,
  demoteConflicts,
  formatConflicts,
  formatSuspects,
  formatUnsupported,
  type DateKeyReport,
} from "./schema/dates";
import { resolve } from "node:path";
import { existsSync } from "node:fs";

export type Feature = "zod" | "msw" | "typetests";
export const ALL_FEATURES: Feature[] = ["zod", "msw", "typetests"];
export type Features = Record<Feature, boolean>;

export type GenerateOptions = {
  /**
   * Generate even if a response value typed `string` could arrive as a
   * `Date`: a response record with string values could carry a date-time
   * property name as a key, and its value would be parsed. The report is
   * printed to stderr as a warning instead of failing.
   */
  unsoundDateTypes?: boolean;
};

/**
 * Unsupported dates always throw because the generated types would be wrong.
 * Conflicts are only a notice: the caller demotes those names to `string`
 * (see `demoteConflicts`), which keeps the types honest, but the spec should
 * be fixed. Suspects throw unless the caller accepted the risk, in which case
 * they warn.
 */
function checkDateKeys(report: DateKeyReport, unsound: boolean) {
  if (report.unsupported.length > 0) {
    throw new Error(formatUnsupported(report));
  }
  if (report.conflicts.length > 0) {
    console.warn("Warning: " + formatConflicts(report));
  }
  if (report.suspects.length > 0) {
    const suspects = formatSuspects(report);
    if (!unsound) {
      throw new Error(
        `${suspects}\nPass --unsound-date-types (or unsoundDateTypes: true) ` +
          "to generate anyway and accept that risk.",
      );
    }
    console.warn(
      `Warning: ${suspects}\nGenerating anyway: --unsound-date-types accepts ` +
        "that risk.",
    );
  }
}

export async function generate(
  specFile: string,
  destDir: string,
  features: Features,
  opts: GenerateOptions = {},
) {
  // destination directory is resolved relative to CWD
  const destDirAbs = resolve(process.cwd(), destDir);

  if (!existsSync(destDirAbs)) {
    throw new Error(`Error: destination directory does not exist.
  Argument given: ${destDirAbs}
  Resolved path:  ${destDirAbs}
`);
  }

  const parsed = await SwaggerParser.parse(specFile);
  if (!("openapi" in parsed) || !parsed.openapi.startsWith("3.0")) {
    throw new Error("Only OpenAPI 3.0 is currently supported");
  }
  // we've ruled out v2 and v3.1, so this is only a narrowing
  const rawSpec = parsed as OpenAPIV3.Document;

  // check before writing anything so a failure leaves no partial output
  const dateReport = analyzeDateKeys(rawSpec);
  checkDateKeys(dateReport, opts.unsoundDateTypes ?? false);

  // the only change from rawSpec is that conflicting date names become plain
  // strings throughout
  const spec = demoteConflicts(
    rawSpec,
    dateReport.conflicts.map((c) => c.name),
  );

  copyStaticFiles(destDirAbs);
  await generateApi(spec, destDirAbs, dateReport.dateKeys);
  if (features.typetests) await generateTypeTests(spec, destDirAbs);
  if (features.msw) await generateMSWHandlers(spec, destDirAbs);
  // msw requires zod
  if (features.zod || features.msw)
    await generateZodValidators(spec, destDirAbs);
}
