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
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  customFetch?: typeof fetch;
}

export type ErrorResponse = Response & {
  data: null;
  error: Error;
};

export type SuccessResponse<Data extends unknown> = Response & {
  data: Data;
  error: null;
};

export type ApiResponse<Data extends unknown> =
  | SuccessResponse<Data>
  | ErrorResponse;

type CancelToken = Symbol | string | number;

const encodeQueryParam = (key: string, value: any) =>
  `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;

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
  private abortControllers = new Map<CancelToken, AbortController>();
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

  private createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <Data extends unknown>({
    body,
    path,
    query,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<ApiResponse<Data>> => {
    const requestParams = this.mergeRequestParams(params);
    const queryString = query && toQueryString(query);

    let url = baseUrl || this.baseUrl || "";
    url += path;
    if (queryString) {
      url += "?" + queryString;
    }

    return this.customFetch(url, {
      ...requestParams,
      headers: {
        "Content-Type": "application/json",
        ...requestParams.headers,
      },
      signal: cancelToken ? this.createAbortSignal(cancelToken) : void 0,
      body: JSON.stringify(snakeify(body)),
    }).then(async (response) => {
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

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!r.ok) throw r;
      return r;
    });
  };
}
