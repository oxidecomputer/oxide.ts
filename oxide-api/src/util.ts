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
  s.replace(/_./g, (l) => l[1]!.toUpperCase());

export const isObjectOrArray = (o: unknown) =>
  typeof o === "object" &&
  !(o instanceof Date) &&
  !(o instanceof RegExp) &&
  !(o instanceof Error) &&
  o !== null;

export type ValueMapper = (k: string | undefined, v: unknown) => unknown;

/**
 * Recursively map (k, v) pairs using Object.entries. Recursion happens after
 * mapping, so objects and arrays may themselves be mapped.
 *
 * Note that value transform function takes both k and v so we can use the key
 * to decide whether to transform the value.
 *
 * @param kf maps key to key
 * @param vf maps key + value to value
 */
export const mapObj =
  (kf: (k: string) => string, vf: ValueMapper = (_, v) => v) =>
  (o: unknown): unknown => {
    if (!isObjectOrArray(o)) return o;

    if (Array.isArray(o)) return o.map(mapObj(kf, vf));

    const newObj: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(o as Record<string, unknown>)) {
      const mapped = vf(k, v);
      newObj[kf(k)] = isObjectOrArray(mapped) ? mapObj(kf, vf)(mapped) : mapped;
    }
    return newObj;
  };

const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

/**
 * Parse an ISO date string to a Date, or return unchanged.
 */
const parseDate = (v: unknown) => {
  if (typeof v !== "string" || !isoDateRegex.test(v)) return v;
  const d = new Date(v);
  return isNaN(d.getTime()) ? v : d;
};

/**
 * Build a date parser sensitive only to the keys provided.
 */
export const makeParseIfDate =
  (dateProps: Set<string>, dateArrayProps: Set<string>): ValueMapper =>
  (k, v) => {
    if (k === undefined) return v;
    if (Array.isArray(v)) return dateArrayProps.has(k) ? v.map(parseDate) : v;
    if (dateProps.has(k)) return parseDate(v);
    return v;
  };

export const snakeify = mapObj(camelToSnake);

export function isNotNull<T>(value: T): value is NonNullable<T> {
  return value != null;
}

export const uniqueItems = [
  (arr: unknown[]) => new Set(arr).size === arr.length,
  { message: "Items must be unique" },
] as const;
