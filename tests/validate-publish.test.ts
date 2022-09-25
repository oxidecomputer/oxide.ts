import { test, expect } from "vitest";
import { exec as execCb } from "child_process";
import { promisify } from "util";

const exec = promisify(execCb);

test("ensure only desired files are published", async () => {
  const { stderr } = await exec("npm publish --dry-run");
  let packageLog = Array.from(
    new Set( // <- just to remove duplicates
      stderr
        .split("\n")
        .map((l) => l.replace("npm notice", "").trim())
        .filter((l) => l.match(/^\d+/))
        .map((l) => l.match(/.*\s+(.*)/)?.[1])
        // We know that we want all files in `client/` and `dist/` so let's just collapse those down
        .map((l) => l?.replace(/^(client|dist)\/.*/g, "$1/*"))
    )
  );

  // This list includes all the files that should be included in the publish
  // _expect_ those in `client/*` and `dist/*`. If this test fails and you've
  // added a new file you should update this list if it should be included in
  // the npm package or update the .npmignore file to exclude it.
  expect(packageLog).toMatchInlineSnapshot(`
    [
      "LICENSE",
      "README.md",
      "client/*",
      "dist/*",
      "package.json",
    ]
  `);
});
