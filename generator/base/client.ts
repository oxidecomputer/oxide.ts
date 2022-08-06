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

export type ApiError = {
  type: "error";
  statusCode: number;
  // Note that this Error is not JS `Error` but rather an Error type generated
  // from the spec. The fact that it has the same name as the global Error type
  // is unfortunate. If the generated error type disappears, this will not fail
  // typechecking here, but any code that depends on this having a certain shape
  // will fail, so it's not that bad, though the error message may be confusing.
  error: Error;
};

export type ApiSuccess<Data extends unknown> = {
  type: "success";
  statusCode: number;
  data: Data;
};

export type ApiResult<Data extends unknown> = ApiSuccess<Data> | ApiError;

const encodeQueryParam = (key: string, value: any) =>
  `${encodeURIComponent(camelToSnake(key))}=${encodeURIComponent(value)}`;

const toQueryString = (rawQuery?: QueryParamsType): string =>
  Object.entries(rawQuery || {})
    .filter(([key, value]) => typeof value !== "undefined")
    .map(([key, value]) =>
      Array.isArray(value)
        ? value.map((item) => encodeQueryParam(key, item)).join("&")
        : encodeQueryParam(key, value),
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

    const statusCode = response.status;

    let result: ApiResult<Data>;
    try {
      // don't attempt to pull JSON out of a 204, it will fail
      const body =
        statusCode === 204
          ? void 0
          : processResponseBody(await response.json());
      if (response.ok) {
        // assume it matches the type
        return { type: "success", statusCode, data: body as Data };
      } else {
        return { type: "error", statusCode, error: body as Error };
      }
    } catch (e) {
      return {
        type: "error",
        statusCode,
        error: {
          name: "ClientError",
          message: e instanceof Error ? e.message : "",
        },
      };
    }
  };
}
