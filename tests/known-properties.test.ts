/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { test, describe, expect } from "vitest";
import { getSchemaTypes } from "./helpers/schema";

/**
 * This test is to help us understand what properties each type in our open API spec are being utilized.
 * If a new property is added but we're _not_ handling it in our generation, we may need to make an update.
 *
 * Review the failing snapshot and then check `zodSchema.ts`. If the new property should be handled, make
 * the necessary changes there.
 */
describe("Known properties", async () => {
  const types = await getSchemaTypes();
  const typeNames = Object.keys(types) as Array<keyof typeof types>;

  test.each(typeNames)(
    "Type %s should contain only known properties",
    (typeName) => {
      const properties = types[typeName]
        .flatMap((s) => Object.keys(s))
        .filter((k, index, arr) => arr.indexOf(k) === index)
        .sort((a, b) => a.localeCompare(b));
      expect(properties).toMatchSnapshot();
    }
  );
});
