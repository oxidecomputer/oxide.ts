/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { assert, type Equals } from "tsafe";
import { test } from "vitest";
import type { ApiSuccess, DeepReadonly, ErrorResult } from "./http-client";

// These are type-level assertions verified by `npm run tsc`; at runtime the
// `assert` calls are no-ops. Wrapped in a `test` so vitest doesn't complain the
// file has no tests.
test("DeepReadonly", () => {
  // primitives pass through untouched
  assert<Equals<DeepReadonly<string>, string>>();
  assert<Equals<DeepReadonly<number>, number>>();
  assert<Equals<DeepReadonly<null>, null>>();

  // Date is left intact rather than mapped into a readonly object
  assert<Equals<DeepReadonly<Date>, Date>>();

  // arrays become ReadonlyArray, recursively
  assert<Equals<DeepReadonly<number[]>, ReadonlyArray<number>>>();
  assert<
    Equals<DeepReadonly<{ a: number }[]>, ReadonlyArray<{ readonly a: number }>>
  >();

  // objects get readonly keys, recursively, and Date/arrays inside are handled
  type In = { a: number; nested: { b: string }; list: number[]; when: Date };
  type Out = {
    readonly a: number;
    readonly nested: { readonly b: string };
    readonly list: ReadonlyArray<number>;
    readonly when: Date;
  };
  assert<Equals<DeepReadonly<In>, Out>>();
});

test("ApiSuccess.data is deeply readonly", () => {
  const reject = (r: ApiSuccess<{ a: number; list: number[] }>) => {
    // @ts-expect-error top-level prop is readonly
    r.data.a = 1;
    // @ts-expect-error nested array is a ReadonlyArray
    r.data.list.push(2);
  };
  void reject;
});

test("error response payload is deeply readonly", () => {
  const reject = (r: Extract<ErrorResult, { type: "error" }>) => {
    // @ts-expect-error ErrorBody payload is deeply readonly
    r.data.message = "x";
  };
  void reject;
});

test("client_error bindings are readonly", () => {
  const reject = (r: Extract<ErrorResult, { type: "client_error" }>) => {
    // @ts-expect-error binding is readonly
    r.text = "x";
    // @ts-expect-error binding is readonly
    r.error = new Error();
  };
  void reject;
});
