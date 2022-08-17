import { handleResponse } from "./http-client";
import { describe, expect, it } from "vitest";
import { Response } from "whatwg-fetch";

const respInit = {
  headers: { "Content-Type": "application/json" },
};

const respHeaders = {
  headers: new Headers({ "Content-Type": "application/json" }),
};

describe("handleResponse", () => {
  it("handles success", async () => {
    const resp = new Response(JSON.stringify({ abc: 123 }), respInit);
    expect(await handleResponse(resp)).toMatchObject({
      data: { abc: 123 },
      statusCode: 200,
      type: "success",
      ...respHeaders,
    });
  });

  it('API error returns type "error"', async () => {
    const resp = new Response(JSON.stringify({ bad_stuff: "hi" }), {
      status: 400,
      ...respInit,
    });
    expect(await handleResponse(resp)).toMatchObject({
      error: { badStuff: "hi" },
      statusCode: 400,
      type: "error",
      ...respHeaders,
    });
  });

  it("non-json response causes client_error w/ text and error", async () => {
    const resp = new Response("not json", respInit);
    expect(await handleResponse(resp)).toMatchObject({
      error: new SyntaxError("Unexpected token o in JSON at position 1"),
      statusCode: 200,
      text: "not json",
      type: "client_error",
      ...respHeaders,
    });
  });

  it("parses dates and converts to camel case", async () => {
    const resp = new Response(
      JSON.stringify({ time_created: "2022-05-01" }),
      respInit
    );
    expect(await handleResponse(resp)).toMatchObject({
      type: "success",
      data: {
        timeCreated: new Date(Date.UTC(2022, 4, 1)),
      },
    });
  });

  it("leaves unparseable dates alone", async () => {
    const resp = new Response(
      JSON.stringify({ time_created: "abc" }),
      respInit
    );
    expect(await handleResponse(resp)).toMatchObject({
      type: "success",
      data: {
        timeCreated: "abc",
      },
    });
  });
});
