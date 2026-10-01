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
  if (isNaN(d.getTime())) throw new Error(`Expected a valid date string, instead received "${v}"`);
  return d;
};

const A = (v: any, f: (x: any) => any) => (Array.isArray(v) ? v.map(f) : v);

export const n0 = (o: any) => {
  if (!o) return o;
  if (o["timeCreated"] != null) o["timeCreated"] = D(o["timeCreated"]);
  if (o["timeModified"] != null) o["timeModified"] = D(o["timeModified"]);
  return o;
};

export const n1 = (o: any) => {
  if (!o) return o;
  if (o["lot"] != null) o["lot"] = n0(o["lot"]);
  return o;
};

export const n2 = (o: any) => {
  if (!o) return o;
  if (o["items"] != null) o["items"] = A(o["items"], n0);
  return o;
};

export const n3 = (o: any) => {
  if (!o) return o;
  if (o["timeSent"] != null) o["timeSent"] = D(o["timeSent"]);
  return o;
};

export const n4 = (o: any) => {
  if (!o) return o;
  if (o["webhook"] != null) o["webhook"] = A(o["webhook"], n3);
  return o;
};

export const n5 = (o: any) => {
  if (!o) return o;
  if (o["attempts"] != null) o["attempts"] = n4(o["attempts"]);
  if (o["timeStarted"] != null) o["timeStarted"] = D(o["timeStarted"]);
  return o;
};

export const n6 = (o: any) => {
  if (!o) return o;
  if (o["items"] != null) o["items"] = A(o["items"], n5);
  return o;
};

export const n7 = (o: any) => {
  if (!o) return o;
  if (o["probe"] != null) o["probe"] = n5(o["probe"]);
  return o;
};

export const n8 = (o: any) => {
  if (!o) return o;
  if (o["timeCreated"] != null) o["timeCreated"] = D(o["timeCreated"]);
  return o;
};

export const n9 = (o: any) => {
  if (!o) return o;
  if (o["secrets"] != null) o["secrets"] = A(o["secrets"], n8);
  return o;
};

export const n10 = (o: any) => {
  if (!o) return o;
  if (o["kind"] != null) o["kind"] = n9(o["kind"]);
  if (o["timeCreated"] != null) o["timeCreated"] = D(o["timeCreated"]);
  if (o["timeModified"] != null) o["timeModified"] = D(o["timeModified"]);
  return o;
};

export const n11 = (o: any) => {
  if (!o) return o;
  if (o["items"] != null) o["items"] = A(o["items"], n10);
  return o;
};

export const n12 = (o: any) => {
  if (!o) return o;
  if (o["timeCompleted"] != null) o["timeCompleted"] = D(o["timeCompleted"]);
  if (o["timeStarted"] != null) o["timeStarted"] = D(o["timeStarted"]);
  return o;
};

export const n13 = (o: any) => {
  if (!o) return o;
  if (o["items"] != null) o["items"] = A(o["items"], n12);
  return o;
};

export const n14 = (o: any) => {
  if (!o) return o;
  if (o["timeCreated"] != null) o["timeCreated"] = D(o["timeCreated"]);
  if (o["timeLastUsed"] != null) o["timeLastUsed"] = D(o["timeLastUsed"]);
  return o;
};

export const n15 = (o: any) => {
  if (!o) return o;
  if (o["items"] != null) o["items"] = A(o["items"], n14);
  return o;
};

export const n16 = (o: any) => {
  if (!o) return o;
  if (o["startTime"] != null) o["startTime"] = D(o["startTime"]);
  return o;
};

export const n17 = (o: any) => {
  if (!o) return o;
  if (o["datum"] != null) o["datum"] = n16(o["datum"]);
  return o;
};

export const n18 = (o: any) => {
  if (!o) return o;
  if (o["timeCreated"] != null) o["timeCreated"] = D(o["timeCreated"]);
  if (o["timeExpires"] != null) o["timeExpires"] = D(o["timeExpires"]);
  return o;
};

export const n19 = (o: any) => {
  if (!o) return o;
  if (o["items"] != null) o["items"] = A(o["items"], n18);
  return o;
};

