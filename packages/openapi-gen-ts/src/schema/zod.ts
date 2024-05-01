/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { type IO } from "../io";
import { makeSchemaGenerator, refToSchemaName } from "./base";
import { type OpenAPIV3 } from "openapi-types";
import { snakeToCamel } from "../util";

export const schemaToZod = makeSchemaGenerator({
  ref(schema, { w0 }) {
    if ("$ref" in schema) {
      w0(refToSchemaName(schema.$ref));
    }
  },

  boolean(schema, { w0 }) {
    w0(`SafeBoolean`);
    if ("default" in schema) {
      w0(`.default(${schema.default})`);
    }
  },

  enum(schema, io) {
    if (schema.type === "string") {
      io.w0(`z.enum(${JSON.stringify(schema.enum)})`);
    } else if (schema.type === "integer") {
      schemaToZodInt(schema, io);
    } else {
      throw new Error(`Unsupported enum type ${schema.type}`);
    }
  },

  string(schema, { w0 }) {
    w0(`z.string()`);

    if ("default" in schema) {
      w0(`.default(${JSON.stringify(schema.default)})`);
    }
    if (schema.format === "uuid") {
      w0(".uuid()");
    }

    if (schema.format === "ip") {
      w0(".ip()");
    } else if (schema.format === "ipv4") {
      w0(".ip({ version: 'v4' })");
    } else if (schema.format === "ipv6") {
      w0(".ip({ version: 'v6' })");
    }

    if ("minLength" in schema) {
      w0(`.min(${schema.minLength})`);
    }
    if ("maxLength" in schema) {
      w0(`.max(${schema.maxLength})`);
    }
    if ("pattern" in schema) {
      w0(`.regex(${new RegExp(schema.pattern!).toString()})`);
    }
  },

  date(_, { w0 }) {
    w0("z.coerce.date()");
  },

  number(_, { w0 }) {
    w0("z.number()");
  },

  integer: schemaToZodInt,

  array(schema, io) {
    const { w0 } = io;
    schemaToZod(schema.items, io);
    w0(".array()");
    if ("default" in schema) {
      w0(`.default(${JSON.stringify(schema.default)})`);
    }
    if (schema.uniqueItems) {
      w0(`.refine(...uniqueItems)`);
    }
  },

  object(schema, io) {
    const { w0, w } = io;
    // record type, which only tells us the type of the values
    if (!schema.properties || Object.keys(schema.properties).length === 0) {
      w0("z.record(z.string().min(1),");
      if (typeof schema.additionalProperties === "object") {
        schemaToZod(schema.additionalProperties, io);
      } else {
        w0("z.unknown()");
      }
      w0(")");
      return;
    }

    w0("z.object({");
    for (const [name, subSchema] of Object.entries(schema.properties || {})) {
      w0(`${JSON.stringify(snakeToCamel(name))}: `);
      schemaToZod(subSchema, io);
      if (!schema.required?.includes(name)) {
        w0(`.optional()`);
      }
      w(",");
    }
    w0("})");
  },

  oneOf(schema, io) {
    if (!schema.oneOf) return;
    const { w } = io;

    if (schema.oneOf.length === 1) {
      schemaToZod(schema.oneOf[0], io);
      return;
    }

    /**
     * When dropshot serializes an enum sometimes it breaks it down into a `oneOf` with
     * single element enums such that each individual enum can contain its own description. For zod
     * this translates into a union of single element enums which is unnecessarily complex. We just
     * flatten it down to a single enum here.
     *
     * @see https://github.com/oxidecomputer/oxide.ts/issues/178 for more details
     */
    if (schema.oneOf.every((s) => s && "enum" in s && s.enum?.length === 1)) {
      const enums = schema.oneOf.map(
        (s) => (s as OpenAPIV3.SchemaObject).enum![0]
      );
      w(`z.enum([${enums.map((e) => JSON.stringify(e)).join(", ")}])`);
      return;
    }

    w("z.union([");
    for (const s of schema.oneOf) {
      schemaToZod(s, io);
      w(",");
    }
    w("])");
  },

  allOf(schema, io) {
    if (!schema.allOf) return;
    const { w, w0 } = io;

    if (schema.allOf.length === 0) {
      throw new Error(
        `Unexpected "allOf" should have at least one schema: ${schema}`
      );
    }

    if (schema.allOf.length === 1) {
      schemaToZod(schema.allOf[0], io);
    } else {
      w("z.intersection([");
      for (const s of schema.allOf) {
        schemaToZod(s, io);
        w(",");
      }
      w("])");
    }

    if ("default" in schema) {
      w0(`.default(${JSON.stringify(schema.default)})`);
    }
  },

  empty({ w0 }) {
    w0("z.record(z.unknown())");
  },

  default(schema) {
    throw Error(`UNHANDLED SCHEMA: ${JSON.stringify(schema, null, 2)}`);
  },
});

function schemaToZodInt(schema: OpenAPIV3.SchemaObject, { w0 }: IO) {
  if ("enum" in schema) {
    /**  See comment in {@link setupZod} */
    w0(`IntEnum(${JSON.stringify(schema.enum)} as const)`);
  } else {
    w0(`z.number()`);
  }

  if (schema.default) {
    w0(`.default(${schema.default})`);
  }

  const [, unsigned, size] = schema.format?.match(/(u?)int(\d+)/) || [];
  if ("minimum" in schema) {
    w0(`.min(${schema.minimum})`);
  } else if (unsigned) {
    w0(`.min(0)`);
  } else if (size && parseInt(size) < 64) {
    w0(`.min(-${Math.pow(2, parseInt(size) - 1) - 1})`);
  }

  if ("maximum" in schema) {
    w0(`.max(${schema.maximum})`);
  } else if (size && unsigned && parseInt(size) < 64) {
    w0(`.max(${Math.pow(2, parseInt(size)) - 1})`);
  } else if (size && parseInt(size) < 64) {
    // It's signed so remove the most significant bit
    w0(`.max(${Math.pow(2, parseInt(size) - 1) - 1})`);
  }
}
