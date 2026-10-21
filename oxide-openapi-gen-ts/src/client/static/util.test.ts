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
  makeProcessResponseBody,
  mapObj,
  parseIfDate,
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

  it("passes the parent key to scalars in arrays", () => {
    const calls: [string, unknown][] = [];
    const record = mapObj(
      (k) => k,
      (k, v) => {
        calls.push([k, v]);
        return v;
      },
    );
    record({ a: [1, [2, 3]], b: [{ c: 4 }] });
    expect(calls).toEqual([
      ["a", 1],
      ["a", 2],
      ["a", 3],
      ["c", 4],
    ]);
  });

  it("leaves scalars in a top-level array alone", () => {
    const calls: [string, unknown][] = [];
    const record = mapObj(
      (k) => k,
      (k, v) => {
        calls.push([k, v]);
        return v;
      },
    );
    expect(record([1, "x", { a: 2 }])).toEqual([1, "x", { a: 2 }]);
    expect(calls).toEqual([["a", 2]]);
  });
});

describe("makeProcessResponseBody", () => {
  const processResponseBody = makeProcessResponseBody(
    new Set(["time_created", "created_at", "timestamps"]),
  );

  it("camel-cases keys and parses date keys", () => {
    expect(processResponseBody({})).toEqual({});

    const date = new Date();
    const dateStr = date.toISOString();
    const resp = {
      id: "big-uuid",
      another_prop: "abc",
      time_created: dateStr,
      created_at: dateStr,
      time_modified: dateStr, // not in the set
    };
    expect(processResponseBody(resp)).toEqual({
      id: "big-uuid",
      anotherProp: "abc",
      timeCreated: date,
      createdAt: date,
      timeModified: dateStr,
    });
  });

  it("parses arrays of dates and dates in arrays of objects", () => {
    const d1 = "2023-01-01T12:00:00Z";
    const d2 = "2023-01-02T12:00:00.123Z";
    expect(
      processResponseBody({
        timestamps: [d1, d2],
        items: [{ created_at: d1 }, { created_at: d2, other: d2 }],
      }),
    ).toEqual({
      timestamps: [new Date(d1), new Date(d2)],
      items: [
        { createdAt: new Date(d1) },
        { createdAt: new Date(d2), other: d2 },
      ],
    });
  });
});

describe("parseIfDate", () => {
  const parse = parseIfDate(new Set(["time_created", "created_at", "seen"]));

  it("passes through non-date values", () => {
    expect(parse("created_at", 123)).toEqual(123);
    expect(parse("created_at", "def")).toEqual("def");
  });

  const timestamp = 1643092429315;
  const dateStr = new Date(timestamp).toISOString();

  it("doesn't parse dates if key isn't in the set", () => {
    expect(parse("abc", dateStr)).toEqual(dateStr);
    expect(parse("time_modified", dateStr)).toEqual(dateStr);
  });

  it.each(["time_created", "created_at", "seen"])(
    "parses dates if key is '%s'",
    (key) => {
      const value = parse(key, dateStr);
      expect(value).toBeInstanceOf(Date);
      expect((value as Date).getTime()).toEqual(timestamp);
    },
  );

  it("passes through strings that don't look like dates", () => {
    expect(parse("created_at", "blah")).toEqual("blah");
    expect(parse("created_at", "2023-01-01")).toEqual("2023-01-01");
  });

  it("throws on a date-shaped value that isn't a real instant", () => {
    expect(() => parse("created_at", "2023-13-45T99:99:99Z")).toThrow(
      'Invalid date-time for "created_at": "2023-13-45T99:99:99Z"',
    );
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
    const value = parse("created_at", dateString);
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
        "path": [],
        "message": "Items must be unique"
      }
    ]],
      "success": false,
    }
  `);
});
