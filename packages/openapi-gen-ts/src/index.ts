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

async function generate(specFile: string, destDir: string) {
  // destination directory is resolved relative to CWD
  const destDirAbs = resolve(process.cwd(), destDir);

  const rawSpec = await SwaggerParser.parse(specFile);
  if (!("openapi" in rawSpec) || !rawSpec.openapi.startsWith("3.0")) {
    throw new Error("Only OpenAPI 3.0 is currently supported");
  }

  // we're not actually changing anything from rawSpec to spec, we've
  // just ruled out v2 and v3.1
  const spec = rawSpec as OpenAPIV3.Document;

  copyStaticFiles(destDirAbs);
  generateApi(spec, destDirAbs);
  generateZodValidators(spec, destDirAbs);
  // TODO: make conditional - we only want generated for testing purpose
  generateTypeTests(spec, destDirAbs);
  generateMSWHandlers(spec, destDirAbs);
}

function helpAndExit(msg: string): never {
  console.log(msg);
  console.log("\nUsage: gen <specFile> <destDir>");
  process.exit(1);
}

const [specFile, destDir] = process.argv.slice(2);

if (!specFile) helpAndExit(`Missing <specFile>`);
if (!destDir) helpAndExit(`Missing <destdir>`);

generate(specFile, destDir);
