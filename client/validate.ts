/* eslint-disable */
import { z, ZodType } from "zod";
import { snakeify, processResponseBody } from "./util";

const DateType = z.preprocess((arg) => {
  if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
}, z.date());
type DateType = z.infer<typeof DateType>;

/**
 * Zod only supports string enums at the moment. A previous issue was opened
 * and closed as stale but it provided a hint on how to implement it.
 *
 * @see https://github.com/colinhacks/zod/issues/1118
 * TODO: PR an update for zod to support other native enum types
 */
const IntEnum = <T extends readonly number[]>(values: T) =>
  z.number().refine((v) => values.includes(v)) as ZodType<T[number]>;

/**
 * Normalizes input to make it compatible with validators. This entails converting from snake to camel case and parsing dates.
 **/
const processSchema = <T extends z.ZodType>(schema: T) =>
  z.preprocess((input) => processResponseBody(input), schema);

/**
 * Normalizes schema output to make it compatible with the API. This entails converting from camel to snake case.
 **/
export const snakeifySchema = <T extends z.ZodType>(schema: T) =>
  schema.transform(snakeify);

/**
 * A type storing a range over `T`.
 *
 * This type supports ranges similar to the `RangeTo`, `Range` and `RangeFrom` types in the standard library. Those cover `(..end)`, `(start..end)`, and `(start..)` respectively.
 */
export const BinRangedouble = processSchema(
  z.union([
    z.object({ end: z.number(), type: z.enum(["range_to"]) }),
    z.object({ end: z.number(), start: z.number(), type: z.enum(["range"]) }),
    z.object({ start: z.number(), type: z.enum(["range_from"]) }),
  ])
);

/**
 * A type storing a range over `T`.
 *
 * This type supports ranges similar to the `RangeTo`, `Range` and `RangeFrom` types in the standard library. Those cover `(..end)`, `(start..end)`, and `(start..)` respectively.
 */
export const BinRangeint64 = processSchema(
  z.union([
    z.object({ end: z.number(), type: z.enum(["range_to"]) }),
    z.object({ end: z.number(), start: z.number(), type: z.enum(["range"]) }),
    z.object({ start: z.number(), type: z.enum(["range_from"]) }),
  ])
);

/**
 * Type storing bin edges and a count of samples within it.
 */
export const Bindouble = processSchema(
  z.object({ count: z.number().min(0), range: BinRangedouble })
);

/**
 * Type storing bin edges and a count of samples within it.
 */
export const Binint64 = processSchema(
  z.object({ count: z.number().min(0), range: BinRangeint64 })
);

/**
 * disk block size in bytes
 */
export const BlockSize = processSchema(IntEnum([512, 2048, 4096] as const));

/**
 * A count of bytes, typically used either for memory or storage capacity
 *
 * The maximum supported byte count is `i64::MAX`.  This makes it somewhat inconvenient to define constructors: a u32 constructor can be infallible, but an i64 constructor can fail (if the value is negative) and a u64 constructor can fail (if the value is larger than i64::MAX).  We provide all of these for consumers' convenience.
 */
export const ByteCount = processSchema(z.number().min(0));

/**
 * A cumulative or counter data type.
 */
export const Cumulativedouble = processSchema(
  z.object({ startTime: DateType, value: z.number() })
);

/**
 * A cumulative or counter data type.
 */
export const Cumulativeint64 = processSchema(
  z.object({ startTime: DateType, value: z.number() })
);

/**
 * A simple type for managing a histogram metric.
 *
 * A histogram maintains the count of any number of samples, over a set of bins. Bins are specified on construction via their _left_ edges, inclusive. There can't be any "gaps" in the bins, and an additional bin may be added to the left, right, or both so that the bins extend to the entire range of the support.
 *
 * Note that any gaps, unsorted bins, or non-finite values will result in an error.
 *
 * Example ------- ```rust use oximeter::histogram::{BinRange, Histogram};
 *
 * let edges = [0i64, 10, 20]; let mut hist = Histogram::new(&edges).unwrap(); assert_eq!(hist.n_bins(), 4); // One additional bin for the range (20..) assert_eq!(hist.n_samples(), 0); hist.sample(4); hist.sample(100); assert_eq!(hist.n_samples(), 2);
 *
 * let data = hist.iter().collect::<Vec<_>>(); assert_eq!(data[0].range, BinRange::range(i64::MIN, 0)); // An additional bin for `..0` assert_eq!(data[0].count, 0); // Nothing is in this bin
 *
 * assert_eq!(data[1].range, BinRange::range(0, 10)); // The range `0..10` assert_eq!(data[1].count, 1); // 4 is sampled into this bin ```
 *
 * Notes -----
 *
 * Histograms may be constructed either from their left bin edges, or from a sequence of ranges. In either case, the left-most bin may be converted upon construction. In particular, if the left-most value is not equal to the minimum of the support, a new bin will be added from the minimum to that provided value. If the left-most value _is_ the support's minimum, because the provided bin was unbounded below, such as `(..0)`, then that bin will be converted into one bounded below, `(MIN..0)` in this case.
 *
 * The short of this is that, most of the time, it shouldn't matter. If one specifies the extremes of the support as their bins, be aware that the left-most may be converted from a `BinRange::RangeTo` into a `BinRange::Range`. In other words, the first bin of a histogram is _always_ a `Bin::Range` or a `Bin::RangeFrom` after construction. In fact, every bin is one of those variants, the `BinRange::RangeTo` is only provided as a convenience during construction.
 */
export const Histogramint64 = processSchema(
  z.object({
    bins: Binint64.array(),
    nSamples: z.number().min(0),
    startTime: DateType,
  })
);

/**
 * A simple type for managing a histogram metric.
 *
 * A histogram maintains the count of any number of samples, over a set of bins. Bins are specified on construction via their _left_ edges, inclusive. There can't be any "gaps" in the bins, and an additional bin may be added to the left, right, or both so that the bins extend to the entire range of the support.
 *
 * Note that any gaps, unsorted bins, or non-finite values will result in an error.
 *
 * Example ------- ```rust use oximeter::histogram::{BinRange, Histogram};
 *
 * let edges = [0i64, 10, 20]; let mut hist = Histogram::new(&edges).unwrap(); assert_eq!(hist.n_bins(), 4); // One additional bin for the range (20..) assert_eq!(hist.n_samples(), 0); hist.sample(4); hist.sample(100); assert_eq!(hist.n_samples(), 2);
 *
 * let data = hist.iter().collect::<Vec<_>>(); assert_eq!(data[0].range, BinRange::range(i64::MIN, 0)); // An additional bin for `..0` assert_eq!(data[0].count, 0); // Nothing is in this bin
 *
 * assert_eq!(data[1].range, BinRange::range(0, 10)); // The range `0..10` assert_eq!(data[1].count, 1); // 4 is sampled into this bin ```
 *
 * Notes -----
 *
 * Histograms may be constructed either from their left bin edges, or from a sequence of ranges. In either case, the left-most bin may be converted upon construction. In particular, if the left-most value is not equal to the minimum of the support, a new bin will be added from the minimum to that provided value. If the left-most value _is_ the support's minimum, because the provided bin was unbounded below, such as `(..0)`, then that bin will be converted into one bounded below, `(MIN..0)` in this case.
 *
 * The short of this is that, most of the time, it shouldn't matter. If one specifies the extremes of the support as their bins, be aware that the left-most may be converted from a `BinRange::RangeTo` into a `BinRange::Range`. In other words, the first bin of a histogram is _always_ a `Bin::Range` or a `Bin::RangeFrom` after construction. In fact, every bin is one of those variants, the `BinRange::RangeTo` is only provided as a convenience during construction.
 */
export const Histogramdouble = processSchema(
  z.object({
    bins: Bindouble.array(),
    nSamples: z.number().min(0),
    startTime: DateType,
  })
);

/**
 * A `Datum` is a single sampled data point from a metric.
 */
export const Datum = processSchema(
  z.union([
    z.object({ datum: z.boolean(), type: z.enum(["bool"]) }),
    z.object({ datum: z.number(), type: z.enum(["i64"]) }),
    z.object({ datum: z.number(), type: z.enum(["f64"]) }),
    z.object({ datum: z.string(), type: z.enum(["string"]) }),
    z.object({
      datum: z.number().min(0).max(255).array(),
      type: z.enum(["bytes"]),
    }),
    z.object({ datum: Cumulativeint64, type: z.enum(["cumulative_i64"]) }),
    z.object({ datum: Cumulativedouble, type: z.enum(["cumulative_f64"]) }),
    z.object({ datum: Histogramint64, type: z.enum(["histogram_i64"]) }),
    z.object({ datum: Histogramdouble, type: z.enum(["histogram_f64"]) }),
  ])
);

