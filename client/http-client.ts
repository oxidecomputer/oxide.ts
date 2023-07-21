/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { camelToSnake, processResponseBody, snakeify, isNotNull } from "./util";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueryParamsType = Record<string, any>;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  path: string;
  query?: QueryParamsType;
  body?: unknown;
  host?: string;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

type BaseApiParams = Omit<RequestParams, "host" | "signal">;

export interface ApiConfig {
  host?: string;
  /**
   * API token. Easiest way to get one is to auth with the CLI with `oxide auth
   * login` and then print the token with `oxide auth status --show-token`. Web
   * console uses a session cookie, so it does not need this.
   */
  token?: string;
  baseApiParams?: BaseApiParams;
}

/** Success responses from the API */
export type ApiSuccess<Data> = {
  type: "success";
  statusCode: number;
  headers: Headers;
  data: Data;
};

// HACK: this has to match what comes from the API in the `Error` schema. We put
// our own copy here so we can test this file statically without generating
// anything
export type ErrorBody = {
  errorCode?: string | null;
  message: string;
  requestId: string;
};

export type ErrorResult =
  // 4xx and 5xx responses from the API
  | {
      type: "error";
      statusCode: number;
      headers: Headers;
      data: ErrorBody;
    }
  // JSON parsing or processing errors within the client. Includes raised Error
  // and response body as a string for debugging.
  | {
      type: "client_error";
      error: Error;
      statusCode: number;
      headers: Headers;
      text: string;
    };

export type ApiResult<Data> = ApiSuccess<Data> | ErrorResult;

/**
 * Convert `Date` to ISO string. Leave other values alone. Used for both request
 * body and query params.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function replacer(_key: string, value: any) {
  if (value instanceof Date) {
    return value.toISOString();
  }
  return value;
}

function encodeQueryParam(key: string, value: unknown) {
  return `${encodeURIComponent(camelToSnake(key))}=${encodeURIComponent(
    replacer(key, value)
  )}`;
}

/** Query params with null values filtered out. `"?"` included. */
export function toQueryString(rawQuery?: QueryParamsType): string {
  const qs = Object.entries(rawQuery || {})
    .filter(([_key, value]) => isNotNull(value))
    .map(([key, value]) =>
      Array.isArray(value)
        ? value.map((item) => encodeQueryParam(key, item)).join("&")
        : encodeQueryParam(key, value)
    )
    .join("&");
  return qs ? "?" + qs : "";
}

export async function handleResponse<Data>(
  response: Response
): Promise<ApiResult<Data>> {
  const common = { statusCode: response.status, headers: response.headers };

  const respText = await response.text();

  // catch JSON parse or processing errors
  let respJson;
  try {
    // don't bother trying to parse empty responses like 204s
    // TODO: is empty object what we want here?
    respJson =
      respText.length > 0 ? processResponseBody(JSON.parse(respText)) : {};
  } catch (e) {
    return {
      type: "client_error",
      error: e as Error,
      text: respText,
      ...common,
    };
  }

  if (!response.ok) {
    return {
      type: "error",
      data: respJson as ErrorBody,
      ...common,
    };
  }

  // don't validate respJson, just assume it matches the type
  return {
    type: "success",
    data: respJson as Data,
    ...common,
  };
}

export class HttpClient {
  public host?: string;
  public token?: string;
  private baseApiParams: BaseApiParams = {
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor({ host, token, baseApiParams }: ApiConfig = {}) {
    this.host = host;
    this.token = token;
    this.baseApiParams = baseApiParams || this.baseApiParams;
  }

  private mergeRequestParams(params: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params,
      headers: {
        ...this.baseApiParams.headers,
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        ...params.headers,
      },
    };
  }

  public request = async <Data>({
    body,
    path,
    query,
    host,
    ...params
  }: FullRequestParams): Promise<ApiResult<Data>> => {
    const url = (host || this.host || "") + path + toQueryString(query);

    const response = await fetch(url, {
      ...this.mergeRequestParams(params),
      body: JSON.stringify(snakeify(body), replacer),
    });

    return handleResponse(response);
  };
}
