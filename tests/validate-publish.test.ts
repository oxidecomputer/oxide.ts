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
    // We know that we want to publish `client/*` and `dist/*` so skip those
    .filter((l) => !(l?.startsWith("client/") || l?.startsWith("dist/")));

  // This list includes all the files that should be included in the publish
  // _expect_ those in `client/*` and `dist/*`. If this test fails and you've
  // added a new file you should update this list if it should be included in
  // the npm package or update the .npmignore file to exclude it.
  expect(packageLog).toMatchInlineSnapshot(`
    [
      "LICENSE",
      "README.md",
      "package.json",
    ]
  `);
});
