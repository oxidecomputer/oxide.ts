import {
  pathToTemplateStr,
  snakeToCamel,
  snakeToPascal,
  pascalToCamel,
  uniq,
} from "./gen-client";
import { expect, test } from "vitest";

test("pathToTemplateStr", () => {
  expect(
    pathToTemplateStr(
      "/organizations/{organization_name}/projects/{project_name}/disks/{disk_name}",
    ),
  ).toEqual(
    "`/organizations/${orgName}/projects/${projectName}/disks/${diskName}`",
  );
});

test("snakeToCamel", () => {
  expect(snakeToCamel("")).toEqual("");
  expect(snakeToCamel("ipv4_block")).toEqual("ipv4Block");
  expect(snakeToCamel("a_lot_of_words")).toEqual("aLotOfWords");
});

test("snakeToPascal", () => {
  expect(snakeToPascal("")).toEqual("");
  expect(snakeToPascal("ipv4_block")).toEqual("Ipv4Block");
  expect(snakeToPascal("a_lot_of_words")).toEqual("ALotOfWords");
});

test("pascalToCamel", () => {
  expect(pascalToCamel("")).toEqual("");
  expect(pascalToCamel("Ipv4Block")).toEqual("ipv4Block");
  expect(pascalToCamel("ALotOfWords")).toEqual("aLotOfWords");
});

test("uniq", () => {
  expect([1, 2, 3].reduce(uniq, [])).toEqual([1, 2, 3]);
  expect([1, 2, 3, 2, 3].reduce(uniq, [])).toEqual([1, 2, 3]);
  expect(["abc", "abc", 2, 3].reduce(uniq, [])).toEqual(["abc", 2, 3]);

  // does not deep equal
  expect([1, 2, { a: 1 }, { a: 1 }].reduce(uniq, [])).toEqual([
    1,
    2,
    { a: 1 },
    { a: 1 },
  ]);
});
