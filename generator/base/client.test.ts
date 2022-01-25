import {
  camelToSnake,
  isObjectOrArray,
  mapObj,
  parseIfDate,
  processResponseBody,
  snakeToCamel,
} from "./client";
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
  const fn = mapObj((k, v) => [k + "_", (v as number) * 2]);

  it("passes through non-objects or arrays", () => {
    expect(fn("x")).toEqual("x");
    expect(fn(5)).toEqual(5);
  });

  it("maps over objects and arrays", () => {
    expect(fn({ x: 5, y: { z: 3 } })).toEqual({ x_: 10, y_: { z_: 6 } });
    expect(fn([{ x: 5 }, { y: 3 }])).toEqual([{ x_: 10 }, { y_: 6 }]);
  });
});

test("processResponseBody", () => {
  expect(processResponseBody({})).toEqual({});

  const date = new Date();
  const dateStr = date.toString();
  const parsedDate = new Date(dateStr);
  const resp = {
    id: "big-uuid",
    another_prop: "abc",
    time_created: dateStr,
  };
  expect(processResponseBody(resp)).toEqual({
    id: "big-uuid",
    anotherProp: "abc",
    timeCreated: parsedDate,
  });
});

describe("parseIfDate", () => {
  it("passes through non-date values", () => {
    expect(parseIfDate("abc", 123)).toEqual(123);
    expect(parseIfDate("abc", "def")).toEqual("def");
  });

  const dateStr = new Date().toISOString();

  it("doesn't parse dates if key doesn't start with time_", () => {
    expect(parseIfDate("abc", dateStr)).toEqual(dateStr);
  });

  it("parses dates if key starts with time_", () => {
    const value = parseIfDate("time_whatever", dateStr);
    expect(value).toBeInstanceOf(Date);
    expect(value.getTime()).not.toBeNaN();
  });

  it("passes through values that fail to parse as dates", () => {
    const value = parseIfDate("time_whatever", "blah");
    expect(value).toEqual("blah");
  });
});
