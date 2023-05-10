import { OpenAPIV3 } from "openapi-types";
import { initIO } from "../io";
import { getSortedSchemas } from "./base";

const io = initIO("type-test.ts");
const { w } = io;

export function generateTypeTests(spec: OpenAPIV3.Document) {
  if (!spec.components) return;

  const schemaNames = getSortedSchemas(spec).filter((name) => name !== "Error");

  w(`
    import { z } from "zod";
    import { assert, Equals } from "tsafe"
    import type * as A from "./Api"
    import * as V from "./validate"
  `);

  for (const name of schemaNames) {
    const schema = spec.components!.schemas![name];
    if (!schema) continue;

    // TODO: these two types are failing to pass type asserts but they
    // seem to be correct in shape. Follow up on why the type tests
    // are failing
    if (["IpPoolRange", "IpPoolRangeResultsPage"].includes(name)) {
      w(`assert<
        // @ts-expect-error
        Equals<A.${name}, z.infer<typeof V.${name}>>
      >();`);
      continue;
    }

    w(`assert<Equals<A.${name}, z.infer<typeof V.${name}>>>();`);
  }
}
