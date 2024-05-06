#!/usr/bin/env node
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
import parseArgs from "minimist";

function helpAndExit(msg?: string): never {
  if (msg) console.log("Error: " + msg + "\n");
  console.log("Usage:");
  console.log("  gen <specFile> <destDir> [options]\n");
  console.log("Options:");
  console.log(
    "  --features       Comma-separated list of features to generate. Default: none.",
  );
  console.log(`                   Allowed values: ${ALL_FEATURES.join(", ")}`);
  console.log("  -h, --help       Show this help message and exit\n");
  console.log("Example:");
  console.log("  gen nexus-json generated-client --features zod,msw");
  process.exit(1);
}

type Feature = "zod" | "msw" | "typetests";
const ALL_FEATURES: Feature[] = ["zod", "msw", "typetests"];
type Features = Record<Feature, boolean>;

function parseFeatures(featuresArg: string | undefined) {
  const features =
    typeof featuresArg === "string"
      ? featuresArg.split(",").map((f) => f.trim())
      : [];

  for (const feature of features) {
    if (!ALL_FEATURES.includes(feature as Feature)) {
      helpAndExit(`Unrecognized feature '${feature}'.`);
    }
  }
  return {
    zod: features.includes("zod"),
    msw: features.includes("msw"),
    typetests: features.includes("typetests"),
  };
}

async function generate(specFile: string, destDir: string, features: Features) {
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
  if (features.typetests) generateTypeTests(spec, destDirAbs);
  if (features.msw) generateMSWHandlers(spec, destDirAbs);
  // msw requires zod
  if (features.zod || features.msw) generateZodValidators(spec, destDirAbs);
}

////////////////////////////////////
// actually do the thing
////////////////////////////////////

const args = parseArgs(process.argv.slice(2), {
  string: ["features"],
  alias: { h: "help" },
});

if (args.help) helpAndExit();

const [specFile, destDir] = args._;
if (!specFile) helpAndExit(`Missing <specFile>`);
if (!destDir) helpAndExit(`Missing <destdir>`);

const features = parseFeatures(args.features);

generate(specFile, destDir, features);
