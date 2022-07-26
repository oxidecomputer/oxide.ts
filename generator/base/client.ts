// credit where due: this is a stripped-down version of the fetch client from
// https://github.com/acacode/swagger-typescript-api

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** request path */
  path: string;
  /** query params */
  query?: QueryParamsType;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "signal">;
  customFetch?: typeof fetch;
}

export type ErrorResponse = Response & {
  data: null;
  // Note that this Error is not JS `Error` but rather an Error type generated
  // from the spec. The fact that it has the same name as the global Error type
  // is unfortunate. If the generated error type disappears, this will not fail
  // typechecking here, but any code that depends on this having a certain shape
  // will fail, so it's not that bad, though the error message may be confusing.
  error: Error;
};

export type SuccessResponse<Data extends unknown> = Response & {
  data: Data;
  error: null;
};

export type ApiResponse<Data extends unknown> =
  | SuccessResponse<Data>
  | ErrorResponse;

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
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

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
  }: FullRequestParams): Promise<ApiResponse<Data>> => {
    const requestParams = this.mergeRequestParams(params);
    const queryString = query && toQueryString(query);

    let url = baseUrl || this.baseUrl || "";
    url += path;
    if (queryString) {
      url += "?" + queryString;
    }

    const response = await this.customFetch(url, {
      ...requestParams,
      headers: {
        "Content-Type": "application/json",
        ...requestParams.headers,
      },
      body: JSON.stringify(snakeify(body)),
    });

    const r = response as ApiResponse<Data>;
    r.data = null as unknown as Data;
    r.error = null as unknown as Error;

    try {
      const data = processResponseBody(await response.json());
      if (r.ok) {
        r.data = data as Data;
      } else {
        r.error = data as Error;
      }
    } catch (e) {
      r.error = e as Error;
    }

    if (!r.ok) throw r;
    return r;
  };
}
