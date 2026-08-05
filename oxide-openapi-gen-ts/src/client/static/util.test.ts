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
  makeParseIfDate,
  mapObj,
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
    (k, v) => (typeof v === "number" ? v * 2 : v),
  );

  it("leaves non-objects alone", () => {
    expect(fn(5)).toEqual(5);
    expect(fn("x")).toEqual("x");
  });

  it("maps over objects and arrays", () => {
    expect(fn({ x: 5, y: { z: 3 } })).toEqual({ x_: 10, y_: { z_: 6 } });
    expect(fn([{ x: 5 }, "abc"])).toEqual([{ x_: 10 }, "abc"]);
  });

  it("maps over objects and arrays before recursing", () => {
    const doubleArray = mapObj(
      (k) => k + "_",
      (k, v) =>
        k === "a" && Array.isArray(v)
          ? v.map((n) => (typeof n === "number" ? n * 2 : n))
          : v,
    );
    expect(
      doubleArray({
        a: [1, { a: 2 }, [3]],
        b: [1, 2, 3],
      }),
    ).toEqual({
      a_: [2, { a_: 2 }, [3]],
      b_: [1, 2, 3],
    });
  });
});

describe("makeParseIfDate", () => {
  const datePropertyNames = ["time_created", "timestamp"];
  const dateArrayPropertyNames = ["start_times"];
  const dateProps = new Set(datePropertyNames);
  const dateArrayProps = new Set(dateArrayPropertyNames);
  const parseIfDate = makeParseIfDate(dateProps, dateArrayProps);

  const timestamp = 1643092429315;
  const dateStr = new Date(timestamp).toISOString();

  it("doesn't parse dates if key isn't a known date property", () => {
    expect(parseIfDate("abc", 123)).toEqual(123);
    expect(parseIfDate("abc", dateStr)).toEqual(dateStr);
    expect(parseIfDate(undefined, dateStr)).toEqual(dateStr);
  });

  it.each(datePropertyNames)(
    "parses dates if the key is a known date property name ('%s')",
    (key) => {
      const value = parseIfDate(key, dateStr);
      expect(value).toBeInstanceOf(Date);
      expect((value as Date).getTime()).toEqual(timestamp);
    },
  );

  it("passes through values that fail to parse as dates, even if key is known", () => {
    expect(parseIfDate(datePropertyNames[0], "blah")).toEqual("blah");
  });

  it.each(dateArrayPropertyNames)(
    "parses arrays of dates if the key is a known date-array property name ('%s')",
    () => {
      const value = parseIfDate(dateArrayPropertyNames[0], [
        dateStr,
        dateStr,
      ]) as unknown[];
      expect(value.map((d) => (d as Date).getTime())).toEqual([
        timestamp,
        timestamp,
      ]);
    },
  );

  it("parses just the date-like elements of a mixed array", () => {
    const value = parseIfDate(dateArrayPropertyNames[0], [
      "blah",
      dateStr,
    ]) as unknown[];
    expect(value[0]).toBe("blah");
    expect(value[1]).toBeInstanceOf(Date);
    expect((value[1] as Date).getTime()).toEqual(timestamp);
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
    expect(parseIfDate(datePropertyNames[0], dateString)).toBeInstanceOf(Date);
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
        "path": [],
        "message": "Items must be unique"
      }
    ]],
      "success": false,
    }
  `);
});
