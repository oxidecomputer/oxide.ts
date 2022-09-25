import { OpenAPIV3 } from "openapi-types";

export type Schema = OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
export const refToSchemaName = (s: string) =>
  s.replace("#/components/schemas/", "");
