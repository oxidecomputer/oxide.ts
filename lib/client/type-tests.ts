import { OpenAPIV3 } from "openapi-types";
import { initIO } from "../io";
import { getSortedSchemas } from "./base";

const io = initIO("type-test.ts");
const { w } = io;

export function generateTypeTests(spec: OpenAPIV3.Document) {
  if (!spec.components) return;

  const schemaNames = getSortedSchemas(spec).filter((name) => name !== "Error");

  w('import { z } from "zod";');
  w("import type {");
  for (const name of schemaNames) {
    const schema = spec.components!.schemas![name];
    if (!schema) continue;

    w(`${name} as ${name}_Type,`);
  }
  w('} from "./Api"');

  w("import {");
  for (const name of schemaNames) {
    const schema = spec.components!.schemas![name];
    if (!schema) continue;

    w(`${name},`);
  }
  w('} from "./validate"');

  w("const assertType = <T1, T2 extends T1>() => {}");

  for (const name of schemaNames) {
    const schema = spec.components!.schemas![name];
    if (!schema) continue;

    w(`assertType<${name}_Type, z.infer<typeof ${name}>>();`);
  }
}
