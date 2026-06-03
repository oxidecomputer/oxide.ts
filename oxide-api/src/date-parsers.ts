/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

/* eslint-disable */

/**
 * Date parsing for API responses. Each exported function takes a (camelized)
 * response value and converts its `date-time` fields to `Date` in place,
 * recursing into nested objects and arrays. Generated from `format: date-time`
 * in the OpenAPI schema and deduplicated by body, so types with the same date
 * shape share one function. `Api.ts` passes the right one as `parseResponse`.
 */

const D = (v: any) => {
  if (typeof v !== "string") return v;
  const d = new Date(v);
  return isNaN(d.getTime()) ? v : d;
};

const A = (v: any, f: (x: any) => any) => (Array.isArray(v) ? v.map(f) : v);

// 45 types: AddressLot, AffinityGroup, AllowList, AntiAffinityGroup, +41 more
export const n0 = (o: any) => {
  if (!o) return o;
  if (o.timeCreated != null) o.timeCreated = D(o.timeCreated);
  if (o.timeModified != null) o.timeModified = D(o.timeModified);
  return o;
};

// 2 types: AddressLotCreateResponse, AddressLotViewResponse
export const n1 = (o: any) => {
  if (!o) return o;
  if (o.lot != null) o.lot = n0(o.lot);
  return o;
};

// 38 types: AddressLotResultsPage, AffinityGroupResultsPage, AntiAffinityGroupResultsPage, BgpConfigResultsPage, +34 more
export const n2 = (o: any) => {
  if (!o) return o;
  if (o.items != null) o.items = A(o.items, n0);
  return o;
};

// 1 type: WebhookDeliveryAttempt
export const n3 = (o: any) => {
  if (!o) return o;
  if (o.timeSent != null) o.timeSent = D(o.timeSent);
  return o;
};

// 1 type: AlertDeliveryAttempts
export const n4 = (o: any) => {
  if (!o) return o;
  if (o.webhook != null) o.webhook = A(o.webhook, n3);
  return o;
};

// 1 type: AlertDelivery
export const n5 = (o: any) => {
  if (!o) return o;
  if (o.attempts != null) o.attempts = n4(o.attempts);
  if (o.timeStarted != null) o.timeStarted = D(o.timeStarted);
  return o;
};

// 1 type: AlertDeliveryResultsPage
export const n6 = (o: any) => {
  if (!o) return o;
  if (o.items != null) o.items = A(o.items, n5);
  return o;
};

// 1 type: AlertProbeResult
export const n7 = (o: any) => {
  if (!o) return o;
  if (o.probe != null) o.probe = n5(o.probe);
  return o;
};

// 6 types: WebhookSecret, IpPoolRange, SubnetPoolMember, SupportBundleInfo, +2 more
export const n8 = (o: any) => {
  if (!o) return o;
  if (o.timeCreated != null) o.timeCreated = D(o.timeCreated);
  return o;
};

// 2 types: AlertReceiverKind, WebhookSecrets
export const n9 = (o: any) => {
  if (!o) return o;
  if (o.secrets != null) o.secrets = A(o.secrets, n8);
  return o;
};

// 1 type: AlertReceiver
export const n10 = (o: any) => {
  if (!o) return o;
  if (o.kind != null) o.kind = n9(o.kind);
  if (o.timeCreated != null) o.timeCreated = D(o.timeCreated);
  if (o.timeModified != null) o.timeModified = D(o.timeModified);
  return o;
};

// 1 type: AlertReceiverResultsPage
export const n11 = (o: any) => {
  if (!o) return o;
  if (o.items != null) o.items = A(o.items, n10);
  return o;
};

// 1 type: AuditLogEntry
export const n12 = (o: any) => {
  if (!o) return o;
  if (o.timeCompleted != null) o.timeCompleted = D(o.timeCompleted);
  if (o.timeStarted != null) o.timeStarted = D(o.timeStarted);
  return o;
};

// 1 type: AuditLogEntryResultsPage
export const n13 = (o: any) => {
  if (!o) return o;
  if (o.items != null) o.items = A(o.items, n12);
  return o;
};

// 1 type: ConsoleSession
export const n14 = (o: any) => {
  if (!o) return o;
  if (o.timeCreated != null) o.timeCreated = D(o.timeCreated);
  if (o.timeLastUsed != null) o.timeLastUsed = D(o.timeLastUsed);
  return o;
};

// 1 type: ConsoleSessionResultsPage
export const n15 = (o: any) => {
  if (!o) return o;
  if (o.items != null) o.items = A(o.items, n14);
  return o;
};

// 15 types: Cumulativedouble, Cumulativefloat, Cumulativeint64, Cumulativeuint64, +11 more
export const n16 = (o: any) => {
  if (!o) return o;
  if (o.startTime != null) o.startTime = D(o.startTime);
  return o;
};

// 1 type: Datum
export const n17 = (o: any) => {
  if (!o) return o;
  if (o.datum != null) o.datum = n16(o.datum);
  return o;
};

// 3 types: DeviceAccessToken, ScimClientBearerToken, ScimClientBearerTokenValue
export const n18 = (o: any) => {
  if (!o) return o;
  if (o.timeCreated != null) o.timeCreated = D(o.timeCreated);
  if (o.timeExpires != null) o.timeExpires = D(o.timeExpires);
  return o;
};

