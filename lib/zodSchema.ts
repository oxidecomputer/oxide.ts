import { IO } from "./io";
import { match, P } from "ts-pattern";
import { refToSchemaName, Schema } from "./schema";
import { OpenAPIV3 } from "openapi-types";

export function setupZod({ w }: IO) {
  w("import { z } from 'zod';");
  w(`
    const DateType = z.preprocess((arg) => {
      if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    }, z.date());
    type DateType = z.infer<typeof DateType>;
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
    .with({ allOf: P.not(P.nullish) }, (s) => schemaToZod(s.allOf[0], io))
    .with({}, () => w0("z.object({}).optional()"))
    .otherwise(() => {
      throw Error(`UNHANDLED SCHEMA: ${JSON.stringify(schema, null, 2)}`);
    });

  w("");
}

function schemaToZodBool(schema: OpenAPIV3.SchemaObject, { w, w0 }: IO) {
  w0(`z.boolean()`);
  if (schema.default) {
    w0(`.default(${schema.default})`);
  }
}

function schemaToZodString(schema: OpenAPIV3.SchemaObject, { w, w0 }: IO) {
  w0(`z.string()`);

  if (schema.default) {
    w0(`.default(${JSON.stringify(schema.default)})`);
  }
  if (schema.format === "uuid") {
    w0(".uuid()");
  }
  if (schema.minLength) {
    w0(`.min(${schema.minLength})`);
  }
  if (schema.maxLength) {
    w0(`.max(${schema.maxLength})`);
  }
  if (schema.pattern) {
    w0(`.regex(${new RegExp(schema.pattern).toString()})`);
  }
  if (schema.nullable) {
    w0(".nullable()");
  }
}

function schemaToZodEnum(schema: OpenAPIV3.SchemaObject, io: IO) {
  const { w0 } = io;
  w0(`z.enum(${JSON.stringify(schema.enum)})`);
}

function schemaToZodInt(schema: OpenAPIV3.SchemaObject, { w, w0 }: IO) {
  w0(`z.number()`);
  if (schema.default) {
    w0(`.default(${schema.default})`);
  }

  const [, unsigned, size] = schema.format?.match(/(u?)int(\d+)/) || [];
  if (schema.minimum) {
    w0(`.min(${schema.minimum})`);
  } else if (unsigned) {
    w0(`.min(0)`);
  } else if (size && parseInt(size) < 64) {
    w0(`.min(-${Math.pow(2, parseInt(size) - 1) - 1})`);
  }

  if (schema.maximum) {
    w0(`.max(${schema.maximum})`);
  } else if (size && unsigned && parseInt(size) < 64) {
    w0(`.max(${Math.pow(2, parseInt(size)) - 1})`);
  } else if (size && parseInt(size) < 64) {
    // It's signed so remove the most significant bit
    w0(`.max(${Math.pow(2, parseInt(size) - 1) - 1})`);
  }

  if (schema.nullable) {
    w0(".nullable()");
  }
}

function schemaToZodArray(schema: OpenAPIV3.ArraySchemaObject, io: IO) {
  const { w0 } = io;
  schemaToZod(schema.items, io);
  w0(".array()");
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
  const { w0, w } = io;

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
