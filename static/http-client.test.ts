// @vitest-environment happy-dom

import { handleResponse } from "./http-client";
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
      error: { badStuff: "hi" },
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
