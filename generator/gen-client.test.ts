import {
  pathToTemplateStr,
  snakeToCamel,
  snakeToPascal,
  pascalToCamel,
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
