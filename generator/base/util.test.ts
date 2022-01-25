import {
  camelToSnake,
  isObjectOrArray,
  mapObj,
  parseIfDate,
  processResponseBody,
  snakeify,
  snakeToCamel,
} from "./util";
import { describe, expect, it, test } from "vitest";

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

  it("parses dates if key starts with time_", () => {
    const value = parseIfDate("time_whatever", dateStr);
    expect(value).toBeInstanceOf(Date);
    expect(value.getTime()).toEqual(timestamp);
  });

  it("passes through values that fail to parse as dates", () => {
    const value = parseIfDate("time_whatever", "blah");
    expect(value).toEqual("blah");
  });
});

test("snakeify", () => {
  const obj = {
    id: "vpc-id",
    timeCreated: new Date(2021, 0, 1).toISOString(),
    timeModified: new Date(2021, 0, 2).toISOString(),
    systemRouterId: "router-id",
    nestedObj: {
      thereIsMore: 123,
      weAreSerious: "xyz",
    },
  };
  expect(snakeify(obj)).toEqual({
    id: "vpc-id",
    system_router_id: "router-id",
    time_created: "2021-01-01T05:00:00.000Z",
    time_modified: "2021-01-02T05:00:00.000Z",
    nested_obj: {
      there_is_more: 123,
      we_are_serious: "xyz",
    },
  });
});
