import { IO } from "./io";
import { match, P } from "ts-pattern";
import { refToSchemaName, Schema } from "./schema";
import { OpenAPIV3 } from "openapi-types";

export function setupZod({ w }: IO) {
  w("import { z, ZodType } from 'zod';");
  w(`
    const DateType = z.preprocess((arg) => {
      if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    }, z.date());
    type DateType = z.infer<typeof DateType>;`);

  /**
   * Zod only supports string enums at the moment. A previous issue was opened
   * and closed as stale but it provided a hint on how to implement it.
   *
   * @see https://github.com/colinhacks/zod/issues/1118
   * TODO: PR an update for zod to support other native enum types
   */
  w(`const IntEnum = <T extends readonly number[]>(values: T) => 
      z.number().refine((v) => values.includes(v)) as ZodType<T[number]>;
  `);
}

export function schemaToZod(schema: Schema, io: IO) {
  const { w, w0 } = io;

  if ("$ref" in schema) {
    w0(refToSchemaName(schema.$ref));
    return;
  }

  match(schema)
    .with({ type: "boolean" }, () => schemaToZodBool(schema, io))
    .with({ type: "string", format: "date-time" }, () => w0("DateType"))
    .with({ type: "string", enum: P.array(P.string) }, () =>
      schemaToZodEnum(schema, io)
    )
    .with({ type: "string" }, () => schemaToZodString(schema, io))
    .with({ type: "number" }, () => w0("z.number()"))
    .with({ type: "integer" }, () => schemaToZodInt(schema, io))
    .with({ type: "array" }, (s) => schemaToZodArray(s, io))
    .with({ type: "object" }, () => schemaToZodObject(schema, io))
    .with({ oneOf: P.not(P.nullish) }, () => schemaToZodUnion(schema, io))
    .with({ allOf: P.not(P.nullish) }, () => schemaToZodAllOf(schema, io))
    .with({}, () => w0("z.object({}).optional()"))
    .otherwise(() => {
      throw Error(`UNHANDLED SCHEMA: ${JSON.stringify(schema, null, 2)}`);
    });

  w("");
}

function schemaToZodBool(schema: OpenAPIV3.SchemaObject, { w0 }: IO) {
  w0(`z.boolean()`);
  if ("default" in schema) {
    w0(`.default(${schema.default})`);
  }
}

function schemaToZodString(schema: OpenAPIV3.SchemaObject, { w0 }: IO) {
  w0(`z.string()`);

  if ("default" in schema) {
    w0(`.default(${JSON.stringify(schema.default)})`);
  }
  if (schema.format === "uuid") {
    w0(".uuid()");
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
  if ("nullable" in schema) {
    w0(".nullable()");
  }
}

function schemaToZodEnum(schema: OpenAPIV3.SchemaObject, io: IO) {
  const { w0 } = io;
  w0(`z.enum(${JSON.stringify(schema.enum)})`);
}

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

  if ("nullable" in schema) {
    w0(".nullable()");
  }
}

function schemaToZodArray(schema: OpenAPIV3.ArraySchemaObject, io: IO) {
  const { w0 } = io;
  schemaToZod(schema.items, io);
  w0(".array()");
  if ("default" in schema) {
    w0(`.default(${JSON.stringify(schema.default)})`);
  }
  if ("nullable" in schema) {
    w0(".nullable()");
  }
}

function schemaToZodObject(schema: OpenAPIV3.SchemaObject, io: IO) {
  const { w0, w } = io;
  w0("z.object({");
  for (const [name, subSchema] of Object.entries(schema.properties || {})) {
    w0(`${JSON.stringify(name)}: `);
    schemaToZod(subSchema, io);
    if (!schema.required?.includes(name)) {
      w0(`.optional()`);
    }
    w(",");
  }
  w0("})");
}

function schemaToZodUnion(schema: OpenAPIV3.SchemaObject, io: IO) {
  if (!schema.oneOf) return;
  const { w } = io;

  if (schema.oneOf.length === 1) {
    schemaToZod(schema.oneOf[0], io);
    return;
  }

  w("z.union([");
  for (const s of schema.oneOf) {
    schemaToZod(s, io);
    w(",");
  }
  w("])");
}

function schemaToZodAllOf(schema: OpenAPIV3.SchemaObject, io: IO) {
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
  if ("nullable" in schema) {
    w0(`.nullable()`);
  }
}
