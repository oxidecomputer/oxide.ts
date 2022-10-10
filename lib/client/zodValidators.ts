import { OpenAPIV3 } from "openapi-types";
import { initIO } from "../io";
import { schemaToZod } from "../schema/zod";
import {
  pascalToCamel,
  processParamName,
  snakeToCamel,
  snakeToPascal,
} from "../util";
import { docComment, getSortedSchemas } from "./base";

const HttpMethods = OpenAPIV3.HttpMethods;

const io = initIO("validate.ts");
const { w, w0, out } = io;

export function generateZodValidators(spec: OpenAPIV3.Document) {
  if (!spec.components) return;

  w(`/* eslint-disable */
  import { z, ZodType } from 'zod';
  import { snakeify, processResponseBody } from './util';

  const DateType = z.preprocess((arg) => {
    if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
  }, z.date());
  type DateType = z.infer<typeof DateType>;

  /**
   * Zod only supports string enums at the moment. A previous issue was opened
   * and closed as stale but it provided a hint on how to implement it.
   *
   * @see https://github.com/colinhacks/zod/issues/1118
   * TODO: PR an update for zod to support other native enum types
   */
  const IntEnum = <T extends readonly number[]>(values: T) => 
      z.number().refine((v) => values.includes(v)) as ZodType<T[number]>;

  /**
   * Normalizes input to make it compatible with validators. This entails converting from snake to camel case and parsing dates.
   **/
  const processSchema = <T extends z.ZodType>(schema: T) => z.preprocess((input) => processResponseBody(input), schema);

  /**
   * Normalizes schema output to make it compatible with the API. This entails converting from camel to snake case.
   **/
  export const snakeifySchema = <T extends z.ZodType>(schema: T) => schema.transform(snakeify);
  `);

  const schemaNames = getSortedSchemas(spec);
  for (const schemaName of schemaNames) {
    const schema = spec.components!.schemas![schemaName];

    if ("description" in schema || "title" in schema) {
      docComment(
        [schema.title, schema.description].filter((n) => n).join("\n\n"),
        schemaNames,
        io
      );
    }

    w0(`export const ${schemaName} = processSchema(`);
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
      w(`export const ${opName}Params = processSchema(z.object({`);
      for (const param of params || []) {
        if ("name" in param) {
          if (param.schema) {
            const isQuery = param.in === "query";
            if ("description" in param.schema || "title" in param.schema) {
              docComment(
                [param.schema.title, param.schema.description]
                  .filter((n) => n)
                  .join("\n\n"),
                schemaNames,
                io
              );
            }

            w0(`  ${processParamName(param.name)}`);
            w0(": ");
            schemaToZod(param.schema, io);
            if (isQuery) w0(".optional()");
            w(",");
          }
        }
      }
      w(`}))`);
      w("");
    }
  }
  out.end();
}
