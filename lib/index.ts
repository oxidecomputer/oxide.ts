import SwaggerParser from "@apidevtools/swagger-parser";
import { OpenAPIV3 } from "openapi-types";

import { generateRuntime } from "./client/runtime";
import { generateZodValidators } from "./client/zodValidators";

const specFile = process.argv[2];
if (!specFile) {
  throw Error("Missing specFile argument");
}

SwaggerParser.parse(specFile).then((spec) => {
  generateRuntime(spec as OpenAPIV3.Document);
  generateZodValidators(spec as OpenAPIV3.Document);
});
