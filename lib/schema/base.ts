/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { match, P } from "ts-pattern";
import { OpenAPIV3 } from "openapi-types";
import { IO } from "../io";

export type Schema = OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;

export const refToSchemaName = (s: string) =>
  s.replace("#/components/schemas/", "");

export interface SchemaHandlers {
  ref: (schema: OpenAPIV3.ReferenceObject, io: IO) => void;
  enum: (schema: OpenAPIV3.SchemaObject, io: IO) => void;
  boolean: (schema: OpenAPIV3.SchemaObject, io: IO) => void;
  string: (schema: OpenAPIV3.SchemaObject, io: IO) => void;
  date: (schema: OpenAPIV3.SchemaObject, io: IO) => void;
  number: (schema: OpenAPIV3.SchemaObject, io: IO) => void;
  integer: (schema: OpenAPIV3.SchemaObject, io: IO) => void;
  array: (schema: OpenAPIV3.ArraySchemaObject, io: IO) => void;
  object: (schema: OpenAPIV3.SchemaObject, io: IO) => void;
  oneOf: (schema: OpenAPIV3.SchemaObject, io: IO) => void;
  allOf: (schema: OpenAPIV3.SchemaObject, io: IO) => void;
  empty: (io: IO) => void;
  default: (schema: Schema, io: IO) => void;
}

export const makeSchemaGenerator =
  (handlers: SchemaHandlers) => (schema: Schema, io: IO) => {
    match(schema)
      .with({ $ref: P.string }, (s) => handlers.ref(s, io))
      .with({ enum: P.array(P.not(P.nullish)) }, (s) => handlers.enum(s, io))
      .with({ type: "boolean" }, (s) => handlers.boolean(s, io))
      .with({ type: "string", format: "date-time" }, (s) =>
        handlers.date(s, io)
      )
      .with({ type: "string" }, (s) => handlers.string(s, io))
      .with({ type: "number" }, (s) => handlers.number(s, io))
      .with({ type: "integer" }, (s) => handlers.integer(s, io))
      .with({ type: "array" }, (s) => handlers.array(s, io))
      .with({ type: "object" }, (s) => handlers.object(s, io))
      .with({ oneOf: P.not(P.nullish) }, (s) => handlers.oneOf(s, io))
      .with({ allOf: P.not(P.nullish) }, (s) => handlers.allOf(s, io))
      .with({}, () => handlers.empty(io))
      .otherwise((s) => handlers.default(s, io));
  };