// 1 type: DeviceAccessTokenResultsPage
export const n19 = (o: any) => {
  if (!o) return o;
  if (o.items != null) o.items = A(o.items, n18);
  return o;
};

// 1 type: Instance
export const n20 = (o: any) => {
  if (!o) return o;
  if (o.autoRestartCooldownExpiration != null)
    o.autoRestartCooldownExpiration = D(o.autoRestartCooldownExpiration);
  if (o.timeCreated != null) o.timeCreated = D(o.timeCreated);
  if (o.timeLastAutoRestarted != null)
    o.timeLastAutoRestarted = D(o.timeLastAutoRestarted);
  if (o.timeModified != null) o.timeModified = D(o.timeModified);
  if (o.timeRunStateUpdated != null)
    o.timeRunStateUpdated = D(o.timeRunStateUpdated);
  return o;
};

// 1 type: InstanceResultsPage
export const n21 = (o: any) => {
  if (!o) return o;
  if (o.items != null) o.items = A(o.items, n20);
  return o;
};

// 5 types: IpPoolRangeResultsPage, SubnetPoolMemberResultsPage, SupportBundleInfoResultsPage, TufRepoResultsPage, +1 more
export const n22 = (o: any) => {
  if (!o) return o;
  if (o.items != null) o.items = A(o.items, n8);
  return o;
};

// 1 type: LldpNeighbor
export const n23 = (o: any) => {
  if (!o) return o;
  if (o.firstSeen != null) o.firstSeen = D(o.firstSeen);
  if (o.lastSeen != null) o.lastSeen = D(o.lastSeen);
  return o;
};

// 1 type: LldpNeighborResultsPage
export const n24 = (o: any) => {
  if (!o) return o;
  if (o.items != null) o.items = A(o.items, n23);
  return o;
};

// 1 type: Measurement
export const n25 = (o: any) => {
  if (!o) return o;
  if (o.datum != null) o.datum = n17(o.datum);
  if (o.timestamp != null) o.timestamp = D(o.timestamp);
  return o;
};

// 1 type: MeasurementResultsPage
export const n26 = (o: any) => {
  if (!o) return o;
  if (o.items != null) o.items = A(o.items, n25);
  return o;
};

// 1 type: Points
export const n27 = (o: any) => {
  if (!o) return o;
  if (o.startTimes != null) o.startTimes = A(o.startTimes, D);
  if (o.timestamps != null) o.timestamps = A(o.timestamps, D);
  return o;
};

// 1 type: Timeseries
export const n28 = (o: any) => {
  if (!o) return o;
  if (o.points != null) o.points = n27(o.points);
  return o;
};

// 1 type: OxqlTable
export const n29 = (o: any) => {
  if (!o) return o;
  if (o.timeseries != null) o.timeseries = A(o.timeseries, n28);
  return o;
};

// 1 type: OxqlQueryResult
export const n30 = (o: any) => {
  if (!o) return o;
  if (o.tables != null) o.tables = A(o.tables, n29);
  return o;
};

// 1 type: RackMembershipStatus
export const n31 = (o: any) => {
  if (!o) return o;
  if (o.timeAborted != null) o.timeAborted = D(o.timeAborted);
  if (o.timeCommitted != null) o.timeCommitted = D(o.timeCommitted);
  if (o.timeCreated != null) o.timeCreated = D(o.timeCreated);
  return o;
};

// 1 type: TargetRelease
export const n32 = (o: any) => {
  if (!o) return o;
  if (o.timeRequested != null) o.timeRequested = D(o.timeRequested);
  return o;
};

// 1 type: TimeseriesSchema
export const n33 = (o: any) => {
  if (!o) return o;
  if (o.created != null) o.created = D(o.created);
  return o;
};

// 1 type: TimeseriesSchemaResultsPage
export const n34 = (o: any) => {
  if (!o) return o;
  if (o.items != null) o.items = A(o.items, n33);
  return o;
};

// 1 type: TufRepoUpload
export const n35 = (o: any) => {
  if (!o) return o;
  if (o.repo != null) o.repo = n8(o.repo);
  return o;
};

// 1 type: UpdateStatus
export const n36 = (o: any) => {
  if (!o) return o;
  if (o.targetRelease != null) o.targetRelease = n32(o.targetRelease);
  if (o.timeLastStepPlanned != null)
    o.timeLastStepPlanned = D(o.timeLastStepPlanned);
  return o;
};

// 1 type: VpcFirewallRules
export const n37 = (o: any) => {
  if (!o) return o;
  if (o.rules != null) o.rules = A(o.rules, n0);
  return o;
};

// 1 type: WebhookReceiver
export const n38 = (o: any) => {
  if (!o) return o;
  if (o.secrets != null) o.secrets = A(o.secrets, n8);
  if (o.timeCreated != null) o.timeCreated = D(o.timeCreated);
  if (o.timeModified != null) o.timeModified = D(o.timeModified);
  return o;
};

// 1 type: BgpAnnounceSet[]
export const n39 = (o: any) => A(o, n0);

// 1 type: ScimClientBearerToken[]
export const n40 = (o: any) => A(o, n18);
