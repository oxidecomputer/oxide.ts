import SwaggerParser from "@apidevtools/swagger-parser";
import { OpenAPIV3 } from "openapi-types";
import { match, P } from "ts-pattern";

type SchemaTypes = Record<
  NonNullable<OpenAPIV3.SchemaObject["type"]> | "oneOf" | "allOf",
  OpenAPIV3.SchemaObject[]
>;

const recordSchemaType = (
  schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
  types: SchemaTypes
) => {
  if ("$ref" in schema) return;

  match(schema)
    .with({ type: "array" }, (s) => {
      types.array.push(s);
      recordSchemaType(s.items, types);
    })
    .with({ type: "object" }, () => {
      types.object.push(schema);
      Object.values(schema.properties || {}).forEach((p) =>
        recordSchemaType(p, types)
      );
    })
    .with({ type: P.string }, (s) => {
      types[s.type].push(s);
    })
    .with({ oneOf: P.not(P.nullish) }, (s) => {
      types.oneOf.push(s);
      s.oneOf.forEach((s2) => {
        return recordSchemaType(s2, types);
      });
    })
    .with({ allOf: P.not(P.nullish) }, (s) => {
      types.allOf.push(s);
      s.allOf.forEach((s2) => recordSchemaType(s2, types));
    })
    .otherwise((s) => {
      console.warn("Unhandled schema type", s);
    });
};

export async function getSchemaTypes() {
  const spec = (await SwaggerParser.parse("spec.json")) as OpenAPIV3.Document;
  const schemas = spec.components!.schemas!;

  const types: SchemaTypes = {
    string: [],
    number: [],
    boolean: [],
    object: [],
    array: [],
    integer: [],
    oneOf: [],
    allOf: [],
  };
  Object.values(schemas).forEach((s) => recordSchemaType(s, types));
  return types;
}
