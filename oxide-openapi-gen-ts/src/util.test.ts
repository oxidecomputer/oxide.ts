/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import {
  pathToTemplateStr,
  snakeToCamel,
  snakeToPascal,
  pascalToCamel,
  topologicalSort,
  findCyclicSchemas,
} from "./util";
import { expect, test } from "vitest";

test("pathToTemplateStr", () => {
  expect(
    pathToTemplateStr("/projects/{project_name}/disks/{disk_name}")
  ).toEqual("`/projects/${path.projectName}/disks/${path.diskName}`");
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

test("topologicalSort", () => {
  expect(
    topologicalSort(
      new Map([
        ["a", ["b", "c"]],
        ["b", ["c"]],
        ["c", []],
        ["d", []],
      ])
    )
  ).toEqual(["c", "b", "a", "d"]);
});

test("findCyclicSchemas: no cycles", () => {
  expect(
    findCyclicSchemas(
      new Map([
        ["a", ["b"]],
        ["b", ["c"]],
        ["c", []],
      ])
    )
  ).toEqual(new Set());
});

test("findCyclicSchemas: simple cycle", () => {
  expect(
    findCyclicSchemas(
      new Map([
        ["a", ["b"]],
        ["b", ["a"]],
      ])
    )
  ).toEqual(new Set(["a", "b"]));
});

test("findCyclicSchemas: self-referencing", () => {
  expect(findCyclicSchemas(new Map([["a", ["a"]]]))).toEqual(new Set(["a"]));
});

test("findCyclicSchemas: mixed cyclic and non-cyclic", () => {
  expect(
    findCyclicSchemas(
      new Map([
        ["a", ["b"]],
        ["b", ["a"]],
        ["c", ["a"]],
        ["d", []],
      ])
    )
  ).toEqual(new Set(["a", "b"]));
});

test("findCyclicSchemas: longer cycle", () => {
  expect(
    findCyclicSchemas(
      new Map([
        ["a", ["b"]],
        ["b", ["c"]],
        ["c", ["a"]],
      ])
    )
  ).toEqual(new Set(["a", "b", "c"]));
});
