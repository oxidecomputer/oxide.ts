// credit where due: this is a stripped-down version of the fetch client from
// https://github.com/acacode/swagger-typescript-api

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  path: string;
  query?: QueryParamsType;
  body?: unknown;
  baseUrl?: string;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "signal">;
}

/** Success responses from the API */
export type ApiSuccess<Data extends unknown> = {
  type: "success";
  statusCode: number;
  headers: Headers;
  data: Data;
};

/** 4xx and 5xx responses from the API */
export type ApiError = {
  type: "error";
  statusCode: number;
  headers: Headers;
  error: ErrorBody;
};

/**
 * JSON parsing or processing errors within the client. Includes raised Error
 * and response body as a string for debugging.
 */
export type ClientError = {
  type: "client_error";
  error: Error;
  statusCode: number;
  headers: Headers;
  text: string;
};

export type ErrorResult = ApiError | ClientError;

export type ApiResult<Data extends unknown> = ApiSuccess<Data> | ErrorResult;

const encodeQueryParam = (key: string, value: any) =>
  `${encodeURIComponent(camelToSnake(key))}=${encodeURIComponent(value)}`;

const toQueryString = (rawQuery?: QueryParamsType): string =>
  Object.entries(rawQuery || {})
    .filter(([key, value]) => typeof value !== "undefined")
    .map(([key, value]) =>
      Array.isArray(value)
        ? value.map((item) => encodeQueryParam(key, item)).join("&")
        : encodeQueryParam(key, value)
    )
    .join("&");

export class HttpClient {
  public baseUrl: string = "";

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig = {}) {
    Object.assign(this, apiConfig);
  }

  private mergeRequestParams(params: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params,
      headers: {
        ...this.baseApiParams.headers,
        ...params.headers,
      },
    };
  }

  public request = async <Data extends unknown>({
    body,
    path,
    query,
    baseUrl,
    ...params
  }: FullRequestParams): Promise<ApiResult<Data>> => {
    const requestParams = this.mergeRequestParams(params);
    const queryString = query && toQueryString(query);

    let url = baseUrl || this.baseUrl || "";
    url += path;
    if (queryString) {
      url += "?" + queryString;
    }

    const response = await fetch(url, {
      ...requestParams,
      headers: {
        "Content-Type": "application/json",
        ...requestParams.headers,
      },
      body: JSON.stringify(snakeify(body)),
    });

    const common = { statusCode: response.status, headers: response.headers };

    const respText = await response.text();

    // catch JSON parse or processing errors
    let respJson = undefined;
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
        error: respJson as ErrorBody,
        ...common,
      };
    }

    // don't validate respJson, just assume it matches the type
    return {
      type: "success",
      data: respJson as Data,
      ...common,
    };
  };
}
