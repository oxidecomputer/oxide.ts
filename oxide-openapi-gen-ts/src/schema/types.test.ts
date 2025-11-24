/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { test, expect } from "vitest";
import { schemaToTypes } from "./types";
import { TestWritable, initIO } from "../io";
import * as prettier from "prettier";

import spec from "../../spec.json";
import { type Schema } from "./base";

const schemas = spec.components.schemas;

function genType(schema: unknown) {
  const out = new TestWritable();
  const io = initIO(out);
  schemaToTypes(schema as Schema, io);
  return prettier
    .format(`type X = ${out.value()}`, {
      parser: "typescript",
    })
    .trim();
}

test("empty schema", () => {
  expect(genType({})).toMatchInlineSnapshot(
    `"type X = Record<string, unknown>;"`
  );
});

test("Disk", () => {
  expect(genType(schemas.Disk)).toMatchInlineSnapshot(`
    "type X = {
      blockSize: ByteCount;
      /** human-readable free-form text about a resource */
      description: string;
      devicePath: string;
      /** unique, immutable, system-controlled identifier for each resource */
      id: string;
      /** ID of image from which disk was created, if any */
      imageId?: string | null;
      /** unique, mutable, user-controlled identifier for each resource */
      name: Name;
      projectId: string;
      size: ByteCount;
      /** ID of snapshot from which disk was created, if any */
      snapshotId?: string | null;
      state: DiskState;
      /** timestamp when this resource was created */
      timeCreated: Date;
      /** timestamp when this resource was last modified */
      timeModified: Date;
    };"
  `);
});

test("Instance", () => {
  expect(genType(schemas.Instance)).toMatchInlineSnapshot(`
    "type X = {
      /** The time at which the auto-restart cooldown period for this instance completes, permitting it to be automatically restarted again. If the instance enters the \`Failed\` state, it will not be restarted until after this time.

    If this is not present, then either the instance has never been automatically restarted, or the cooldown period has already expired, allowing the instance to be restarted immediately if it fails. */
      autoRestartCooldownExpiration?: Date | null;
      /** \`true\` if this instance's auto-restart policy will permit the control plane to automatically restart it if it enters the \`Failed\` state. */
      autoRestartEnabled: boolean;
      /** The auto-restart policy configured for this instance, or \`null\` if no explicit policy has been configured.

    This policy determines whether the instance should be automatically restarted by the control plane on failure. If this is \`null\`, the control plane will use the default policy when determining whether or not to automatically restart this instance, which may or may not allow it to be restarted. The value of the \`auto_restart_enabled\` field indicates whether the instance will be auto-restarted, based on its current policy or the default if it has no configured policy. */
      autoRestartPolicy?: InstanceAutoRestartPolicy | null;
      /** the ID of the disk used to boot this Instance, if a specific one is assigned. */
      bootDiskId?: string | null;
      /** The CPU platform for this instance. If this is \`null\`, the instance requires no particular CPU platform. */
      cpuPlatform?: InstanceCpuPlatform | null;
      /** human-readable free-form text about a resource */
      description: string;
      /** RFC1035-compliant hostname for the Instance. */
      hostname: string;
      /** unique, immutable, system-controlled identifier for each resource */
      id: string;
      /** memory allocated for this Instance */
      memory: ByteCount;
      /** unique, mutable, user-controlled identifier for each resource */
      name: Name;
      /** number of CPUs allocated for this Instance */
      ncpus: InstanceCpuCount;
      /** id for the project containing this Instance */
      projectId: string;
      runState: InstanceState;
      /** timestamp when this resource was created */
      timeCreated: Date;
      /** The timestamp of the most recent time this instance was automatically restarted by the control plane.

    If this is not present, then this instance has not been automatically restarted. */
      timeLastAutoRestarted?: Date | null;
      /** timestamp when this resource was last modified */
      timeModified: Date;
      timeRunStateUpdated: Date;
    };"
  `);
});

test("number", () => {
  expect(
    genType({
      nullable: true,
      type: "integer",
      format: "uint32",
      minimum: 1,
    })
  ).toMatchInlineSnapshot(`"type X = number | null;"`);
});

test("string", () => {
  expect(
    genType({
      nullable: true,
      type: "string",
    })
  ).toMatchInlineSnapshot(`"type X = string | null;"`);
});

test("oneOf to string union (AddressLotKind)", () => {
  expect(genType(schemas.AddressLotKind)).toMatchInlineSnapshot(`
    "type X =
      /** Infrastructure address lots are used for network infrastructure like addresses assigned to rack switches. */
      | "infra"

      /** Pool address lots are used by IP pools. */
      | "pool";"
  `);
});

test("ResultsPage array (InternetGatewayResultsPage)", () => {
  expect(genType(schemas.InternetGatewayResultsPage)).toMatchInlineSnapshot(`
    "type X = {
      /** list of items on this page of results */
      items: InternetGateway[];
      /** token used to fetch the next page of results (if any) */
      nextPage?: string | null;
    };"
  `);
});

test("VpcRouterUpdate", () => {
  expect(genType(schemas.VpcRouterUpdate)).toMatchInlineSnapshot(
    `"type X = { description?: string | null; name?: Name | null };"`
  );
});

test("discriminated union (VpcFirewallRuleTarget)", () => {
  expect(genType(schemas.VpcFirewallRuleTarget)).toMatchInlineSnapshot(`
    "type X =
      /** The rule applies to all instances in the VPC */
      | { type: "vpc"; value: Name }
      /** The rule applies to all instances in the VPC Subnet */
      | { type: "subnet"; value: Name }
      /** The rule applies to this specific instance */
      | { type: "instance"; value: Name }
      /** The rule applies to a specific IP address */
      | { type: "ip"; value: string }
      /** The rule applies to a specific IP subnet */
      | { type: "ip_net"; value: IpNet };"
  `);
});

test("Array of nullable item (ValueArray)", () => {
  expect(genType(schemas.ValueArray)).toMatchInlineSnapshot(`
    "type X =
      | { type: "integer"; values: (number | null)[] }
      | { type: "double"; values: (number | null)[] }
      | { type: "boolean"; values: (boolean | null)[] }
      | { type: "string"; values: (string | null)[] }
      | { type: "integer_distribution"; values: (Distributionint64 | null)[] }
      | { type: "double_distribution"; values: (Distributiondouble | null)[] };"
  `);
});
