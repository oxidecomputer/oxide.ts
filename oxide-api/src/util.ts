/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

export const camelToSnake = (s: string) =>
  s.replace(/[A-Z]/g, (l) => "_" + l.toLowerCase());

export const snakeToCamel = (s: string) =>
  s.replace(/_./g, (l) => l.slice(1).toUpperCase());

export const isObjectOrArray = (o: unknown) =>
  typeof o === "object" &&
  !(o instanceof Date) &&
  !(o instanceof RegExp) &&
  !(o instanceof Error) &&
  o !== null;

/**
 * Recursively map (k, v) pairs using Object.entries
 *
 * Note that value transform function takes both k and v so we can use the key
 * to decide whether to transform the value. Array elements inherit the key of
 * the array that holds them, so the scalars in `{ k: [a, [b]] }` are passed as
 * `(k, a)` and `(k, b)`. Scalars with no key (a top-level scalar, or the
 * elements of a top-level array) are left alone.
 *
 * @param kf maps key to key
 * @param vf maps key + value to value
 */
export const mapObj = (
  kf: (k: string) => string,
  vf: (k: string, v: unknown) => unknown = (_, v) => v,
) => {
  const mapValue = (k: string | undefined, v: unknown): unknown =>
    Array.isArray(v)
      ? v.map((elem) => mapValue(k, elem))
      : isObjectOrArray(v)
        ? mapEntries(v as Record<string, unknown>)
        : k === undefined
          ? v
          : vf(k, v);
  const mapEntries = (o: Record<string, unknown>) =>
    Object.fromEntries(
      Object.entries(o).map(([k, v]) => [kf(k), mapValue(k, v)]),
    );
  return (o: unknown): unknown => mapValue(undefined, o);
};

const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

/** Whether `v` is a string the response parser would try to turn into a `Date` */
export const isIsoDate = (v: unknown): v is string =>
  typeof v === "string" && isoDateRegex.test(v);

/**
 * Parse `v` into a `Date` if `k` is one of `dateKeys` and `v` looks like an
 * ISO timestamp. The key set comes from the OpenAPI spec, so the schema
 * vouches for the name, but we check the format anyway: the regex is cheap,
 * and it is the only protection when a `Record<string, unknown>` (or other
 * free-form object) has an arbitrary key that happens to equal a date key.
 *
 * A value that passes both checks but is not a real instant (e.g. a 13th
 * month) is a malformed server value: the type promises a `Date` and we can't
 * deliver one, so we throw rather than hand back a string. `handleResponse`
 * turns the throw into a `client_error` for the whole response.
 */
export const parseIfDate =
  (dateKeys: ReadonlySet<string>) => (k: string, v: unknown) => {
    if (dateKeys.has(k) && isIsoDate(v)) {
      const d = new Date(v);
      if (isNaN(d.getTime())) {
        throw new Error(`Invalid date-time for "${k}": ${JSON.stringify(v)}`);
      }
      return d;
    }
    return v;
  };

export const snakeify = mapObj(camelToSnake);

/**
 * Camel-case keys and parse values under `dateKeys` (snake-case names, as they
 * appear on the wire) into `Date`s.
 */
export const makeProcessResponseBody = (dateKeys: ReadonlySet<string>) =>
  mapObj(snakeToCamel, parseIfDate(dateKeys));

export function isNotNull<T>(value: T): value is NonNullable<T> {
  return value != null;
}

export const uniqueItems = [
  (arr: unknown[]) => new Set(arr).size === arr.length,
  { message: "Items must be unique" },
] as const;