export const n20 = (o: any) => {
  if (!o) return o;
  if (o["autoRestartCooldownExpiration"] != null) o["autoRestartCooldownExpiration"] = D(o["autoRestartCooldownExpiration"]);
  if (o["timeCreated"] != null) o["timeCreated"] = D(o["timeCreated"]);
  if (o["timeLastAutoRestarted"] != null) o["timeLastAutoRestarted"] = D(o["timeLastAutoRestarted"]);
  if (o["timeModified"] != null) o["timeModified"] = D(o["timeModified"]);
  if (o["timeRunStateUpdated"] != null) o["timeRunStateUpdated"] = D(o["timeRunStateUpdated"]);
  return o;
};

export const n21 = (o: any) => {
  if (!o) return o;
  if (o["items"] != null) o["items"] = A(o["items"], n20);
  return o;
};

export const n22 = (o: any) => {
  if (!o) return o;
  if (o["items"] != null) o["items"] = A(o["items"], n8);
  return o;
};

export const n23 = (o: any) => {
  if (!o) return o;
  if (o["firstSeen"] != null) o["firstSeen"] = D(o["firstSeen"]);
  if (o["lastSeen"] != null) o["lastSeen"] = D(o["lastSeen"]);
  return o;
};

export const n24 = (o: any) => {
  if (!o) return o;
  if (o["items"] != null) o["items"] = A(o["items"], n23);
  return o;
};

export const n25 = (o: any) => {
  if (!o) return o;
  if (o["datum"] != null) o["datum"] = n17(o["datum"]);
  if (o["timestamp"] != null) o["timestamp"] = D(o["timestamp"]);
  return o;
};

export const n26 = (o: any) => {
  if (!o) return o;
  if (o["items"] != null) o["items"] = A(o["items"], n25);
  return o;
};

export const n27 = (o: any) => {
  if (!o) return o;
  if (o["startTimes"] != null) o["startTimes"] = A(o["startTimes"], D);
  if (o["timestamps"] != null) o["timestamps"] = A(o["timestamps"], D);
  return o;
};

export const n28 = (o: any) => {
  if (!o) return o;
  if (o["points"] != null) o["points"] = n27(o["points"]);
  return o;
};

export const n29 = (o: any) => {
  if (!o) return o;
  if (o["timeseries"] != null) o["timeseries"] = A(o["timeseries"], n28);
  return o;
};

export const n30 = (o: any) => {
  if (!o) return o;
  if (o["tables"] != null) o["tables"] = A(o["tables"], n29);
  return o;
};

export const n31 = (o: any) => {
  if (!o) return o;
  if (o["timeAborted"] != null) o["timeAborted"] = D(o["timeAborted"]);
  if (o["timeCommitted"] != null) o["timeCommitted"] = D(o["timeCommitted"]);
  if (o["timeCreated"] != null) o["timeCreated"] = D(o["timeCreated"]);
  return o;
};

export const n32 = (o: any) => {
  if (!o) return o;
  if (o["timeRequested"] != null) o["timeRequested"] = D(o["timeRequested"]);
  return o;
};

export const n33 = (o: any) => {
  if (!o) return o;
  if (o["created"] != null) o["created"] = D(o["created"]);
  return o;
};

export const n34 = (o: any) => {
  if (!o) return o;
  if (o["items"] != null) o["items"] = A(o["items"], n33);
  return o;
};

export const n35 = (o: any) => {
  if (!o) return o;
  if (o["repo"] != null) o["repo"] = n8(o["repo"]);
  return o;
};

export const n36 = (o: any) => {
  if (!o) return o;
  if (o["targetRelease"] != null) o["targetRelease"] = n32(o["targetRelease"]);
  if (o["timeLastStepPlanned"] != null) o["timeLastStepPlanned"] = D(o["timeLastStepPlanned"]);
  return o;
};

export const n37 = (o: any) => {
  if (!o) return o;
  if (o["rules"] != null) o["rules"] = A(o["rules"], n0);
  return o;
};

export const n38 = (o: any) => {
  if (!o) return o;
  if (o["secrets"] != null) o["secrets"] = A(o["secrets"], n8);
  if (o["timeCreated"] != null) o["timeCreated"] = D(o["timeCreated"]);
  if (o["timeModified"] != null) o["timeModified"] = D(o["timeModified"]);
  return o;
};

export const n39 = (o: any) => A(o, n0);

export const n40 = (o: any) => A(o, n18);
