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
import { resolve } from "path";

const specFile = process.argv[2];
if (!specFile) {
  throw Error("Missing specFile argument");
}

const destDir = process.argv[3];
if (!destDir) {
  throw Error("Missing destDir argument");
}

const destDirAbs = resolve(process.cwd(), destDir);

SwaggerParser.parse(specFile).then((spec) => {
  copyStaticFiles(destDirAbs);
  generateApi(spec as OpenAPIV3.Document, destDirAbs);
  generateZodValidators(spec as OpenAPIV3.Document, destDirAbs);
  generateTypeTests(spec as OpenAPIV3.Document, destDirAbs);
  generateMSWHandlers(spec as OpenAPIV3.Document, destDirAbs);
});
