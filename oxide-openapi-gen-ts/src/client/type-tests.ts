/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { OpenAPIV3 } from "openapi-types";
import { initIO } from "../io";
import { getSortedSchemas } from "./base";
import fs from "node:fs";
import path from "node:path";

export function generateTypeTests(spec: OpenAPIV3.Document, destDir: string) {
  if (!spec.components) return;

  const outFile = path.resolve(destDir, "type-test.ts");
  const out = fs.createWriteStream(outFile, { flags: "w" });
  const io = initIO(out);
  const { w } = io;

  const schemaNames = getSortedSchemas(spec).filter((name) => name !== "Error");

  w(`
    import { type z } from "zod";
    import { assert, type Equals } from "tsafe"
    import type * as A from "./Api"
    import type * as V from "./validate"
  `);

  for (const name of schemaNames) {
    const schema = spec.components!.schemas![name];
    if (!schema) continue;

    w(`assert<Equals<A.${name}, z.infer<typeof V.${name}>>>();`);
  }
}
