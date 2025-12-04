/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { OpenAPIV3 } from "openapi-types";
import { initIO } from "../io";
import { schemaToZod } from "../schema/zod";
import { extractDoc, processParamName, snakeToPascal } from "../util";
import { docComment, getSortedSchemas } from "./base";
import path from "node:path";
import fs from "node:fs";

const HttpMethods = OpenAPIV3.HttpMethods;

export async function generateZodValidators(
  spec: OpenAPIV3.Document,
  destDir: string
) {
  if (!spec.components) return;

  const outFile = path.resolve(destDir, "validate.ts");
  const out = fs.createWriteStream(outFile, { flags: "w" });
  const io = initIO(out);
  const { w, w0 } = io;

  w(`/* eslint-disable */

  import { z, ZodType } from 'zod/v4';
  import { processResponseBody, uniqueItems } from './util';

  /**
   * Zod only supports string enums at the moment. A previous issue was opened
   * and closed as stale but it provided a hint on how to implement it.
   *
   * @see https://github.com/colinhacks/zod/issues/1118
   * TODO: PR an update for zod to support other native enum types
   */
  const IntEnum = <T extends readonly number[]>(values: T) => 
      z.number().refine((v) => values.includes(v)) as ZodType<T[number]>;

  /** Helper to ensure booleans provided as strings end up with the correct value */
  const SafeBoolean = z.preprocess(v => v === "false" ? false : v, z.coerce.boolean())
  `);

  const schemaNames = getSortedSchemas(spec);
  for (const schemaName of schemaNames) {
    const schema = spec.components!.schemas![schemaName];

    if ("description" in schema || "title" in schema) {
      docComment(extractDoc(schema), schemaNames, io);
    }

    w0(`export const ${schemaName} = z.preprocess(processResponseBody,`);
    schemaToZod(schema, io);
    w(")\n");
  }

  for (const path in spec.paths) {
    const handlers = spec.paths[path]!;
    let method: keyof typeof HttpMethods;
    for (method in HttpMethods) {
      const conf = handlers[HttpMethods[method]];
      if (!conf?.operationId) continue;

      const opName = snakeToPascal(conf.operationId);
      const params = conf.parameters;
      w(
        `export const ${opName}Params = z.preprocess(processResponseBody, z.object({`
      );

      w("  path: z.object({");
      for (const param of params || []) {
        if ("name" in param && param.schema && param.in === "path") {
          if ("description" in param.schema || "title" in param.schema) {
            docComment(extractDoc(param.schema), schemaNames, io);
          }

          w0(`  ${processParamName(param.name)}`);
          w0(": ");
          schemaToZod(param.schema, io);
          w(",");
        }
      }
      w("  }),");

      w("  query: z.object({");
      for (const param of params || []) {
        if ("name" in param && param.schema && param.in === "query") {
          if ("description" in param.schema || "title" in param.schema) {
            docComment(extractDoc(param.schema), schemaNames, io);
          }

          w0(`  ${processParamName(param.name)}`);
          w0(": ");
          schemaToZod(param.schema, io);
          if (!param.required) w0(".optional()");
          w(",");
        }
      }
      w("  }),");

      w(`}))`);
      w("");
    }
  }
  await io.end();
}
