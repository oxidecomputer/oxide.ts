import { generateClient } from "./gen-client";

const specFile = process.argv[2];
if (!specFile) {
  throw Error("Missing specFile argument");
}

generateClient(specFile);