/**
 * The type of an individual datum of a metric.
 */
export const DatumType = processSchema(
  z.enum([
    "bool",
    "i64",
    "f64",
    "string",
    "bytes",
    "cumulative_i64",
    "cumulative_f64",
    "histogram_i64",
    "histogram_f64",
  ])
);

export const DerEncodedKeyPair = processSchema(
  z.object({ privateKey: z.string(), publicCert: z.string() })
);

export const DeviceAccessTokenRequest = processSchema(
  z.object({
    clientId: z.string().uuid(),
    deviceCode: z.string(),
    grantType: z.string(),
  })
);

export const DeviceAuthRequest = processSchema(
  z.object({ clientId: z.string().uuid() })
);

export const DeviceAuthVerify = processSchema(
  z.object({ userCode: z.string() })
);

export const Digest = processSchema(
  z.object({ type: z.enum(["sha256"]), value: z.string() })
);

/**
 * A name unique within the parent collection
 *
 * Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. Names cannot be a UUID though they may contain a UUID.
 */
export const Name = processSchema(
  z
    .string()
    .max(63)
    .regex(
      /^(?![0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$)^[a-z][a-z0-9-]*[a-zA-Z0-9]$/
    )
);

/**
 * State of a Disk (primarily: attached or not)
 */
export const DiskState = processSchema(
  z.union([
    z.object({ state: z.enum(["creating"]) }),
    z.object({ state: z.enum(["detached"]) }),
    z.object({ instance: z.string().uuid(), state: z.enum(["attaching"]) }),
    z.object({ instance: z.string().uuid(), state: z.enum(["attached"]) }),
    z.object({ instance: z.string().uuid(), state: z.enum(["detaching"]) }),
    z.object({ state: z.enum(["destroyed"]) }),
    z.object({ state: z.enum(["faulted"]) }),
  ])
);

/**
 * Client view of a {@link Disk}
 */
export const Disk = processSchema(
  z.object({
    blockSize: ByteCount,
    description: z.string(),
    devicePath: z.string(),
    id: z.string().uuid(),
    imageId: z.string().uuid().nullable().optional(),
    name: Name,
    projectId: z.string().uuid(),
    size: ByteCount,
    snapshotId: z.string().uuid().nullable().optional(),
    state: DiskState,
    timeCreated: DateType,
    timeModified: DateType,
  })
);

/**
 * Different sources for a disk
 */
export const DiskSource = processSchema(
  z.union([
    z.object({ blockSize: BlockSize, type: z.enum(["blank"]) }),
    z.object({ snapshotId: z.string().uuid(), type: z.enum(["snapshot"]) }),
    z.object({ imageId: z.string().uuid(), type: z.enum(["image"]) }),
    z.object({ imageId: z.string().uuid(), type: z.enum(["global_image"]) }),
  ])
);

/**
 * Create-time parameters for a {@link Disk}
 */
export const DiskCreate = processSchema(
  z.object({
    description: z.string(),
    diskSource: DiskSource,
    name: Name,
    size: ByteCount,
  })
);

/**
 * Parameters for the {@link Disk} to be attached or detached to an instance
 */
export const DiskIdentifier = processSchema(z.object({ name: Name }));

/**
 * A single page of results
 */
export const DiskResultsPage = processSchema(
  z.object({ items: Disk.array(), nextPage: z.string().nullable().optional() })
);

/**
 * OS image distribution
 */
export const Distribution = processSchema(
  z.object({ name: Name, version: z.string() })
);

/**
 * Error information from a response.
 */
export const Error = processSchema(
  z.object({
    errorCode: z.string().optional(),
    message: z.string(),
    requestId: z.string(),
  })
);

/**
 * The kind of an external IP address for an instance
 */
export const IpKind = processSchema(z.enum(["ephemeral", "floating"]));

export const ExternalIp = processSchema(
  z.object({ ip: z.string(), kind: IpKind })
);

/**
 * Parameters for creating an external IP address for instances.
 */
export const ExternalIpCreate = processSchema(
  z.object({
    poolName: Name.nullable().optional(),
    type: z.enum(["ephemeral"]),
  })
);

/**
 * A single page of results
 */
export const ExternalIpResultsPage = processSchema(
  z.object({
    items: ExternalIp.array(),
    nextPage: z.string().nullable().optional(),
  })
);

/**
 * The source from which a field is derived, the target or metric.
 */
export const FieldSource = processSchema(z.enum(["target", "metric"]));

/**
 * The `FieldType` identifies the data type of a target or metric field.
 */
export const FieldType = processSchema(
  z.enum(["string", "i64", "ip_addr", "uuid", "bool"])
);

/**
 * The name and type information for a field of a timeseries schema.
 */
export const FieldSchema = processSchema(
  z.object({ name: z.string(), source: FieldSource, ty: FieldType })
);

export const FleetRole = processSchema(
  z.enum(["admin", "collaborator", "viewer"])
);

/**
 * Describes what kind of identity is described by an id
 */
export const IdentityType = processSchema(z.enum(["silo_user", "silo_group"]));

/**
 * Describes the assignment of a particular role on a particular resource to a particular identity (user, group, etc.)
 *
 * The resource is not part of this structure.  Rather, `RoleAssignment`s are put into a `Policy` and that Policy is applied to a particular resource.
 */
export const FleetRoleRoleAssignment = processSchema(
  z.object({
    identityId: z.string().uuid(),
    identityType: IdentityType,
    roleName: FleetRole,
  })
);

/**
 * Client view of a `Policy`, which describes how this resource may be accessed
 *
 * Note that the Policy only describes access granted explicitly for this resource.  The policies of parent resources can also cause a user to have access to this resource.
 */
export const FleetRolePolicy = processSchema(
  z.object({ roleAssignments: FleetRoleRoleAssignment.array() })
);

/**
 * Client view of global Images
 */
export const GlobalImage = processSchema(
  z.object({
    blockSize: ByteCount,
    description: z.string(),
    digest: Digest.nullable().optional(),
    distribution: z.string(),
    id: z.string().uuid(),
    name: Name,
    size: ByteCount,
    timeCreated: DateType,
    timeModified: DateType,
    url: z.string().nullable().optional(),
    version: z.string(),
  })
);

/**
 * The source of the underlying image.
 */
export const ImageSource = processSchema(
  z.union([
    z.object({ type: z.enum(["url"]), url: z.string() }),
    z.object({ id: z.string().uuid(), type: z.enum(["snapshot"]) }),
    z.object({ type: z.enum(["you_can_boot_anything_as_long_as_its_alpine"]) }),
  ])
);

/**
 * Create-time parameters for an {@link GlobalImage}
 */
export const GlobalImageCreate = processSchema(
  z.object({
    blockSize: BlockSize,
    description: z.string(),
    distribution: Distribution,
    name: Name,
    source: ImageSource,
  })
);

/**
 * A single page of results
 */
export const GlobalImageResultsPage = processSchema(
  z.object({
    items: GlobalImage.array(),
    nextPage: z.string().nullable().optional(),
  })
);

export const IdentityProviderType = processSchema(z.enum(["saml"]));

/**
 * Client view of an {@link IdentityProvider}
 */
export const IdentityProvider = processSchema(
  z.object({
    description: z.string(),
    id: z.string().uuid(),
    name: Name,
    providerType: IdentityProviderType,
    timeCreated: DateType,
    timeModified: DateType,
  })
);

/**
 * A single page of results
 */
export const IdentityProviderResultsPage = processSchema(
  z.object({
    items: IdentityProvider.array(),
    nextPage: z.string().nullable().optional(),
  })
);

export const IdpMetadataSource = processSchema(
  z.union([
    z.object({ type: z.enum(["url"]), url: z.string() }),
    z.object({ data: z.string(), type: z.enum(["base64_encoded_xml"]) }),
  ])
);

/**
 * Client view of project Images
 */
export const Image = processSchema(
  z.object({
    blockSize: ByteCount,
    description: z.string(),
    digest: Digest.nullable().optional(),
    id: z.string().uuid(),
    name: Name,
    projectId: z.string().uuid(),
    size: ByteCount,
    timeCreated: DateType,
    timeModified: DateType,
    url: z.string().nullable().optional(),
    version: z.string().nullable().optional(),
  })
);

/**
 * Create-time parameters for an {@link Image}
 */
export const ImageCreate = processSchema(
  z.object({
    blockSize: BlockSize,
    description: z.string(),
    name: Name,
    source: ImageSource,
  })
);

/**
 * A single page of results
 */
export const ImageResultsPage = processSchema(
  z.object({ items: Image.array(), nextPage: z.string().nullable().optional() })
);

/**
 * The number of CPUs in an Instance
 */
export const InstanceCpuCount = processSchema(z.number().min(0).max(65535));

/**
 * Running state of an Instance (primarily: booted or stopped)
 *
 * This typically reflects whether it's starting, running, stopping, or stopped, but also includes states related to the Instance's lifecycle
 */
export const InstanceState = processSchema(
  z.enum([
    "creating",
    "starting",
    "running",
    "stopping",
    "stopped",
    "rebooting",
    "migrating",
    "repairing",
    "failed",
    "destroyed",
  ])
);

/**
 * Client view of an {@link Instance}
 */
export const Instance = processSchema(
  z.object({
    description: z.string(),
    hostname: z.string(),
    id: z.string().uuid(),
    memory: ByteCount,
    name: Name,
    ncpus: InstanceCpuCount,
    projectId: z.string().uuid(),
    runState: InstanceState,
    timeCreated: DateType,
    timeModified: DateType,
    timeRunStateUpdated: DateType,
  })
);

/**
 * Describe the instance's disks at creation time
 */
export const InstanceDiskAttachment = processSchema(
  z.union([
    z.object({
      description: z.string(),
      diskSource: DiskSource,
      name: Name,
      size: ByteCount,
      type: z.enum(["create"]),
    }),
    z.object({ name: Name, type: z.enum(["attach"]) }),
  ])
);

/**
 * Create-time parameters for a {@link NetworkInterface}
 */
export const NetworkInterfaceCreate = processSchema(
  z.object({
    description: z.string(),
    ip: z.string().nullable().optional(),
    name: Name,
    subnetName: Name,
    vpcName: Name,
  })
);

/**
 * Describes an attachment of a `NetworkInterface` to an `Instance`, at the time the instance is created.
 */
export const InstanceNetworkInterfaceAttachment = processSchema(
  z.union([
    z.object({
      params: NetworkInterfaceCreate.array(),
      type: z.enum(["create"]),
    }),
    z.object({ type: z.enum(["default"]) }),
    z.object({ type: z.enum(["none"]) }),
  ])
);

/**
 * Create-time parameters for an {@link Instance}
 */
export const InstanceCreate = processSchema(
  z.object({
    description: z.string(),
    disks: InstanceDiskAttachment.array().default([]).optional(),
    externalIps: ExternalIpCreate.array().default([]).optional(),
    hostname: z.string(),
    memory: ByteCount,
    name: Name,
    ncpus: InstanceCpuCount,
    networkInterfaces: InstanceNetworkInterfaceAttachment.default({
      type: "default",
    }).optional(),
    start: z.boolean().default(true).optional(),
    userData: z.string().default("").optional(),
  })
);

/**
 * Migration parameters for an {@link Instance}
 */
export const InstanceMigrate = processSchema(
  z.object({ dstSledId: z.string().uuid() })
);

/**
 * A single page of results
 */
export const InstanceResultsPage = processSchema(
  z.object({
    items: Instance.array(),
    nextPage: z.string().nullable().optional(),
  })
);

/**
 * Contents of an Instance's serial console buffer.
 */
export const InstanceSerialConsoleData = processSchema(
  z.object({
    data: z.number().min(0).max(255).array(),
    lastByteOffset: z.number().min(0),
  })
);

/**
 * An IPv4 subnet
 *
 * An IPv4 subnet, including prefix and subnet mask
 */
export const Ipv4Net = processSchema(
  z
    .string()
    .regex(
      /^(10\.([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\/([8-9]|1[0-9]|2[0-9]|3[0-2])|172\.(1[6-9]|2[0-9]|3[0-1])\.([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\/(1[2-9]|2[0-9]|3[0-2])|192\.168\.([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\/(1[6-9]|2[0-9]|3[0-2]))$/
    )
);

/**
 * An IPv6 subnet
 *
 * An IPv6 subnet, including prefix and subnet mask
 */
export const Ipv6Net = processSchema(
  z
    .string()
    .regex(
      /^([fF][dD])[0-9a-fA-F]{2}:(([0-9a-fA-F]{1,4}:){6}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,6}:)\/([1-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8])$/
    )
);

export const IpNet = processSchema(z.union([Ipv4Net, Ipv6Net]));

/**
 * Identity-related metadata that's included in nearly all public API objects
 */
export const IpPool = processSchema(
  z.object({
    description: z.string(),
    id: z.string().uuid(),
    name: Name,
    projectId: z.string().uuid().nullable().optional(),
    timeCreated: DateType,
    timeModified: DateType,
  })
);

/**
 * Create-time parameters for an IP Pool.
 *
 * See {@link IpPool}
 */
export const IpPoolCreate = processSchema(
  z.object({
    description: z.string(),
    name: Name,
    organization: Name.optional(),
    project: Name.optional(),
  })
);

/**
 * A non-decreasing IPv4 address range, inclusive of both ends.
 *
 * The first address must be less than or equal to the last address.
 */
export const Ipv4Range = processSchema(
  z.object({ first: z.string(), last: z.string() })
);

/**
 * A non-decreasing IPv6 address range, inclusive of both ends.
 *
 * The first address must be less than or equal to the last address.
 */
export const Ipv6Range = processSchema(
  z.object({ first: z.string(), last: z.string() })
);

export const IpRange = processSchema(z.union([Ipv4Range, Ipv6Range]));

export const IpPoolRange = processSchema(
  z.object({ id: z.string().uuid(), range: IpRange, timeCreated: DateType })
);

/**
 * A single page of results
 */
export const IpPoolRangeResultsPage = processSchema(
  z.object({
    items: IpPoolRange.array(),
    nextPage: z.string().nullable().optional(),
  })
);

/**
 * A single page of results
 */
export const IpPoolResultsPage = processSchema(
  z.object({
    items: IpPool.array(),
    nextPage: z.string().nullable().optional(),
  })
);

/**
 * Parameters for updating an IP Pool
 */
export const IpPoolUpdate = processSchema(
  z.object({
    description: z.string().nullable().optional(),
    name: Name.nullable().optional(),
  })
);

/**
 * A range of IP ports
 *
 * An inclusive-inclusive range of IP ports. The second port may be omitted to represent a single port
 */
export const L4PortRange = processSchema(
  z
    .string()
    .min(1)
    .max(11)
    .regex(/^[0-9]{1,5}(-[0-9]{1,5})?$/)
);

/**
 * A MAC address
 *
 * A Media Access Control address, in EUI-48 format
 */
export const MacAddr = processSchema(
  z
    .string()
    .min(17)
    .max(17)
    .regex(/^([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$/)
);

/**
 * A `Measurement` is a timestamped datum from a single metric
 */
export const Measurement = processSchema(
  z.object({ datum: Datum, timestamp: DateType })
);

/**
 * A single page of results
 */
export const MeasurementResultsPage = processSchema(
  z.object({
    items: Measurement.array(),
    nextPage: z.string().nullable().optional(),
  })
);

/**
 * A `NetworkInterface` represents a virtual network interface device.
 */
export const NetworkInterface = processSchema(
  z.object({
    description: z.string(),
    id: z.string().uuid(),
    instanceId: z.string().uuid(),
    ip: z.string(),
    mac: MacAddr,
    name: Name,
    primary: z.boolean(),
    subnetId: z.string().uuid(),
    timeCreated: DateType,
    timeModified: DateType,
    vpcId: z.string().uuid(),
  })
);

/**
 * A single page of results
 */
export const NetworkInterfaceResultsPage = processSchema(
  z.object({
    items: NetworkInterface.array(),
    nextPage: z.string().nullable().optional(),
  })
);

/**
 * Parameters for updating a {@link NetworkInterface}.
 *
 * Note that modifying IP addresses for an interface is not yet supported, a new interface must be created instead.
 */
export const NetworkInterfaceUpdate = processSchema(
  z.object({
    description: z.string().nullable().optional(),
    name: Name.nullable().optional(),
    primary: z.boolean().default(false).optional(),
  })
);

/**
 * Unique name for a saga `Node`
 *
 * Each node requires a string name that's unique within its DAG.  The name is used to identify its output.  Nodes that depend on a given node (either directly or indirectly) can access the node's output using its name.
 */
export const NodeName = processSchema(z.string());

/**
 * Client view of an {@link Organization}
 */
export const Organization = processSchema(
  z.object({
    description: z.string(),
    id: z.string().uuid(),
    name: Name,
    timeCreated: DateType,
    timeModified: DateType,
  })
);

/**
 * Create-time parameters for an {@link Organization}
 */
export const OrganizationCreate = processSchema(
  z.object({ description: z.string(), name: Name })
);

/**
 * A single page of results
 */
export const OrganizationResultsPage = processSchema(
  z.object({
    items: Organization.array(),
    nextPage: z.string().nullable().optional(),
  })
);

export const OrganizationRole = processSchema(
  z.enum(["admin", "collaborator", "viewer"])
);

/**
 * Describes the assignment of a particular role on a particular resource to a particular identity (user, group, etc.)
 *
 * The resource is not part of this structure.  Rather, `RoleAssignment`s are put into a `Policy` and that Policy is applied to a particular resource.
 */
export const OrganizationRoleRoleAssignment = processSchema(
  z.object({
    identityId: z.string().uuid(),
    identityType: IdentityType,
    roleName: OrganizationRole,
  })
);

/**
 * Client view of a `Policy`, which describes how this resource may be accessed
 *
 * Note that the Policy only describes access granted explicitly for this resource.  The policies of parent resources can also cause a user to have access to this resource.
 */
export const OrganizationRolePolicy = processSchema(
  z.object({ roleAssignments: OrganizationRoleRoleAssignment.array() })
);

/**
 * Updateable properties of an {@link Organization}
 */
export const OrganizationUpdate = processSchema(
  z.object({
    description: z.string().nullable().optional(),
    name: Name.nullable().optional(),
  })
);

/**
 * Client view of a {@link Project}
 */
export const Project = processSchema(
  z.object({
    description: z.string(),
    id: z.string().uuid(),
    name: Name,
    organizationId: z.string().uuid(),
    timeCreated: DateType,
    timeModified: DateType,
  })
);

/**
 * Create-time parameters for a {@link Project}
 */
export const ProjectCreate = processSchema(
  z.object({ description: z.string(), name: Name })
);

/**
 * A single page of results
 */
export const ProjectResultsPage = processSchema(
  z.object({
    items: Project.array(),
    nextPage: z.string().nullable().optional(),
  })
);

export const ProjectRole = processSchema(
  z.enum(["admin", "collaborator", "viewer"])
);

/**
 * Describes the assignment of a particular role on a particular resource to a particular identity (user, group, etc.)
 *
 * The resource is not part of this structure.  Rather, `RoleAssignment`s are put into a `Policy` and that Policy is applied to a particular resource.
 */
export const ProjectRoleRoleAssignment = processSchema(
  z.object({
    identityId: z.string().uuid(),
    identityType: IdentityType,
    roleName: ProjectRole,
  })
);

/**
 * Client view of a `Policy`, which describes how this resource may be accessed
 *
 * Note that the Policy only describes access granted explicitly for this resource.  The policies of parent resources can also cause a user to have access to this resource.
 */
export const ProjectRolePolicy = processSchema(
  z.object({ roleAssignments: ProjectRoleRoleAssignment.array() })
);

/**
 * Updateable properties of a {@link Project}
 */
export const ProjectUpdate = processSchema(
  z.object({
    description: z.string().nullable().optional(),
    name: Name.nullable().optional(),
  })
);

/**
 * Client view of an {@link Rack}
 */
export const Rack = processSchema(
  z.object({
    id: z.string().uuid(),
    timeCreated: DateType,
    timeModified: DateType,
  })
);

/**
 * A single page of results
 */
export const RackResultsPage = processSchema(
  z.object({ items: Rack.array(), nextPage: z.string().nullable().optional() })
);

/**
 * A name for a built-in role
 *
 * Role names consist of two string components separated by dot (".").
 */
export const RoleName = processSchema(
  z
    .string()
    .max(63)
    .regex(/[a-z-]+\.[a-z-]+/)
);

/**
 * Client view of a {@link Role}
 */
export const Role = processSchema(
  z.object({ description: z.string(), name: RoleName })
);

/**
 * A single page of results
 */
export const RoleResultsPage = processSchema(
  z.object({ items: Role.array(), nextPage: z.string().nullable().optional() })
);

/**
 * A `RouteDestination` is used to match traffic with a routing rule, on the destination of that traffic.
 *
 * When traffic is to be sent to a destination that is within a given `RouteDestination`, the corresponding {@link RouterRoute} applies, and traffic will be forward to the {@link RouteTarget} for that rule.
 */
export const RouteDestination = processSchema(
  z.union([
    z.object({ type: z.enum(["ip"]), value: z.string() }),
    z.object({ type: z.enum(["ip_net"]), value: IpNet }),
    z.object({ type: z.enum(["vpc"]), value: Name }),
    z.object({ type: z.enum(["subnet"]), value: Name }),
  ])
);

/**
 * A `RouteTarget` describes the possible locations that traffic matching a route destination can be sent.
 */
export const RouteTarget = processSchema(
  z.union([
    z.object({ type: z.enum(["ip"]), value: z.string() }),
    z.object({ type: z.enum(["vpc"]), value: Name }),
    z.object({ type: z.enum(["subnet"]), value: Name }),
    z.object({ type: z.enum(["instance"]), value: Name }),
    z.object({ type: z.enum(["internet_gateway"]), value: Name }),
  ])
);

/**
 * The classification of a {@link RouterRoute} as defined by the system. The kind determines certain attributes such as if the route is modifiable and describes how or where the route was created.
 *
 * See [RFD-21](https://rfd.shared.oxide.computer/rfd/0021#concept-router) for more context
 */
export const RouterRouteKind = processSchema(
  z.enum(["default", "vpc_subnet", "vpc_peering", "custom"])
);

/**
 * A route defines a rule that governs where traffic should be sent based on its destination.
 */
export const RouterRoute = processSchema(
  z.object({
    description: z.string(),
    destination: RouteDestination,
    id: z.string().uuid(),
    kind: RouterRouteKind,
    name: Name,
    target: RouteTarget,
    timeCreated: DateType,
    timeModified: DateType,
    vpcRouterId: z.string().uuid(),
  })
);

/**
 * Create-time parameters for a {@link RouterRoute}
 */
export const RouterRouteCreateParams = processSchema(
  z.object({
    description: z.string(),
    destination: RouteDestination,
    name: Name,
    target: RouteTarget,
  })
);

/**
 * A single page of results
 */
export const RouterRouteResultsPage = processSchema(
  z.object({
    items: RouterRoute.array(),
    nextPage: z.string().nullable().optional(),
  })
);

/**
 * Updateable properties of a {@link RouterRoute}
 */
export const RouterRouteUpdateParams = processSchema(
  z.object({
    description: z.string().nullable().optional(),
    destination: RouteDestination,
    name: Name.nullable().optional(),
    target: RouteTarget,
  })
);

export const SagaErrorInfo = processSchema(
  z.union([
    z.object({
      error: z.enum(["action_failed"]),
      sourceError: z.record(z.unknown()),
    }),
    z.object({ error: z.enum(["deserialize_failed"]), message: z.string() }),
    z.object({ error: z.enum(["injected_error"]) }),
    z.object({ error: z.enum(["serialize_failed"]), message: z.string() }),
    z.object({ error: z.enum(["subsaga_create_failed"]), message: z.string() }),
  ])
);

export const SagaState = processSchema(
  z.union([
    z.object({ state: z.enum(["running"]) }),
    z.object({ state: z.enum(["succeeded"]) }),
    z.object({
      errorInfo: SagaErrorInfo,
      errorNodeName: NodeName,
      state: z.enum(["failed"]),
    }),
  ])
);

export const Saga = processSchema(
  z.object({ id: z.string().uuid(), state: SagaState })
);

/**
 * A single page of results
 */
export const SagaResultsPage = processSchema(
  z.object({ items: Saga.array(), nextPage: z.string().nullable().optional() })
);

/**
 * Identity-related metadata that's included in nearly all public API objects
 */
export const SamlIdentityProvider = processSchema(
  z.object({
    acsUrl: z.string(),
    description: z.string(),
    id: z.string().uuid(),
    idpEntityId: z.string(),
    name: Name,
    publicCert: z.string().nullable().optional(),
    sloUrl: z.string(),
    spClientId: z.string(),
    technicalContactEmail: z.string(),
    timeCreated: DateType,
    timeModified: DateType,
  })
);

/**
 * Create-time identity-related parameters
 */
export const SamlIdentityProviderCreate = processSchema(
  z.object({
    acsUrl: z.string(),
    description: z.string(),
    groupAttributeName: z.string().nullable().optional(),
    idpEntityId: z.string(),
    idpMetadataSource: IdpMetadataSource,
    name: Name,
    signingKeypair: DerEncodedKeyPair.nullable().optional(),
    sloUrl: z.string(),
    spClientId: z.string(),
    technicalContactEmail: z.string(),
  })
);

/**
 * Describes how identities are managed and users are authenticated in this Silo
 */
export const SiloIdentityMode = processSchema(
  z.enum(["saml_jit", "local_only"])
);

/**
 * Client view of a ['Silo']
 */
export const Silo = processSchema(
  z.object({
    description: z.string(),
    discoverable: z.boolean(),
    id: z.string().uuid(),
    identityMode: SiloIdentityMode,
    name: Name,
    timeCreated: DateType,
    timeModified: DateType,
  })
);

/**
 * Create-time parameters for a {@link Silo}
 */
export const SiloCreate = processSchema(
  z.object({
    adminGroupName: z.string().nullable().optional(),
    description: z.string(),
    discoverable: z.boolean(),
    identityMode: SiloIdentityMode,
    name: Name,
  })
);

/**
 * A single page of results
 */
export const SiloResultsPage = processSchema(
  z.object({ items: Silo.array(), nextPage: z.string().nullable().optional() })
);

export const SiloRole = processSchema(
  z.enum(["admin", "collaborator", "viewer"])
);

/**
 * Describes the assignment of a particular role on a particular resource to a particular identity (user, group, etc.)
 *
 * The resource is not part of this structure.  Rather, `RoleAssignment`s are put into a `Policy` and that Policy is applied to a particular resource.
 */
export const SiloRoleRoleAssignment = processSchema(
  z.object({
    identityId: z.string().uuid(),
    identityType: IdentityType,
    roleName: SiloRole,
  })
);

/**
 * Client view of a `Policy`, which describes how this resource may be accessed
 *
 * Note that the Policy only describes access granted explicitly for this resource.  The policies of parent resources can also cause a user to have access to this resource.
 */
export const SiloRolePolicy = processSchema(
  z.object({ roleAssignments: SiloRoleRoleAssignment.array() })
);

/**
 * Client view of an {@link Sled}
 */
export const Sled = processSchema(
  z.object({
    id: z.string().uuid(),
    serviceAddress: z.string(),
    timeCreated: DateType,
    timeModified: DateType,
  })
);

/**
 * A single page of results
 */
export const SledResultsPage = processSchema(
  z.object({ items: Sled.array(), nextPage: z.string().nullable().optional() })
);

export const SnapshotState = processSchema(
  z.enum(["creating", "ready", "faulted", "destroyed"])
);

/**
 * Client view of a Snapshot
 */
export const Snapshot = processSchema(
  z.object({
    description: z.string(),
    diskId: z.string().uuid(),
    id: z.string().uuid(),
    name: Name,
    projectId: z.string().uuid(),
    size: ByteCount,
    state: SnapshotState,
    timeCreated: DateType,
    timeModified: DateType,
  })
);

/**
 * Create-time parameters for a {@link Snapshot}
 */
export const SnapshotCreate = processSchema(
  z.object({ description: z.string(), disk: Name, name: Name })
);

/**
 * A single page of results
 */
export const SnapshotResultsPage = processSchema(
  z.object({
    items: Snapshot.array(),
    nextPage: z.string().nullable().optional(),
  })
);

export const SpoofLoginBody = processSchema(z.object({ username: z.string() }));

/**
 * Client view of a {@link SshKey}
 */
export const SshKey = processSchema(
  z.object({
    description: z.string(),
    id: z.string().uuid(),
    name: Name,
    publicKey: z.string(),
    siloUserId: z.string().uuid(),
    timeCreated: DateType,
    timeModified: DateType,
  })
);

/**
 * Create-time parameters for an {@link SshKey}
 */
export const SshKeyCreate = processSchema(
  z.object({ description: z.string(), name: Name, publicKey: z.string() })
);

/**
 * A single page of results
 */
export const SshKeyResultsPage = processSchema(
  z.object({
    items: SshKey.array(),
    nextPage: z.string().nullable().optional(),
  })
);

/**
 * The name of a timeseries
 *
 * Names are constructed by concatenating the target and metric names with ':'. Target and metric names must be lowercase alphanumeric characters with '_' separating words.
 */
export const TimeseriesName = processSchema(
  z
    .string()
    .regex(
      /(([a-z]+[a-z0-9]*)(_([a-z0-9]+))*):(([a-z]+[a-z0-9]*)(_([a-z0-9]+))*)/
    )
);

/**
 * The schema for a timeseries.
 *
 * This includes the name of the timeseries, as well as the datum type of its metric and the schema for each field.
 */
export const TimeseriesSchema = processSchema(
  z.object({
    created: DateType,
    datumType: DatumType,
    fieldSchema: FieldSchema.array(),
    timeseriesName: TimeseriesName,
  })
);

/**
 * A single page of results
 */
export const TimeseriesSchemaResultsPage = processSchema(
  z.object({
    items: TimeseriesSchema.array(),
    nextPage: z.string().nullable().optional(),
  })
);

/**
 * Client view of a {@link User}
 */
export const User = processSchema(
  z.object({ displayName: z.string(), id: z.string().uuid() })
);

/**
 * Client view of a {@link UserBuiltin}
 */
export const UserBuiltin = processSchema(
  z.object({
    description: z.string(),
    id: z.string().uuid(),
    name: Name,
    timeCreated: DateType,
    timeModified: DateType,
  })
);

/**
 * A single page of results
 */
export const UserBuiltinResultsPage = processSchema(
  z.object({
    items: UserBuiltin.array(),
    nextPage: z.string().nullable().optional(),
  })
);

/**
 * A single page of results
 */
export const UserResultsPage = processSchema(
  z.object({ items: User.array(), nextPage: z.string().nullable().optional() })
);

/**
 * Client view of a {@link Vpc}
 */
export const Vpc = processSchema(
  z.object({
    description: z.string(),
    dnsName: Name,
    id: z.string().uuid(),
    ipv6Prefix: Ipv6Net,
    name: Name,
    projectId: z.string().uuid(),
    systemRouterId: z.string().uuid(),
    timeCreated: DateType,
    timeModified: DateType,
  })
);

/**
 * Create-time parameters for a {@link Vpc}
 */
export const VpcCreate = processSchema(
  z.object({
    description: z.string(),
    dnsName: Name,
    ipv6Prefix: Ipv6Net.nullable().optional(),
    name: Name,
  })
);

export const VpcFirewallRuleAction = processSchema(z.enum(["allow", "deny"]));

export const VpcFirewallRuleDirection = processSchema(
  z.enum(["inbound", "outbound"])
);

/**
 * The `VpcFirewallRuleHostFilter` is used to filter traffic on the basis of its source or destination host.
 */
export const VpcFirewallRuleHostFilter = processSchema(
  z.union([
    z.object({ type: z.enum(["vpc"]), value: Name }),
    z.object({ type: z.enum(["subnet"]), value: Name }),
    z.object({ type: z.enum(["instance"]), value: Name }),
    z.object({ type: z.enum(["ip"]), value: z.string() }),
    z.object({ type: z.enum(["ip_net"]), value: IpNet }),
  ])
);

/**
 * The protocols that may be specified in a firewall rule's filter
 */
export const VpcFirewallRuleProtocol = processSchema(
  z.enum(["TCP", "UDP", "ICMP"])
);

/**
 * Filter for a firewall rule. A given packet must match every field that is present for the rule to apply to it. A packet matches a field if any entry in that field matches the packet.
 */
export const VpcFirewallRuleFilter = processSchema(
  z.object({
    hosts: VpcFirewallRuleHostFilter.array().nullable().optional(),
    ports: L4PortRange.array().nullable().optional(),
    protocols: VpcFirewallRuleProtocol.array().nullable().optional(),
  })
);

export const VpcFirewallRuleStatus = processSchema(
  z.enum(["disabled", "enabled"])
);

/**
 * A `VpcFirewallRuleTarget` is used to specify the set of {@link Instance}s to which a firewall rule applies.
 */
export const VpcFirewallRuleTarget = processSchema(
  z.union([
    z.object({ type: z.enum(["vpc"]), value: Name }),
    z.object({ type: z.enum(["subnet"]), value: Name }),
    z.object({ type: z.enum(["instance"]), value: Name }),
    z.object({ type: z.enum(["ip"]), value: z.string() }),
    z.object({ type: z.enum(["ip_net"]), value: IpNet }),
  ])
);

/**
 * A single rule in a VPC firewall
 */
export const VpcFirewallRule = processSchema(
  z.object({
    action: VpcFirewallRuleAction,
    description: z.string(),
    direction: VpcFirewallRuleDirection,
    filters: VpcFirewallRuleFilter,
    id: z.string().uuid(),
    name: Name,
    priority: z.number().min(0).max(65535),
    status: VpcFirewallRuleStatus,
    targets: VpcFirewallRuleTarget.array(),
    timeCreated: DateType,
    timeModified: DateType,
    vpcId: z.string().uuid(),
  })
);

/**
 * A single rule in a VPC firewall
 */
export const VpcFirewallRuleUpdate = processSchema(
  z.object({
    action: VpcFirewallRuleAction,
    description: z.string(),
    direction: VpcFirewallRuleDirection,
    filters: VpcFirewallRuleFilter,
    name: Name,
    priority: z.number().min(0).max(65535),
    status: VpcFirewallRuleStatus,
    targets: VpcFirewallRuleTarget.array(),
  })
);

/**
 * Updateable properties of a `Vpc`'s firewall Note that VpcFirewallRules are implicitly created along with a Vpc, so there is no explicit creation.
 */
export const VpcFirewallRuleUpdateParams = processSchema(
  z.object({ rules: VpcFirewallRuleUpdate.array() })
);

/**
 * Collection of a Vpc's firewall rules
 */
export const VpcFirewallRules = processSchema(
  z.object({ rules: VpcFirewallRule.array() })
);

/**
 * A single page of results
 */
export const VpcResultsPage = processSchema(
  z.object({ items: Vpc.array(), nextPage: z.string().nullable().optional() })
);

export const VpcRouterKind = processSchema(z.enum(["system", "custom"]));

/**
 * A VPC router defines a series of rules that indicate where traffic should be sent depending on its destination.
 */
export const VpcRouter = processSchema(
  z.object({
    description: z.string(),
    id: z.string().uuid(),
    kind: VpcRouterKind,
    name: Name,
    timeCreated: DateType,
    timeModified: DateType,
    vpcId: z.string().uuid(),
  })
);

/**
 * Create-time parameters for a {@link VpcRouter}
 */
export const VpcRouterCreate = processSchema(
  z.object({ description: z.string(), name: Name })
);

/**
 * A single page of results
 */
export const VpcRouterResultsPage = processSchema(
  z.object({
    items: VpcRouter.array(),
    nextPage: z.string().nullable().optional(),
  })
);

/**
 * Updateable properties of a {@link VpcRouter}
 */
export const VpcRouterUpdate = processSchema(
  z.object({
    description: z.string().nullable().optional(),
    name: Name.nullable().optional(),
  })
);

/**
 * A VPC subnet represents a logical grouping for instances that allows network traffic between them, within a IPv4 subnetwork or optionall an IPv6 subnetwork.
 */
export const VpcSubnet = processSchema(
  z.object({
    description: z.string(),
    id: z.string().uuid(),
    ipv4Block: Ipv4Net,
    ipv6Block: Ipv6Net,
    name: Name,
    timeCreated: DateType,
    timeModified: DateType,
    vpcId: z.string().uuid(),
  })
);

/**
 * Create-time parameters for a {@link VpcSubnet}
 */
export const VpcSubnetCreate = processSchema(
  z.object({
    description: z.string(),
    ipv4Block: Ipv4Net,
    ipv6Block: Ipv6Net.nullable().optional(),
    name: Name,
  })
);

/**
 * A single page of results
 */
export const VpcSubnetResultsPage = processSchema(
  z.object({
    items: VpcSubnet.array(),
    nextPage: z.string().nullable().optional(),
  })
);

/**
 * Updateable properties of a {@link VpcSubnet}
 */
export const VpcSubnetUpdate = processSchema(
  z.object({
    description: z.string().nullable().optional(),
    name: Name.nullable().optional(),
  })
);

/**
 * Updateable properties of a {@link Vpc}
 */
export const VpcUpdate = processSchema(
  z.object({
    description: z.string().nullable().optional(),
    dnsName: Name.nullable().optional(),
    name: Name.nullable().optional(),
  })
);

/**
 * Supported set of sort modes for scanning by name or id
 */
export const NameOrIdSortMode = processSchema(
  z.enum(["name_ascending", "name_descending", "id_ascending"])
);

/**
 * Supported set of sort modes for scanning by name only
 *
 * Currently, we only support scanning in ascending order.
 */
export const NameSortMode = processSchema(z.enum(["name_ascending"]));

export const DiskMetricName = processSchema(
  z.enum(["activated", "flush", "read", "read_bytes", "write", "write_bytes"])
);

/**
 * Supported set of sort modes for scanning by id only.
 *
 * Currently, we only support scanning in ascending order.
 */
export const IdSortMode = processSchema(z.enum(["id_ascending"]));

export const DiskViewByIdParams = processSchema(
  z.object({
    id: z.string().uuid(),
  })
);

export const ImageViewByIdParams = processSchema(
  z.object({
    id: z.string().uuid(),
  })
);

export const InstanceViewByIdParams = processSchema(
  z.object({
    id: z.string().uuid(),
  })
);

export const InstanceNetworkInterfaceViewByIdParams = processSchema(
  z.object({
    id: z.string().uuid(),
  })
);

export const OrganizationViewByIdParams = processSchema(
  z.object({
    id: z.string().uuid(),
  })
);

export const ProjectViewByIdParams = processSchema(
  z.object({
    id: z.string().uuid(),
  })
);

export const SnapshotViewByIdParams = processSchema(
  z.object({
    id: z.string().uuid(),
  })
);

export const VpcRouterRouteViewByIdParams = processSchema(
  z.object({
    id: z.string().uuid(),
  })
);

export const VpcRouterViewByIdParams = processSchema(
  z.object({
    id: z.string().uuid(),
  })
);

export const VpcSubnetViewByIdParams = processSchema(
  z.object({
    id: z.string().uuid(),
  })
);

export const VpcViewByIdParams = processSchema(
  z.object({
    id: z.string().uuid(),
  })
);

export const DeviceAuthRequestParams = processSchema(z.object({}));

export const DeviceAuthConfirmParams = processSchema(z.object({}));

export const DeviceAccessTokenParams = processSchema(z.object({}));

export const LoginSpoofParams = processSchema(z.object({}));

export const LoginSamlBeginParams = processSchema(
  z.object({
    providerName: Name,
    siloName: Name,
  })
);

export const LoginSamlParams = processSchema(
  z.object({
    providerName: Name,
    siloName: Name,
  })
);

export const LogoutParams = processSchema(z.object({}));

export const OrganizationListParams = processSchema(
  z.object({
    limit: z.number().min(1).max(4294967295).nullable().optional(),
    pageToken: z.string().nullable().optional(),
    sortBy: NameOrIdSortMode.optional(),
  })
);

export const OrganizationCreateParams = processSchema(z.object({}));

export const OrganizationViewParams = processSchema(
  z.object({
    orgName: Name,
  })
);

export const OrganizationUpdateParams = processSchema(
  z.object({
    orgName: Name,
  })
);

export const OrganizationDeleteParams = processSchema(
  z.object({
    orgName: Name,
  })
);

export const OrganizationPolicyViewParams = processSchema(
  z.object({
    orgName: Name,
  })
);

export const OrganizationPolicyUpdateParams = processSchema(
  z.object({
    orgName: Name,
  })
);

export const ProjectListParams = processSchema(
  z.object({
    limit: z.number().min(1).max(4294967295).nullable().optional(),
    pageToken: z.string().nullable().optional(),
    sortBy: NameOrIdSortMode.optional(),
    orgName: Name,
  })
);

export const ProjectCreateParams = processSchema(
  z.object({
    orgName: Name,
  })
);

export const ProjectViewParams = processSchema(
  z.object({
    orgName: Name,
    projectName: Name,
  })
);

export const ProjectUpdateParams = processSchema(
  z.object({
    orgName: Name,
    projectName: Name,
  })
);

export const ProjectDeleteParams = processSchema(
  z.object({
    orgName: Name,
    projectName: Name,
  })
);

export const DiskListParams = processSchema(
  z.object({
    limit: z.number().min(1).max(4294967295).nullable().optional(),
    pageToken: z.string().nullable().optional(),
    sortBy: NameSortMode.optional(),
    orgName: Name,
    projectName: Name,
  })
);

export const DiskCreateParams = processSchema(
  z.object({
    orgName: Name,
    projectName: Name,
  })
);

export const DiskViewParams = processSchema(
  z.object({
    diskName: Name,
    orgName: Name,
    projectName: Name,
  })
);

export const DiskDeleteParams = processSchema(
  z.object({
    diskName: Name,
    orgName: Name,
    projectName: Name,
  })
);

export const DiskMetricsListParams = processSchema(
  z.object({
    diskName: Name,
    metricName: DiskMetricName,
    orgName: Name,
    projectName: Name,
    endTime: DateType.optional(),
    limit: z.number().min(1).max(4294967295).nullable().optional(),
    pageToken: z.string().nullable().optional(),
    startTime: DateType.optional(),
  })
);

export const ImageListParams = processSchema(
  z.object({
    limit: z.number().min(1).max(4294967295).nullable().optional(),
    pageToken: z.string().nullable().optional(),
    sortBy: NameSortMode.optional(),
    orgName: Name,
    projectName: Name,
  })
);

export const ImageCreateParams = processSchema(
  z.object({
    orgName: Name,
    projectName: Name,
  })
);

export const ImageViewParams = processSchema(
  z.object({
    imageName: Name,
    orgName: Name,
    projectName: Name,
  })
);

export const ImageDeleteParams = processSchema(
  z.object({
    imageName: Name,
    orgName: Name,
    projectName: Name,
  })
);

export const InstanceListParams = processSchema(
  z.object({
    limit: z.number().min(1).max(4294967295).nullable().optional(),
    pageToken: z.string().nullable().optional(),
    sortBy: NameSortMode.optional(),
    orgName: Name,
    projectName: Name,
  })
);

export const InstanceCreateParams = processSchema(
  z.object({
    orgName: Name,
    projectName: Name,
  })
);

export const InstanceViewParams = processSchema(
  z.object({
    instanceName: Name,
    orgName: Name,
    projectName: Name,
  })
);

export const InstanceDeleteParams = processSchema(
  z.object({
    instanceName: Name,
    orgName: Name,
    projectName: Name,
  })
);

export const InstanceDiskListParams = processSchema(
  z.object({
    limit: z.number().min(1).max(4294967295).nullable().optional(),
    pageToken: z.string().nullable().optional(),
    sortBy: NameSortMode.optional(),
    instanceName: Name,
    orgName: Name,
    projectName: Name,
  })
);

export const InstanceDiskAttachParams = processSchema(
  z.object({
    instanceName: Name,
    orgName: Name,
    projectName: Name,
  })
);

export const InstanceDiskDetachParams = processSchema(
  z.object({
    instanceName: Name,
    orgName: Name,
    projectName: Name,
  })
);

export const InstanceExternalIpListParams = processSchema(
  z.object({
    instanceName: Name,
    orgName: Name,
    projectName: Name,
  })
);

export const InstanceMigrateParams = processSchema(
  z.object({
    instanceName: Name,
    orgName: Name,
    projectName: Name,
  })
);

export const InstanceNetworkInterfaceListParams = processSchema(
  z.object({
    limit: z.number().min(1).max(4294967295).nullable().optional(),
    pageToken: z.string().nullable().optional(),
    sortBy: NameSortMode.optional(),
    instanceName: Name,
    orgName: Name,
    projectName: Name,
  })
);

export const InstanceNetworkInterfaceCreateParams = processSchema(
  z.object({
    instanceName: Name,
    orgName: Name,
    projectName: Name,
  })
);

export const InstanceNetworkInterfaceViewParams = processSchema(
  z.object({
    instanceName: Name,
    interfaceName: Name,
    orgName: Name,
    projectName: Name,
  })
);

export const InstanceNetworkInterfaceUpdateParams = processSchema(
  z.object({
    instanceName: Name,
    interfaceName: Name,
    orgName: Name,
    projectName: Name,
  })
);

export const InstanceNetworkInterfaceDeleteParams = processSchema(
  z.object({
    instanceName: Name,
    interfaceName: Name,
    orgName: Name,
    projectName: Name,
  })
);

export const InstanceRebootParams = processSchema(
  z.object({
    instanceName: Name,
    orgName: Name,
    projectName: Name,
  })
);

export const InstanceSerialConsoleParams = processSchema(
  z.object({
    instanceName: Name,
    orgName: Name,
    projectName: Name,
    fromStart: z.number().min(0).nullable().optional(),
    maxBytes: z.number().min(0).nullable().optional(),
    mostRecent: z.number().min(0).nullable().optional(),
  })
);

export const InstanceStartParams = processSchema(
  z.object({
    instanceName: Name,
    orgName: Name,
    projectName: Name,
  })
);

export const InstanceStopParams = processSchema(
  z.object({
    instanceName: Name,
    orgName: Name,
    projectName: Name,
  })
);

export const ProjectPolicyViewParams = processSchema(
  z.object({
    orgName: Name,
    projectName: Name,
  })
);

export const ProjectPolicyUpdateParams = processSchema(
  z.object({
    orgName: Name,
    projectName: Name,
  })
);

export const SnapshotListParams = processSchema(
  z.object({
    limit: z.number().min(1).max(4294967295).nullable().optional(),
    pageToken: z.string().nullable().optional(),
    sortBy: NameSortMode.optional(),
    orgName: Name,
    projectName: Name,
  })
);

export const SnapshotCreateParams = processSchema(
  z.object({
    orgName: Name,
    projectName: Name,
  })
);

export const SnapshotViewParams = processSchema(
  z.object({
    orgName: Name,
    projectName: Name,
    snapshotName: Name,
  })
);

export const SnapshotDeleteParams = processSchema(
  z.object({
    orgName: Name,
    projectName: Name,
    snapshotName: Name,
  })
);

export const VpcListParams = processSchema(
  z.object({
    limit: z.number().min(1).max(4294967295).nullable().optional(),
    pageToken: z.string().nullable().optional(),
    sortBy: NameSortMode.optional(),
    orgName: Name,
    projectName: Name,
  })
);

export const VpcCreateParams = processSchema(
  z.object({
    orgName: Name,
    projectName: Name,
  })
);

export const VpcViewParams = processSchema(
  z.object({
    orgName: Name,
    projectName: Name,
    vpcName: Name,
  })
);

export const VpcUpdateParams = processSchema(
  z.object({
    orgName: Name,
    projectName: Name,
    vpcName: Name,
  })
);

export const VpcDeleteParams = processSchema(
  z.object({
    orgName: Name,
    projectName: Name,
    vpcName: Name,
  })
);

export const VpcFirewallRulesViewParams = processSchema(
  z.object({
    orgName: Name,
    projectName: Name,
    vpcName: Name,
  })
);

export const VpcFirewallRulesUpdateParams = processSchema(
  z.object({
    orgName: Name,
    projectName: Name,
    vpcName: Name,
  })
);

export const VpcRouterListParams = processSchema(
  z.object({
    limit: z.number().min(1).max(4294967295).nullable().optional(),
    pageToken: z.string().nullable().optional(),
    sortBy: NameSortMode.optional(),
    orgName: Name,
    projectName: Name,
    vpcName: Name,
  })
);

export const VpcRouterCreateParams = processSchema(
  z.object({
    orgName: Name,
    projectName: Name,
    vpcName: Name,
  })
);

export const VpcRouterViewParams = processSchema(
  z.object({
    orgName: Name,
    projectName: Name,
    routerName: Name,
    vpcName: Name,
  })
);

export const VpcRouterUpdateParams = processSchema(
  z.object({
    orgName: Name,
    projectName: Name,
    routerName: Name,
    vpcName: Name,
  })
);

export const VpcRouterDeleteParams = processSchema(
  z.object({
    orgName: Name,
    projectName: Name,
    routerName: Name,
    vpcName: Name,
  })
);

export const VpcRouterRouteListParams = processSchema(
  z.object({
    limit: z.number().min(1).max(4294967295).nullable().optional(),
    pageToken: z.string().nullable().optional(),
    sortBy: NameSortMode.optional(),
    orgName: Name,
    projectName: Name,
    routerName: Name,
    vpcName: Name,
  })
);

export const VpcRouterRouteCreateParams = processSchema(
  z.object({
    orgName: Name,
    projectName: Name,
    routerName: Name,
    vpcName: Name,
  })
);

export const VpcRouterRouteViewParams = processSchema(
  z.object({
    orgName: Name,
    projectName: Name,
    routeName: Name,
    routerName: Name,
    vpcName: Name,
  })
);

export const VpcRouterRouteUpdateParams = processSchema(
  z.object({
    orgName: Name,
    projectName: Name,
    routeName: Name,
    routerName: Name,
    vpcName: Name,
  })
);

export const VpcRouterRouteDeleteParams = processSchema(
  z.object({
    orgName: Name,
    projectName: Name,
    routeName: Name,
    routerName: Name,
    vpcName: Name,
  })
);

export const VpcSubnetListParams = processSchema(
  z.object({
    limit: z.number().min(1).max(4294967295).nullable().optional(),
    pageToken: z.string().nullable().optional(),
    sortBy: NameSortMode.optional(),
    orgName: Name,
    projectName: Name,
    vpcName: Name,
  })
);

export const VpcSubnetCreateParams = processSchema(
  z.object({
    orgName: Name,
    projectName: Name,
    vpcName: Name,
  })
);

export const VpcSubnetViewParams = processSchema(
  z.object({
    orgName: Name,
    projectName: Name,
    subnetName: Name,
    vpcName: Name,
  })
);

export const VpcSubnetUpdateParams = processSchema(
  z.object({
    orgName: Name,
    projectName: Name,
    subnetName: Name,
    vpcName: Name,
  })
);

export const VpcSubnetDeleteParams = processSchema(
  z.object({
    orgName: Name,
    projectName: Name,
    subnetName: Name,
    vpcName: Name,
  })
);

export const VpcSubnetListNetworkInterfacesParams = processSchema(
  z.object({
    limit: z.number().min(1).max(4294967295).nullable().optional(),
    pageToken: z.string().nullable().optional(),
    sortBy: NameSortMode.optional(),
    orgName: Name,
    projectName: Name,
    subnetName: Name,
    vpcName: Name,
  })
);

export const PolicyViewParams = processSchema(z.object({}));

export const PolicyUpdateParams = processSchema(z.object({}));

export const RoleListParams = processSchema(
  z.object({
    limit: z.number().min(1).max(4294967295).nullable().optional(),
    pageToken: z.string().nullable().optional(),
  })
);

export const RoleViewParams = processSchema(
  z.object({
    roleName: z.string(),
  })
);

export const SessionMeParams = processSchema(z.object({}));

export const SessionSshkeyListParams = processSchema(
  z.object({
    limit: z.number().min(1).max(4294967295).nullable().optional(),
    pageToken: z.string().nullable().optional(),
    sortBy: NameSortMode.optional(),
  })
);

export const SessionSshkeyCreateParams = processSchema(z.object({}));

export const SessionSshkeyViewParams = processSchema(
  z.object({
    sshKeyName: Name,
  })
);

export const SessionSshkeyDeleteParams = processSchema(
  z.object({
    sshKeyName: Name,
  })
);

export const SystemImageViewByIdParams = processSchema(
  z.object({
    id: z.string().uuid(),
  })
);

export const IpPoolViewByIdParams = processSchema(
  z.object({
    id: z.string().uuid(),
  })
);

export const SiloViewByIdParams = processSchema(
  z.object({
    id: z.string().uuid(),
  })
);

export const RackListParams = processSchema(
  z.object({
    limit: z.number().min(1).max(4294967295).nullable().optional(),
    pageToken: z.string().nullable().optional(),
    sortBy: IdSortMode.optional(),
  })
);

export const RackViewParams = processSchema(
  z.object({
    rackId: z.string().uuid(),
  })
);

export const SledListParams = processSchema(
  z.object({
    limit: z.number().min(1).max(4294967295).nullable().optional(),
    pageToken: z.string().nullable().optional(),
    sortBy: IdSortMode.optional(),
  })
);

export const SledViewParams = processSchema(
  z.object({
    sledId: z.string().uuid(),
  })
);

export const SystemImageListParams = processSchema(
  z.object({
    limit: z.number().min(1).max(4294967295).nullable().optional(),
    pageToken: z.string().nullable().optional(),
    sortBy: NameSortMode.optional(),
  })
);

export const SystemImageCreateParams = processSchema(z.object({}));

export const SystemImageViewParams = processSchema(
  z.object({
    imageName: Name,
  })
);

export const SystemImageDeleteParams = processSchema(
  z.object({
    imageName: Name,
  })
);

export const IpPoolListParams = processSchema(
  z.object({
    limit: z.number().min(1).max(4294967295).nullable().optional(),
    pageToken: z.string().nullable().optional(),
    sortBy: NameOrIdSortMode.optional(),
  })
);

export const IpPoolCreateParams = processSchema(z.object({}));

export const IpPoolViewParams = processSchema(
  z.object({
    poolName: Name,
  })
);

export const IpPoolUpdateParams = processSchema(
  z.object({
    poolName: Name,
  })
);

export const IpPoolDeleteParams = processSchema(
  z.object({
    poolName: Name,
  })
);

export const IpPoolRangeListParams = processSchema(
  z.object({
    poolName: Name,
    limit: z.number().min(1).max(4294967295).nullable().optional(),
    pageToken: z.string().nullable().optional(),
  })
);

export const IpPoolRangeAddParams = processSchema(
  z.object({
    poolName: Name,
  })
);

export const IpPoolRangeRemoveParams = processSchema(
  z.object({
    poolName: Name,
  })
);

export const IpPoolServiceViewParams = processSchema(
  z.object({
    rackId: z.string().uuid(),
  })
);

export const IpPoolServiceRangeListParams = processSchema(
  z.object({
    rackId: z.string().uuid(),
    limit: z.number().min(1).max(4294967295).nullable().optional(),
    pageToken: z.string().nullable().optional(),
  })
);

export const IpPoolServiceRangeAddParams = processSchema(
  z.object({
    rackId: z.string().uuid(),
  })
);

export const IpPoolServiceRangeRemoveParams = processSchema(
  z.object({
    rackId: z.string().uuid(),
  })
);

export const SystemPolicyViewParams = processSchema(z.object({}));

export const SystemPolicyUpdateParams = processSchema(z.object({}));

export const SagaListParams = processSchema(
  z.object({
    limit: z.number().min(1).max(4294967295).nullable().optional(),
    pageToken: z.string().nullable().optional(),
    sortBy: IdSortMode.optional(),
  })
);

export const SagaViewParams = processSchema(
  z.object({
    sagaId: z.string().uuid(),
  })
);

export const SiloListParams = processSchema(
  z.object({
    limit: z.number().min(1).max(4294967295).nullable().optional(),
    pageToken: z.string().nullable().optional(),
    sortBy: NameOrIdSortMode.optional(),
  })
);

export const SiloCreateParams = processSchema(z.object({}));

export const SiloViewParams = processSchema(
  z.object({
    siloName: Name,
  })
);

export const SiloDeleteParams = processSchema(
  z.object({
    siloName: Name,
  })
);

export const SiloIdentityProviderListParams = processSchema(
  z.object({
    siloName: Name,
    limit: z.number().min(1).max(4294967295).nullable().optional(),
    pageToken: z.string().nullable().optional(),
    sortBy: NameSortMode.optional(),
  })
);

export const SamlIdentityProviderCreateParams = processSchema(
  z.object({
    siloName: Name,
  })
);

export const SamlIdentityProviderViewParams = processSchema(
  z.object({
    providerName: Name,
    siloName: Name,
  })
);

export const SiloPolicyViewParams = processSchema(
  z.object({
    siloName: Name,
  })
);

export const SiloPolicyUpdateParams = processSchema(
  z.object({
    siloName: Name,
  })
);

export const UpdatesRefreshParams = processSchema(z.object({}));

export const SystemUserListParams = processSchema(
  z.object({
    limit: z.number().min(1).max(4294967295).nullable().optional(),
    pageToken: z.string().nullable().optional(),
    sortBy: NameSortMode.optional(),
  })
);

export const SystemUserViewParams = processSchema(
  z.object({
    userName: Name,
  })
);

export const TimeseriesSchemaGetParams = processSchema(
  z.object({
    limit: z.number().min(1).max(4294967295).nullable().optional(),
    pageToken: z.string().nullable().optional(),
  })
);

export const UserListParams = processSchema(
  z.object({
    limit: z.number().min(1).max(4294967295).nullable().optional(),
    pageToken: z.string().nullable().optional(),
    sortBy: IdSortMode.optional(),
  })
);
