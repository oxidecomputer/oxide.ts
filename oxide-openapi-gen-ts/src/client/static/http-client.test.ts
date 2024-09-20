// @vitest-environment happy-dom

/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { fetchWithRetry, handleResponse, mergeParams } from "./http-client";
import { describe, expect, it } from "vitest";

const headers = { "Content-Type": "application/json" };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const json = (body: any, status = 200) =>
  new Response(JSON.stringify(body), { status, headers });

describe("fetchWithRetry", () => {
  it("retries request when handler returns true", async () => {
    const retryLimit = 1
    let retries = 0
    const retryHandler = () => {
      if (retries >= retryLimit) {
        return false
      } else {
        retries += 1
        return true
      }
    }

    try {
      await fetchWithRetry(() => { throw new Error("unimplemented") }, "empty_url", {}, retryHandler)
    } catch {
      // Throw away any errors we receive, we are only interested in ensuring the retry handler
      // gets called and that retries terminate
    }

    expect(retries).toEqual(1)
  });

  it("rethrows error when handler returns false", async () => {
    const retryHandler = () => false

    try {
      await fetchWithRetry(() => { throw new Error("unimplemented") }, "empty_url", {}, retryHandler)
      throw new Error("Unreachable. This is a bug")
    } catch (err: any) {
      expect(err.message).toEqual("unimplemented")
    }
  });
});

describe("handleResponse", () => {
  it("handles success", async () => {
    const { response, ...rest } = await handleResponse(json({ abc: 123 }));
    expect(rest).toMatchObject({
      data: { abc: 123 },
      type: "success",
    });
    expect(response.status).toEqual(200);
    expect(response.headers.get("Content-Type")).toBe("application/json");
  });

  it('API error returns type "error"', async () => {
    const { response, ...rest } = await handleResponse(
      json({ bad_stuff: "hi" }, 400)
    );
    expect(rest).toMatchObject({
      data: { badStuff: "hi" },
      type: "error",
    });
    expect(response.status).toEqual(400);
    expect(response.headers.get("Content-Type")).toBe("application/json");
  });

  it("non-json response causes client_error w/ text and error", async () => {
    const resp = new Response("not json", { headers });
    const { response, ...rest } = await handleResponse(resp);
    expect(rest).toMatchObject({
      error: expect.any(SyntaxError),
      text: "not json",
      type: "client_error",
    });
    expect(response.status).toEqual(200);
    expect(response.headers.get("Content-Type")).toBe("application/json");
  });

  it("parses dates and converts to camel case", async () => {
    const resp = json({ time_created: "2022-05-01" });
    const { response, ...rest } = await handleResponse(resp);
    expect(rest).toMatchObject({
      type: "success",
      data: {
        timeCreated: new Date(Date.UTC(2022, 4, 1)),
      },
    });
    expect(response.headers.get("Content-Type")).toBe("application/json");
  });

  it("leaves unparseable dates alone", async () => {
    const resp = json({ time_created: "abc" });
    const { response, ...rest } = await handleResponse(resp);
    expect(rest).toMatchObject({
      type: "success",
      data: {
        timeCreated: "abc",
      },
    });
    expect(response.headers.get("Content-Type")).toBe("application/json");
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
