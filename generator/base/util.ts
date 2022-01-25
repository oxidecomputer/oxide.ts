export const camelToSnake = (s: string) =>
  s.replace(/[A-Z]/g, (l) => "_" + l.toLowerCase());

export const snakeToCamel = (s: string) =>
  s.replace(/_./g, (l) => l[1].toUpperCase());

export const isObjectOrArray = (o: unknown) =>
  typeof o === "object" &&
  !(o instanceof Date) &&
  !(o instanceof RegExp) &&
  !(o instanceof Error) &&
  o !== null;

// recursively map (k, v) pairs using Object.entries
export const mapObj =
  (
    kf: (k: string, v: unknown) => string = (k, v) => k,
    vf: (k: string, v: unknown) => any = (k, v) => v,
  ) =>
  (o: unknown): unknown => {
    if (!isObjectOrArray(o)) return vf("", o);

    if (Array.isArray(o)) {
      return o.map(mapObj(kf, vf));
    }

    const obj = o as Record<string, unknown>;

    const newObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof key === "string") {
        const newKey = kf(key, value);
        const newValue = isObjectOrArray(value)
          ? mapObj(kf, vf)(value)
          : // don't call mapObj for the non-object case. if we did `mapObj(kf,
            // vf)(value)`, vf would not be called with `key` arg
            vf(key, value);
        newObj[newKey] = newValue;
      }
    }
    return newObj;
  };

export const parseIfDate = (k: string, v: any) => {
  if (typeof v === "string" && k.startsWith("time_")) {
    const d = new Date(v);
    if (isNaN(d.getTime())) return v;
    return d;
  }
  return v;
};

export const snakeify = mapObj(camelToSnake);

export const processResponseBody = mapObj(snakeToCamel, parseIfDate);
