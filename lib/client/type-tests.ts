/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { OpenAPIV3 } from "openapi-types";
import { initIO } from "../io";
import { getSortedSchemas } from "./base";

const io = initIO("type-test.ts");
const { w } = io;

export function generateTypeTests(spec: OpenAPIV3.Document) {
  if (!spec.components) return;

  const schemaNames = getSortedSchemas(spec).filter((name) => name !== "Error");

  w(`
    /**
     * This Source Code Form is subject to the terms of the Mozilla Public
     * License, v. 2.0. If a copy of the MPL was not distributed with this
     * file, you can obtain one at https://mozilla.org/MPL/2.0/.
     *
     * Copyright Oxide Computer Company
     */
  `);

  w(`
    import { z } from "zod";
    import { assert, Equals } from "tsafe"
    import type * as A from "./Api"
    import * as V from "./validate"
  `);

  for (const name of schemaNames) {
    const schema = spec.components!.schemas![name];
    if (!schema) continue;

    w(`assert<Equals<A.${name}, z.infer<typeof V.${name}>>>();`);
  }
}
