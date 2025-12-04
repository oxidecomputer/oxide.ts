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
import { resolve } from "node:path";
import { existsSync } from "node:fs";

export type Feature = "zod" | "msw" | "typetests";
export const ALL_FEATURES: Feature[] = ["zod", "msw", "typetests"];
export type Features = Record<Feature, boolean>;

export async function generate(
  specFile: string,
  destDir: string,
  features: Features
) {
  // destination directory is resolved relative to CWD
  const destDirAbs = resolve(process.cwd(), destDir);

  if (!existsSync(destDirAbs)) {
    throw new Error(`Error: destination directory does not exist.
  Argument given: ${destDirAbs}
  Resolved path:  ${destDirAbs}
`);
  }

  const rawSpec = await SwaggerParser.parse(specFile);
  if (!("openapi" in rawSpec) || !rawSpec.openapi.startsWith("3.0")) {
    throw new Error("Only OpenAPI 3.0 is currently supported");
  }

  // we're not actually changing anything from rawSpec to spec, we've
  // just ruled out v2 and v3.1
  const spec = rawSpec as OpenAPIV3.Document;

  copyStaticFiles(destDirAbs);
  await generateApi(spec, destDirAbs);
  if (features.typetests) await generateTypeTests(spec, destDirAbs);
  if (features.msw) await generateMSWHandlers(spec, destDirAbs);
  // msw requires zod
  if (features.zod || features.msw) await generateZodValidators(spec, destDirAbs);
}
