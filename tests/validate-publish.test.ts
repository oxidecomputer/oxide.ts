import { test, expect } from "vitest";
import { exec as execCb } from "child_process";
import { promisify } from "util";

const exec = promisify(execCb);

test("ensure only desired files are published", async () => {
  const { stderr } = await exec("npm publish --dry-run");
  let packageLog = stderr
    .split("\n")
    .map((l) => l.replace("npm notice", "").trim())
    .filter((l) => l.match(/^\d+/))
    .map((l) => l.match(/.*\s+(.*)/)?.[1])
    .sort((a, b) => a!.localeCompare(b!));

  // This list includes all the files that should be included in the publish.
  // If this test fails and you've added a new file you should update this list
  // if it should be included in the npm package or update the .npmignore file
  // to exclude it.
  expect(packageLog).toMatchInlineSnapshot(`
    [
      "client/Api.ts",
      "client/http-client.ts",
      "client/util.ts",
      "dist/Api.d.ts",
      "dist/Api.js",
      "dist/Api.mjs",
      "LICENSE",
      "package.json",
      "README.md",
    ]
  `);
});
