#!/usr/bin/env node
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { Command, InvalidArgumentError } from "@commander-js/extra-typings";
import {
  generate,
  ALL_FEATURES,
  type Feature,
  type Features,
} from "./generate";

const bold = (s: string) => `\x1b[1m${s}\x1b[22m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[39m`;
const cyan = (s: string) => `\x1b[36m${s}\x1b[39m`;
const heading = (s: string) => bold(yellow(s));

const helpStyle = {
  styleTitle: heading,
  styleOptionTerm: cyan,
  styleArgumentTerm: cyan,
};

function parseFeatures(value: string): Features {
  const features = value.split(",").map((f) => f.trim());

  for (const feature of features) {
    if (!ALL_FEATURES.includes(feature as Feature)) {
      throw new InvalidArgumentError(`Unrecognized feature '${feature}'.`);
    }
  }

  const validated = features as Feature[];

  return {
    zod: validated.includes("zod"),
    msw: validated.includes("msw"),
    typetests: validated.includes("typetests"),
  };
}

const DEFAULT_FEATURES: Features = { zod: false, msw: false, typetests: false };

new Command()
  .name("openapi-gen-ts")
  .configureHelp(helpStyle)
  .argument("<specFile>", "OpenAPI spec file")
  .argument("<destDir>", "Destination directory for generated client")
  .option(
    "-f, --features <features>",
    `Comma-separated list of features (${ALL_FEATURES.join(", ")})`,
    parseFeatures
  )
  .addHelpText(
    "after",
    "\n" +
      heading("Example") +
      ":\n  openapi-gen-ts nexus.json api/__generated__ --features zod,msw"
  )
  .action((specFile, destDir, opts) => {
    // default features handled here instead of option definition because
    // otherwise the object gets plopped confusingly into the help text
    generate(specFile, destDir, opts.features ?? DEFAULT_FEATURES);
  })
  .parse();
