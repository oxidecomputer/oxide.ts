#!/usr/bin/env node
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import parseArgs from "minimist";
import { generate, ALL_FEATURES, type Feature } from "./generate";

function helpAndExit(msg?: string): never {
  if (msg) console.log("Error: " + msg + "\n");
  console.log("Usage:");
  console.log("  gen <specFile> <destDir> [options]\n");
  console.log("Options:");
  console.log(
    "  --features       Comma-separated list of features to generate. Default: none."
  );
  console.log(`                   Allowed values: ${ALL_FEATURES.join(", ")}`);
  console.log("  -h, --help       Show this help message and exit\n");
  console.log("Example:");
  console.log("  gen nexus-json generated-client --features zod,msw");
  process.exit(1);
}

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

  const validated = features as Feature[];

  return {
    zod: validated.includes("zod"),
    msw: validated.includes("msw"),
    typetests: validated.includes("typetests"),
  };
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
