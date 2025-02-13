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
  parseIfDate,
  processResponseBody,
  snakeify,
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

test("processResponseBody", () => {
  expect(processResponseBody({})).toEqual({});

  const date = new Date();
  const dateStr = date.toISOString();
  const resp = {
    id: "big-uuid",
    another_prop: "abc",
    time_created: dateStr,
  };
  expect(processResponseBody(resp)).toMatchObject({
    id: "big-uuid",
    anotherProp: "abc",
    timeCreated: expect.any(Date),
  });
});

describe("parseIfDate", () => {
  it("passes through non-date values", () => {
    expect(parseIfDate("abc", 123)).toEqual(123);
    expect(parseIfDate("abc", "def")).toEqual("def");
  });

  const timestamp = 1643092429315;
  const dateStr = new Date(timestamp).toISOString();

  it("doesn't parse dates if key doesn't start with time_", () => {
    expect(parseIfDate("abc", dateStr)).toEqual(dateStr);
  });

  it.each(["time_whatever", "auto_thing_expiration", "timestamp"])(
    "parses dates if key is '%s'",
    (key) => {
      const value = parseIfDate(key, dateStr);
      expect(value).toBeInstanceOf(Date);
      expect((value as Date).getTime()).toEqual(timestamp);
    }
  );

  it("passes through values that fail to parse as dates", () => {
    const value = parseIfDate("time_whatever", "blah");
    expect(value).toEqual("blah");
  });

  it.each([
    "2023-01-01T12:00:00Z",
    "2023-01-01T12:00:00.1Z",
    "2023-01-01T12:00:00.12Z",
    "2023-01-01T12:00:00.123Z",
    "2023-01-01T12:00:00.1234Z",
    "2023-01-01T12:00:00.12345Z",
    "2023-01-01T12:00:00.123456Z",
    "2023-01-01T12:00:00.123456789Z",
    "2023-01-01T12:00:00.123456789123Z",
    "2023-01-01T12:00:00.123456789123123Z",
  ])("parses dates with fractional digits: %s", (dateString) => {
    const value = parseIfDate("time_whatever", dateString);
    expect(value).toBeInstanceOf(Date);
  });
});

test("snakeify", () => {
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
  expect(snakeify(obj)).toMatchInlineSnapshot(`
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
