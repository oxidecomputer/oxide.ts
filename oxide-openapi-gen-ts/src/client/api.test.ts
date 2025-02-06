/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { describe, expect, it } from "vitest";
import { genTransformResponse } from "./api";

const projectSchema = {
  description: "View of a Project",
  type: "object",
  properties: {
    description: {
      description: "human-readable free-form text about a resource",
      type: "string",
    },
    id: {
      description:
        "unique, immutable, system-controlled identifier for each resource",
      type: "string",
      format: "uuid",
    },
    name: {
      description:
        "unique, mutable, user-controlled identifier for each resource",
      allOf: [Array],
    },
    time_created: {
      description: "timestamp when this resource was created",
      type: "string",
      format: "date-time",
    },
    time_modified: {
      description: "timestamp when this resource was last modified",
      type: "string",
      format: "date-time",
    },
  },
  required: ["description", "id", "name", "time_created", "time_modified"],
};

// TODO: add array and nested object properties
const noTransforms = {
  description: "View of a Project",
  type: "object",
  properties: {
    description: {
      description: "human-readable free-form text about a resource",
      type: "string",
    },
    id: {
      description:
        "unique, immutable, system-controlled identifier for each resource",
      type: "string",
      format: "uuid",
    },
    name: {
      description:
        "unique, mutable, user-controlled identifier for each resource",
      allOf: [Array],
    },
  },
  required: ["description", "id", "name"],
};

describe("generateTransformFunction", () => {
  it("handles timestamps at top level", () => {
    expect(genTransformResponse(projectSchema)).toMatchInlineSnapshot(`
      "(o) => {
      o.time_created = new Date(o.time_created)
      o.time_modified = new Date(o.time_modified)
      }"
    `);
  });

  it("returns null when there are no transforms to make", () => {
    expect(genTransformResponse(noTransforms)).toEqual(undefined);
  });
});
