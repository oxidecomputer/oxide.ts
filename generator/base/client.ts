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

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

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

const camelToSnake = (s: string) =>
  s.replace(/[A-Z]/g, (l) => "_" + l.toLowerCase());

const snakeToCamel = (s: string) => s.replace(/_./g, (l) => l[1].toUpperCase());

const isObjectOrArray = (o: unknown) =>
  typeof o === "object" &&
  !(o instanceof Date) &&
  !(o instanceof RegExp) &&
  !(o instanceof Error) &&
  o !== null;

const identity = (x: any) => x;

// recursively map (k, v) pairs using Object.entries
const mapObj =
  (fn: (k: string, v: unknown) => [string, any] = identity) =>
  (o: unknown): unknown => {
    if (!isObjectOrArray(o)) return o;

    if (Array.isArray(o)) {
      return o.map(mapObj(fn));
    }

    const obj = o as Record<string, unknown>;

    const newObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof key === "string") {
        const [newKey, newValue] = fn(
          key,
          mapObj(fn)(value as Record<string, unknown>),
        );
        newObj[newKey] = newValue;
      }
    }
    return newObj;
  };

const parseDates = (k: string, v: any) => {
  if (typeof v === "string" && k.startsWith("time_")) {
    const d = new Date(v);
    if (isNaN(d.getTime())) return v;
    return d;
  }
  return v;
};

const snakeify = mapObj((k, v) => [camelToSnake(k), v]);

const processResponseBody = mapObj((k, v) => [
  snakeToCamel(k),
  parseDates(k, v),
]);

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

  public request = async <T = any, E = any>({
    body,
    path,
    query,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
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
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      await response
        .json()
        .then(processResponseBody)
        .then((data) => {
          if (r.ok) {
            r.data = data as T;
          } else {
            r.error = data as E;
          }
        })
        .catch((e) => {
          r.error = e;
        });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!r.ok) throw r;
      return r;
    });
  };
}
