import { handleResponse } from "./http-client";
import { describe, expect, it } from "vitest";
import { Response } from "whatwg-fetch";

const headers = { "Content-Type": "application/json" };

const respHeaders = { headers: new Headers(headers) };

const json = (body: any, status = 200) =>
  new Response(JSON.stringify(body), { status, headers });

describe("handleResponse", () => {
  it("handles success", async () => {
    expect(await handleResponse(json({ abc: 123 }))).toMatchObject({
      data: { abc: 123 },
      statusCode: 200,
      type: "success",
      ...respHeaders,
    });
  });

  it('API error returns type "error"', async () => {
    expect(await handleResponse(json({ bad_stuff: "hi" }, 400))).toMatchObject({
      error: { badStuff: "hi" },
      statusCode: 400,
      type: "error",
      ...respHeaders,
    });
  });

  it("non-json response causes client_error w/ text and error", async () => {
    const resp = new Response("not json", { headers });
    expect(await handleResponse(resp)).toMatchObject({
      error: new SyntaxError("Unexpected token o in JSON at position 1"),
      statusCode: 200,
      text: "not json",
      type: "client_error",
      ...respHeaders,
    });
  });

  it("parses dates and converts to camel case", async () => {
    const resp = json({ time_created: "2022-05-01" });
    expect(await handleResponse(resp)).toMatchObject({
      type: "success",
      data: {
        timeCreated: new Date(Date.UTC(2022, 4, 1)),
      },
    });
  });

  it("leaves unparseable dates alone", async () => {
    const resp = json({ time_created: "abc" });
    expect(await handleResponse(resp)).toMatchObject({
      type: "success",
      data: {
        timeCreated: "abc",
      },
    });
  });
});
