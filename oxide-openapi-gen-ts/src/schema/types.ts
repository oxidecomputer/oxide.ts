/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { snakeToCamel } from "../util";
import { makeSchemaGenerator, refToSchemaName } from "./base";

export const schemaToTypes = makeSchemaGenerator({
  ref(schema, { w0 }) {
    if ("$ref" in schema) {
      w0(refToSchemaName(schema.$ref));
    }
  },
  enum(schema, { w0, w }) {
    schema.enum!.forEach((arm, i) => {
      if (i > 0) w0("| ");
      w(JSON.stringify(arm));
    });
    if (schema.nullable) w0(" | null");
  },
  boolean(schema, { w0 }) {
    w0(`boolean`);
    if (schema.nullable) w0(" | null");
  },
  string(schema, { w0 }) {
    w0(`string`);
    if (schema.nullable) w0(" | null");
  },
  date(schema, { w0 }) {
    w0(`Date`);
    if (schema.nullable) w0(" | null");
  },
  number(schema, { w0 }) {
    w0(`number`);
    if (schema.nullable) w0(" | null");
  },
  integer(schema, { w0 }) {
    w0(`number`);
    if (schema.nullable) w0(" | null");
  },
  array(schema, io) {
    const { w0 } = io;
    w0("(");
    schemaToTypes(schema.items, io);
    w0(")");
    w0("[]");
    if (schema.nullable) w0(" | null");
  },
  object(schema, io) {
    const { w0, w } = io;
    // record type, which only tells us the type of the values
    if (!schema.properties || Object.keys(schema.properties).length === 0) {
      w0("Record<string,");
      if (typeof schema.additionalProperties === "object") {
        schemaToTypes(schema.additionalProperties, io);
      } else {
        w0("unknown");
      }
      w0(">");
      return;
    }

    w0("{");
    for (const [name, subSchema] of Object.entries(schema.properties || {})) {
      const optional = schema.required?.includes(name) ? "" : "?";
      if ("description" in subSchema) {
        w(`\n/** ${subSchema.description} */`);
      }
      w0(`${JSON.stringify(snakeToCamel(name))}${optional}: `);
      schemaToTypes(subSchema, io);
      w0(",");
    }
    w0("}");
    if (schema.nullable) w0(" | null");
  },
  oneOf(schema, io) {
    if (schema.oneOf!.length === 1) {
      return schemaToTypes(schema.oneOf![0], io);
    }
    io.w0("(");
    for (const s of schema.oneOf!) {
      if ("description" in s) {
        io.w(`/** ${s.description} */`);
      }
      io.w0("| ");
      schemaToTypes(s, io);
      io.w("");
    }
    io.w0(")");
    if (schema.nullable) io.w0(" | null");
  },
  allOf(schema, io) {
    if (schema.allOf!.length === 1) {
      schemaToTypes(schema.allOf![0], io);
      if (schema.nullable) io.w0(" | null");
    } else {
      // note: in the nexus schema, this arm is never hit
      for (const s of schema.allOf!) {
        io.w(`& ${JSON.stringify(s)}`);
      }
    }
  },
  empty({ w0 }) {
    w0(`Record<string, unknown>`);
  },
  default(schema) {
    throw Error(`UNHANDLED SCHEMA: ${JSON.stringify(schema, null, 2)}`);
  },
});
