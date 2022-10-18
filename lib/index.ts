import SwaggerParser from "@apidevtools/swagger-parser";
import { OpenAPIV3 } from "openapi-types";

import { generateApi } from "./client/api";
import { generateMSWHandlers } from "./client/msw-handlers";
import { generateTypeTests } from "./client/type-tests";
import { generateZodValidators } from "./client/zodValidators";

const specFile = process.argv[2];
if (!specFile) {
  throw Error("Missing specFile argument");
}

SwaggerParser.parse(specFile).then((spec) => {
  generateApi(spec as OpenAPIV3.Document);
  generateZodValidators(spec as OpenAPIV3.Document);
  generateTypeTests(spec as OpenAPIV3.Document);
  generateMSWHandlers(spec as OpenAPIV3.Document);
});
