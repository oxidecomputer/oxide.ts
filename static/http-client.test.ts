// @vitest-environment happy-dom

/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { handleResponse, mergeParams } from "./http-client";
import { describe, expect, it } from "vitest";

const headers = { "Content-Type": "application/json" };

const json = (body: any, status = 200) =>
  new Response(JSON.stringify(body), { status, headers });

describe("handleResponse", () => {
  it("handles success", async () => {
    const result = await handleResponse(json({ abc: 123 }));
    expect(result).toMatchObject({
      data: { abc: 123 },
      statusCode: 200,
      type: "success",
    });
    expect(result.headers.get("Content-Type")).toBe("application/json");
  });

  it('API error returns type "error"', async () => {
    const result = await handleResponse(json({ bad_stuff: "hi" }, 400));
    expect(result).toMatchObject({
      data: { badStuff: "hi" },
      statusCode: 400,
      type: "error",
    });
    expect(result.headers.get("Content-Type")).toBe("application/json");
  });

  it("non-json response causes client_error w/ text and error", async () => {
    const resp = new Response("not json", { headers });
    const result = await handleResponse(resp);
    expect(result).toMatchObject({
      error: new SyntaxError("Unexpected token o in JSON at position 1"),
      statusCode: 200,
      text: "not json",
      type: "client_error",
    });
    expect(result.headers.get("Content-Type")).toBe("application/json");
  });

  it("parses dates and converts to camel case", async () => {
    const resp = json({ time_created: "2022-05-01" });
    const result = await handleResponse(resp);
    expect(result).toMatchObject({
      type: "success",
      data: {
        timeCreated: new Date(Date.UTC(2022, 4, 1)),
      },
    });
    expect(result.headers.get("Content-Type")).toBe("application/json");
  });

  it("leaves unparseable dates alone", async () => {
    const resp = json({ time_created: "abc" });
    const result = await handleResponse(resp);
    expect(result).toMatchObject({
      type: "success",
      data: {
        timeCreated: "abc",
      },
    });
    expect(result.headers.get("Content-Type")).toBe("application/json");
  });
});

describe("mergeParams", () => {
  it("handles empty objects", () => {
    expect(mergeParams({}, {})).toEqual({ headers: new Headers() });
  });

  it("merges headers of different formats", () => {
    const obj = { headers: { a: "b" } };
    const headers = { headers: new Headers({ c: "d" }) };
    const tuples = { headers: [["e", "f"]] as HeadersInit };

    expect(mergeParams(obj, headers)).toEqual({
      headers: new Headers({ a: "b", c: "d" }),
    });
    expect(mergeParams(obj, tuples)).toEqual({
      headers: new Headers({ a: "b", e: "f" }),
    });
    expect(mergeParams(tuples, headers)).toEqual({
      headers: new Headers({ e: "f", c: "d" }),
    });
  });

  it("second arg takes precendence in case of overlap", () => {
    expect(
      mergeParams(
        { redirect: "follow", headers: { "Content-Type": "x" } },
        { redirect: "error", headers: { "Content-Type": "y" } }
      )
    ).toEqual({
      redirect: "error",
      headers: new Headers({ "Content-Type": "y" }),
    });
  });
});
