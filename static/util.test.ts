/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import {
  camelToSnake,
  isObjectOrArray,
  mapObj,
  camelifyKeys,
  snakeifyKeys,
  snakeToCamel,
  uniqueItems,
} from "./util";
import { describe, expect, it, test } from "vitest";
import { z } from "zod";

test("camelToSnake", () => {
  expect(camelToSnake("name")).toEqual("name");
  expect(camelToSnake("Name")).toEqual("_name");
  expect(camelToSnake("ipv4Block")).toEqual("ipv4_block");
});

test("snakeToCamel", () => {
  expect(snakeToCamel("org_name")).toEqual("orgName");
  expect(snakeToCamel("name")).toEqual("name");
  expect(snakeToCamel("ipv4_block")).toEqual("ipv4Block");
});

test("isObjectOrArray", () => {
  const truthy = [{}, { x: 1 }, ["abc"]];
  for (const v of truthy) {
    expect(isObjectOrArray(v)).toBeTruthy();
  }

  const falsy = [1, true, new Date(), "abc", /hello/, new Error()];
  for (const v of falsy) {
    expect(isObjectOrArray(v)).toBeFalsy();
  }
});

describe("mapObj", () => {
  const fn = mapObj(
    (k) => k + "_",
    (k, v) => (typeof v === "number" ? v * 2 : v)
  );

  it("leaves non-objects alone", () => {
    expect(fn(5)).toEqual(5);
    expect(fn("x")).toEqual("x");
  });

  it("maps over objects and arrays", () => {
    expect(fn({ x: 5, y: { z: 3 } })).toEqual({ x_: 10, y_: { z_: 6 } });
    expect(fn([{ x: 5 }, "abc"])).toEqual([{ x_: 10 }, "abc"]);
  });
});

test("camelifyKeys", () => {
  expect(camelifyKeys({})).toEqual({});

  const dateStr = new Date().toISOString();
  const resp = {
    id: "big-uuid",
    another_prop: "abc",
    time_created: dateStr,
  };
  expect(camelifyKeys(resp)).toMatchObject({
    id: "big-uuid",
    anotherProp: "abc",
    timeCreated: dateStr,
  });
});

test("snakeifyKeys", () => {
  const obj = {
    id: "vpc-id",
    timeCreated: new Date(Date.UTC(2021, 0, 1)).toISOString(),
    timeModified: new Date(Date.UTC(2021, 0, 2)).toISOString(),
    systemRouterId: "router-id",
    nestedObj: {
      thereIsMore: 123,
      weAreSerious: "xyz",
    },
  };
  expect(snakeifyKeys(obj)).toMatchInlineSnapshot(`
    {
      "id": "vpc-id",
      "nested_obj": {
        "there_is_more": 123,
        "we_are_serious": "xyz",
      },
      "system_router_id": "router-id",
      "time_created": "2021-01-01T00:00:00.000Z",
      "time_modified": "2021-01-02T00:00:00.000Z",
    }
  `);
});

test("uniqueItems", () => {
  const schema = z
    .enum(["x", "y", "z"])
    .array()
    .refine(...uniqueItems);

  expect(schema.safeParse(["x"]).success).toBe(true);
  expect(schema.safeParse(["x", "y"]).success).toBe(true);
  expect(schema.safeParse(["z", "y"]).success).toBe(true);
  expect(schema.safeParse(["z", "y", "x"]).success).toBe(true);
  expect(schema.safeParse(["x", "x"])).toMatchInlineSnapshot(`
      {
        "error": [ZodError: [
        {
          "code": "custom",
          "message": "Items must be unique",
          "path": []
        }
      ]],
        "success": false,
      }
    `);
});
