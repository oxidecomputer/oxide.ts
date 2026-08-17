/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { handleResponseWithMapper, mergeParams } from "./http-client";
import { describe, expect, it } from "vitest";

const headers = { "Content-Type": "application/json" };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const json = (body: any, status = 200) =>
  new Response(JSON.stringify(body), { status, headers });

describe("handleResponse", () => {
  it("handles success", async () => {
    const { response, ...rest } = await handleResponseWithMapper((_, a) => a)(
      json({ abc: 123 }),
    );
    expect(rest).toMatchObject({
      data: { abc: 123 },
      type: "success",
    });
    expect(response.status).toEqual(200);
    expect(response.headers.get("Content-Type")).toBe("application/json");
  });

  it('API error returns type "error"', async () => {
    const { response, ...rest } = await handleResponseWithMapper((_, a) => a)(
      json({ bad_stuff: "hi" }, 400),
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
    const { response, ...rest } = await handleResponseWithMapper((_, a) => a)(
      resp,
    );
    expect(rest).toMatchObject({
      error: expect.any(SyntaxError),
      text: "not json",
      type: "client_error",
    });
    expect(response.status).toEqual(200);
    expect(response.headers.get("Content-Type")).toBe("application/json");
  });

  it("applies the given mapper", async () => {
    const resp = json({ time_created: "2022-05-01T02:03:04Z" });
    const { response, ...rest } = await handleResponseWithMapper(() => 1)(resp);
    expect(rest).toMatchObject({
      type: "success",
      data: {
        timeCreated: 1,
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
        { redirect: "error", headers: { "Content-Type": "y" } },
      ),
    ).toEqual({
      redirect: "error",
      headers: new Headers({ "Content-Type": "y" }),
    });
  });
});
