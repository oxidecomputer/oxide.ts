/* eslint-disable */

/**
 * A count of bytes, typically used either for memory or storage capacity
 *
 * The maximum supported byte count is [`i64::MAX`].  This makes it somewhat inconvenient to define constructors: a u32 constructor can be infallible, but an i64 constructor can fail (if the value is negative) and a u64 constructor can fail (if the value is larger than i64::MAX).  We provide all of these for consumers' convenience.
 */
export type ByteCount = number;

/**
 * The type of an individual datum of a metric.
 */
export type DatumType =
  | "Bool"
  | "I64"
  | "F64"
  | "String"
  | "Bytes"
  | "CumulativeI64"
  | "CumulativeF64"
  | "HistogramI64"
  | "HistogramF64";

/**
 * Client view of an [`Disk`]
 */
export interface Disk {
  /**
   * human-readable free-form text about a resource
   */
  description: string;
  devicePath: string;
  /**
   * unique, immutable, system-controlled identifier for each resource
   */
  id: string;
  /**
   * unique, mutable, user-controlled identifier for each resource
   */
  name: Name;
  projectId: string;
  size: ByteCount;
  snapshotId?: string | null;
  state: DiskState;
  /**
   * timestamp when this resource was created
   */
  timeCreated: string;
  /**
   * timestamp when this resource was last modified
   */
  timeModified: string;
}

/**
 * Create-time parameters for a [`Disk`]
 */
export interface DiskCreate {
  description: string;
  name: Name;
  /**
   * size of the Disk
   */
  size: ByteCount;
  /**
   * id for snapshot from which the Disk should be created, if any
   */
  snapshotId?: string | null;
}

/**
 * Parameters for the [`Disk`] to be attached or detached to an instance
 */
export interface DiskIdentifier {
  disk: Name;
}

/**
 * A single page of results
 */
export interface DiskResultsPage {
  /**
   * list of items on this page of results
   */
  items: Disk[];
  /**
   * token used to fetch the next page of results (if any)
   */
  next_page?: string | null;
}

/**
 * State of a Disk (primarily: attached or not)
 */
export type DiskState =
  | { state: "creating" }
  | { state: "detached" }
  | { instance: string; state: "attaching" }
  | { instance: string; state: "attached" }
  | { instance: string; state: "detaching" }
  | { state: "destroyed" }
  | { state: "faulted" };

/**
 * The name and type information for a field of a timeseries schema.
 */
export interface FieldSchema {
  name: string;
  source: FieldSource;
  ty: FieldType;
}

/**
 * The source from which a field is derived, the target or metric.
 */
export type FieldSource = "Target" | "Metric";

/**
 * The `FieldType` identifies the data type of a target or metric field.
 */
export type FieldType = "String" | "I64" | "IpAddr" | "Uuid" | "Bool";

/**
 * Client view of an [`Instance`]
 */
export interface Instance {
  /**
   * human-readable free-form text about a resource
   */
  description: string;
  /**
   * RFC1035-compliant hostname for the Instance.
   */
  hostname: string;
  /**
   * unique, immutable, system-controlled identifier for each resource
   */
  id: string;
  /**
   * memory allocated for this Instance
   */
  memory: ByteCount;
  /**
   * unique, mutable, user-controlled identifier for each resource
   */
  name: Name;
  /**
   * number of CPUs allocated for this Instance
   */
  ncpus: InstanceCpuCount;
  /**
   * id for the project containing this Instance
   */
  projectId: string;
  runState: InstanceState;
  /**
   * timestamp when this resource was created
   */
  timeCreated: string;
  /**
   * timestamp when this resource was last modified
   */
  timeModified: string;
  timeRunStateUpdated: string;
}

/**
 * The number of CPUs in an Instance
 */
export type InstanceCpuCount = number;

/**
 * Create-time parameters for an [`Instance`]
 */
export interface InstanceCreate {
  description: string;
  hostname: string;
  memory: ByteCount;
  name: Name;
  ncpus: InstanceCpuCount;
}

/**
 * A single page of results
 */
export interface InstanceResultsPage {
  /**
   * list of items on this page of results
   */
  items: Instance[];
  /**
   * token used to fetch the next page of results (if any)
   */
  next_page?: string | null;
}

/**
 * Running state of an Instance (primarily: booted or stopped)
 *
 * This typically reflects whether it's starting, running, stopping, or stopped, but also includes states related to the Instance's lifecycle
 */
export type InstanceState =
  | "creating"
  | "starting"
  | "running"
  | "stopping"
  | "stopped"
  | "rebooting"
  | "repairing"
  | "failed"
  | "destroyed";

/**
 * An IPv4 subnet, including prefix and subnet mask
 */
export type Ipv4Net = string;

/**
 * An IPv6 subnet, including prefix and subnet mask
 */
export type Ipv6Net = string;

/**
 * An inclusive-inclusive range of IP ports. The second port may be omitted to represent a single port
 */
export type L4PortRange = string;

export interface LoginParams {
  username: string;
}

/**
 * A Media Access Control address, in EUI-48 format
 */
export type MacAddr = string;

/**
 * Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'.
 */
export type Name = string;

/**
 * A `NetworkInterface` represents a virtual network interface device.
 */
export interface NetworkInterface {
  /**
   * human-readable free-form text about a resource
   */
  description: string;
  /**
   * unique, immutable, system-controlled identifier for each resource
   */
  id: string;
  /**
   * The Instance to which the interface belongs.
   */
  instanceId: string;
  /**
   * The IP address assigned to this interface.
   */
  ip: string;
  /**
   * The MAC address assigned to this interface.
   */
  mac: MacAddr;
  /**
   * unique, mutable, user-controlled identifier for each resource
   */
  name: Name;
  /**
   * The subnet to which the interface belongs.
   */
  subnetId: string;
  /**
   * timestamp when this resource was created
   */
  timeCreated: string;
  /**
   * timestamp when this resource was last modified
   */
  timeModified: string;
  /**
   * The VPC to which the interface belongs.
   */
  vpcId: string;
}

/**
 * A single page of results
 */
export interface NetworkInterfaceResultsPage {
  /**
   * list of items on this page of results
   */
  items: NetworkInterface[];
  /**
   * token used to fetch the next page of results (if any)
   */
  next_page?: string | null;
}

/**
 * Client view of an [`Organization`]
 */
export interface Organization {
  /**
   * human-readable free-form text about a resource
   */
  description: string;
  /**
   * unique, immutable, system-controlled identifier for each resource
   */
  id: string;
  /**
   * unique, mutable, user-controlled identifier for each resource
   */
  name: Name;
  /**
   * timestamp when this resource was created
   */
  timeCreated: string;
  /**
   * timestamp when this resource was last modified
   */
  timeModified: string;
}

/**
 * Create-time parameters for an [`Organization`]
 */
export interface OrganizationCreate {
  description: string;
  name: Name;
}

/**
 * A single page of results
 */
export interface OrganizationResultsPage {
  /**
   * list of items on this page of results
   */
  items: Organization[];
  /**
   * token used to fetch the next page of results (if any)
   */
  next_page?: string | null;
}

/**
 * Updateable properties of an [`Organization`]
 */
export interface OrganizationUpdate {
  description?: string | null;
  name?: Name | null;
}

/**
 * Client view of a [`Project`]
 */
export interface Project {
  /**
   * human-readable free-form text about a resource
   */
  description: string;
  /**
   * unique, immutable, system-controlled identifier for each resource
   */
  id: string;
  /**
   * unique, mutable, user-controlled identifier for each resource
   */
  name: Name;
  organizationId: string;
  /**
   * timestamp when this resource was created
   */
  timeCreated: string;
  /**
   * timestamp when this resource was last modified
   */
  timeModified: string;
}

/**
 * Create-time parameters for a [`Project`]
 */
export interface ProjectCreate {
  description: string;
  name: Name;
}

/**
 * A single page of results
 */
export interface ProjectResultsPage {
  /**
   * list of items on this page of results
   */
  items: Project[];
  /**
   * token used to fetch the next page of results (if any)
   */
  next_page?: string | null;
}

/**
 * Updateable properties of a [`Project`]
 */
export interface ProjectUpdate {
  description?: string | null;
  name?: Name | null;
}

/**
 * Client view of an [`Rack`]
 */
export interface Rack {
  /**
   * human-readable free-form text about a resource
   */
  description: string;
  /**
   * unique, immutable, system-controlled identifier for each resource
   */
  id: string;
  /**
   * unique, mutable, user-controlled identifier for each resource
   */
  name: Name;
  /**
   * timestamp when this resource was created
   */
  timeCreated: string;
  /**
   * timestamp when this resource was last modified
   */
  timeModified: string;
}

/**
 * A single page of results
 */
export interface RackResultsPage {
  /**
   * list of items on this page of results
   */
  items: Rack[];
  /**
   * token used to fetch the next page of results (if any)
   */
  next_page?: string | null;
}

/**
 * Client view of a [`Role`]
 */
export interface Role {
  description: string;
  name: RoleName;
}

/**
 * Role names consist of two string components separated by dot (".").
 */
export type RoleName = string;

/**
 * A single page of results
 */
export interface RoleResultsPage {
  /**
   * list of items on this page of results
   */
  items: Role[];
  /**
   * token used to fetch the next page of results (if any)
   */
  next_page?: string | null;
}

/**
 * A subset of [`NetworkTarget`], `RouteDestination` specifies the kind of network traffic that will be matched to be forwarded to the [`RouteTarget`].
 */
export type RouteDestination =
  | { type: "ip"; value: string }
  | { type: "vpc"; value: Name }
  | { type: "subnet"; value: Name };

/**
 * A subset of [`NetworkTarget`], `RouteTarget` specifies all possible targets that a route can forward to.
 */
export type RouteTarget =
  | { type: "ip"; value: string }
  | { type: "vpc"; value: Name }
  | { type: "subnet"; value: Name }
  | { type: "instance"; value: Name }
  | { type: "internetGateway"; value: Name };

/**
 * A route defines a rule that governs where traffic should be sent based on its destination.
 */
export interface RouterRoute {
  /**
   * human-readable free-form text about a resource
   */
  description: string;
  destination: RouteDestination;
  /**
   * unique, immutable, system-controlled identifier for each resource
   */
  id: string;
  /**
   * Describes the kind of router. Set at creation. `read-only`
   */
  kind: RouterRouteKind;
  /**
   * unique, mutable, user-controlled identifier for each resource
   */
  name: Name;
  /**
   * The VPC Router to which the route belongs.
   */
  routerId: string;
  target: RouteTarget;
  /**
   * timestamp when this resource was created
   */
  timeCreated: string;
  /**
   * timestamp when this resource was last modified
   */
  timeModified: string;
}

/**
 * Create-time parameters for a [`RouterRoute`]
 */
export interface RouterRouteCreateParams {
  description: string;
  destination: RouteDestination;
  name: Name;
  target: RouteTarget;
}

/**
 * The classification of a [`RouterRoute`] as defined by the system. The kind determines certain attributes such as if the route is modifiable and describes how or where the route was created.
 *
 * See [RFD-21](https://rfd.shared.oxide.computer/rfd/0021#concept-router) for more context
 */
export type RouterRouteKind = "Default" | "VpcSubnet" | "VpcPeering" | "Custom";

/**
 * A single page of results
 */
export interface RouterRouteResultsPage {
  /**
   * list of items on this page of results
   */
  items: RouterRoute[];
  /**
   * token used to fetch the next page of results (if any)
   */
  next_page?: string | null;
}

/**
 * Updateable properties of a [`RouterRoute`]
 */
export interface RouterRouteUpdateParams {
  description?: string | null;
  destination: RouteDestination;
  name?: Name | null;
  target: RouteTarget;
}

export interface Saga {
  id: string;
  state: SagaState;
}

export type SagaErrorInfo =
  | { error: "actionFailed"; source_error: any }
  | { error: "deserializeFailed"; message: string }
  | { error: "injectedError" }
  | { error: "serializeFailed"; message: string }
  | { error: "subsagaCreateFailed"; message: string };

/**
 * A single page of results
 */
export interface SagaResultsPage {
  /**
   * list of items on this page of results
   */
  items: Saga[];
  /**
   * token used to fetch the next page of results (if any)
   */
  next_page?: string | null;
}

export type SagaState =
  | { state: "running" }
  | { state: "succeeded" }
  | { error_info: SagaErrorInfo; error_node_name: string; state: "failed" };

/**
 * Client view of currently authed user.
 */
export interface SessionUser {
  id: string;
}

/**
 * Client view of an [`Sled`]
 */
export interface Sled {
  /**
   * human-readable free-form text about a resource
   */
  description: string;
  /**
   * unique, immutable, system-controlled identifier for each resource
   */
  id: string;
  /**
   * unique, mutable, user-controlled identifier for each resource
   */
  name: Name;
  serviceAddress: string;
  /**
   * timestamp when this resource was created
   */
  timeCreated: string;
  /**
   * timestamp when this resource was last modified
   */
  timeModified: string;
}

/**
 * A single page of results
 */
export interface SledResultsPage {
  /**
   * list of items on this page of results
   */
  items: Sled[];
  /**
   * token used to fetch the next page of results (if any)
   */
  next_page?: string | null;
}

/**
 * Names are constructed by concatenating the target and metric names with ':'. Target and metric names must be lowercase alphanumeric characters with '_' separating words.
 */
export type TimeseriesName = string;

/**
 * The schema for a timeseries.
 *
 * This includes the name of the timeseries, as well as the datum type of its metric and the schema for each field.
 */
export interface TimeseriesSchema {
  created: string;
  datum_type: DatumType;
  field_schema: FieldSchema[];
  timeseries_name: TimeseriesName;
}

/**
 * A single page of results
 */
export interface TimeseriesSchemaResultsPage {
  /**
   * list of items on this page of results
   */
  items: TimeseriesSchema[];
  /**
   * token used to fetch the next page of results (if any)
   */
  next_page?: string | null;
}

/**
 * Client view of a [`User`]
 */
export interface User {
  /**
   * human-readable free-form text about a resource
   */
  description: string;
  /**
   * unique, immutable, system-controlled identifier for each resource
   */
  id: string;
  /**
   * unique, mutable, user-controlled identifier for each resource
   */
  name: Name;
  /**
   * timestamp when this resource was created
   */
  timeCreated: string;
  /**
   * timestamp when this resource was last modified
   */
  timeModified: string;
}

/**
 * A single page of results
 */
export interface UserResultsPage {
  /**
   * list of items on this page of results
   */
  items: User[];
  /**
   * token used to fetch the next page of results (if any)
   */
  next_page?: string | null;
}

/**
 * Client view of a [`Vpc`]
 */
export interface Vpc {
  /**
   * human-readable free-form text about a resource
   */
  description: string;
  /**
   * The name used for the VPC in DNS.
   */
  dnsName: Name;
  /**
   * unique, immutable, system-controlled identifier for each resource
   */
  id: string;
  /**
   * unique, mutable, user-controlled identifier for each resource
   */
  name: Name;
  /**
   * id for the project containing this VPC
   */
  projectId: string;
  /**
   * id for the system router where subnet default routes are registered
   */
  systemRouterId: string;
  /**
   * timestamp when this resource was created
   */
  timeCreated: string;
  /**
   * timestamp when this resource was last modified
   */
  timeModified: string;
}

/**
 * Create-time parameters for a [`Vpc`]
 */
export interface VpcCreate {
  description: string;
  dnsName: Name;
  name: Name;
}

/**
 * A single rule in a VPC firewall
 */
export interface VpcFirewallRule {
  /**
   * whether traffic matching the rule should be allowed or dropped
   */
  action: VpcFirewallRuleAction;
  /**
   * human-readable free-form text about a resource
   */
  description: string;
  /**
   * whether this rule is for incoming or outgoing traffic
   */
  direction: VpcFirewallRuleDirection;
  /**
   * reductions on the scope of the rule
   */
  filters: VpcFirewallRuleFilter;
  /**
   * unique, immutable, system-controlled identifier for each resource
   */
  id: string;
  /**
   * unique, mutable, user-controlled identifier for each resource
   */
  name: Name;
  /**
   * the relative priority of this rule
   */
  priority: number;
  /**
   * whether this rule is in effect
   */
  status: VpcFirewallRuleStatus;
  /**
   * list of sets of instances that the rule applies to
   */
  targets: VpcFirewallRuleTarget[];
  /**
   * timestamp when this resource was created
   */
  timeCreated: string;
  /**
   * timestamp when this resource was last modified
   */
  timeModified: string;
}

export type VpcFirewallRuleAction = "allow" | "deny";

export type VpcFirewallRuleDirection = "inbound" | "outbound";

/**
 * Filter for a firewall rule. A given packet must match every field that is present for the rule to apply to it. A packet matches a field if any entry in that field matches the packet.
 */
export interface VpcFirewallRuleFilter {
  /**
   * If present, the sources (if incoming) or destinations (if outgoing) this rule applies to.
   */
  hosts?: VpcFirewallRuleHostFilter[] | null;
  /**
   * If present, the destination ports this rule applies to.
   */
  ports?: L4PortRange[] | null;
  /**
   * If present, the networking protocols this rule applies to.
   */
  protocols?: VpcFirewallRuleProtocol[] | null;
}

/**
 * A subset of [`NetworkTarget`], `VpcFirewallRuleHostFilter` specifies all possible targets that a route can forward to.
 */
export type VpcFirewallRuleHostFilter =
  | { type: "vpc"; value: Name }
  | { type: "subnet"; value: Name }
  | { type: "instance"; value: Name }
  | { type: "ip"; value: string }
  | { type: "internetGateway"; value: Name };

/**
 * The protocols that may be specified in a firewall rule's filter
 */
export type VpcFirewallRuleProtocol = "TCP" | "UDP" | "ICMP";

/**
 * A single page of results
 */
export interface VpcFirewallRuleResultsPage {
  /**
   * list of items on this page of results
   */
  items: VpcFirewallRule[];
  /**
   * token used to fetch the next page of results (if any)
   */
  next_page?: string | null;
}

export type VpcFirewallRuleStatus = "disabled" | "enabled";

/**
 * A subset of [`NetworkTarget`], `VpcFirewallRuleTarget` specifies all possible targets that a firewall rule can be attached to.
 */
export type VpcFirewallRuleTarget =
  | { type: "vpc"; value: Name }
  | { type: "subnet"; value: Name }
  | { type: "instance"; value: Name };

/**
 * A single rule in a VPC firewall
 */
export interface VpcFirewallRuleUpdate {
  /**
   * whether traffic matching the rule should be allowed or dropped
   */
  action: VpcFirewallRuleAction;
  /**
   * human-readable free-form text about a resource
   */
  description: string;
  /**
   * whether this rule is for incoming or outgoing traffic
   */
  direction: VpcFirewallRuleDirection;
  /**
   * reductions on the scope of the rule
   */
  filters: VpcFirewallRuleFilter;
  /**
   * the relative priority of this rule
   */
  priority: number;
  /**
   * whether this rule is in effect
   */
  status: VpcFirewallRuleStatus;
  /**
   * list of sets of instances that the rule applies to
   */
  targets: VpcFirewallRuleTarget[];
}

/**
 * Updateable properties of a [`Vpc`]'s firewall Note that VpcFirewallRules are implicitly created along with a Vpc, so there is no explicit creation.
 */
export interface VpcFirewallRuleUpdateParams {}

/**
 * Response to an update replacing [`Vpc`]'s firewall
 */
export interface VpcFirewallRuleUpdateResult {}

/**
 * A single page of results
 */
export interface VpcResultsPage {
  /**
   * list of items on this page of results
   */
  items: Vpc[];
  /**
   * token used to fetch the next page of results (if any)
   */
  next_page?: string | null;
}

/**
 * A VPC router defines a series of rules that indicate where traffic should be sent depending on its destination.
 */
export interface VpcRouter {
  /**
   * human-readable free-form text about a resource
   */
  description: string;
  /**
   * unique, immutable, system-controlled identifier for each resource
   */
  id: string;
  kind: VpcRouterKind;
  /**
   * unique, mutable, user-controlled identifier for each resource
   */
  name: Name;
  /**
   * timestamp when this resource was created
   */
  timeCreated: string;
  /**
   * timestamp when this resource was last modified
   */
  timeModified: string;
  /**
   * The VPC to which the router belongs.
   */
  vpcId: string;
}

/**
 * Create-time parameters for a [`VpcRouter`]
 */
export interface VpcRouterCreate {
  description: string;
  name: Name;
}

export type VpcRouterKind = "system" | "custom";

/**
 * A single page of results
 */
export interface VpcRouterResultsPage {
  /**
   * list of items on this page of results
   */
  items: VpcRouter[];
  /**
   * token used to fetch the next page of results (if any)
   */
  next_page?: string | null;
}

/**
 * Updateable properties of a [`VpcRouter`]
 */
export interface VpcRouterUpdate {
  description?: string | null;
  name?: Name | null;
}

/**
 * A VPC subnet represents a logical grouping for instances that allows network traffic between them, within a IPv4 subnetwork or optionall an IPv6 subnetwork.
 */
export interface VpcSubnet {
  /**
   * human-readable free-form text about a resource
   */
  description: string;
  /**
   * unique, immutable, system-controlled identifier for each resource
   */
  id: string;
  /**
   * The IPv4 subnet CIDR block.
   */
  ipv4Block?: Ipv4Net | null;
  /**
   * The IPv6 subnet CIDR block.
   */
  ipv6Block?: Ipv6Net | null;
  /**
   * unique, mutable, user-controlled identifier for each resource
   */
  name: Name;
  /**
   * timestamp when this resource was created
   */
  timeCreated: string;
  /**
   * timestamp when this resource was last modified
   */
  timeModified: string;
  /**
   * The VPC to which the subnet belongs.
   */
  vpcId: string;
}

/**
 * Create-time parameters for a [`VpcSubnet`]
 */
export interface VpcSubnetCreate {
  description: string;
  ipv4Block?: Ipv4Net | null;
  ipv6Block?: Ipv6Net | null;
  name: Name;
}

/**
 * A single page of results
 */
export interface VpcSubnetResultsPage {
  /**
   * list of items on this page of results
   */
  items: VpcSubnet[];
  /**
   * token used to fetch the next page of results (if any)
   */
  next_page?: string | null;
}

/**
 * Updateable properties of a [`VpcSubnet`]
 */
export interface VpcSubnetUpdate {
  description?: string | null;
  ipv4Block?: Ipv4Net | null;
  ipv6Block?: Ipv6Net | null;
  name?: Name | null;
}

/**
 * Updateable properties of a [`Vpc`]
 */
export interface VpcUpdate {
  description?: string | null;
  dnsName?: Name | null;
  name?: Name | null;
}

/**
 * Supported set of sort modes for scanning by id only.
 *
 * Currently, we only support scanning in ascending order.
 */
export type IdSortMode = "id-ascending";

/**
 * Supported set of sort modes for scanning by name or id
 */
export type NameOrIdSortMode =
  | "name-ascending"
  | "name-descending"
  | "id-ascending";

/**
 * Supported set of sort modes for scanning by name only
 *
 * Currently, we only support scanning in ascending order.
 */
export type NameSortMode = "name-ascending";

export interface HardwareRacksGetParams {
  /**
   * Maximum number of items returned by a single call
   */
  limit?: number | null;

  /**
   * Token returned by previous call to retreive the subsequent page
   */
  pageToken?: string | null;

  sortBy?: IdSortMode;
}

export interface HardwareRacksGetRackParams {
  /**
   * The rack's unique ID.
   */
  rackId: string;
}

export interface HardwareSledsGetParams {
  /**
   * Maximum number of items returned by a single call
   */
  limit?: number | null;

  /**
   * Token returned by previous call to retreive the subsequent page
   */
  pageToken?: string | null;

  sortBy?: IdSortMode;
}

export interface HardwareSledsGetSledParams {
  /**
   * The sled's unique ID.
   */
  sledId: string;
}

export interface SpoofLoginParams {}

export interface LogoutParams {}

export interface OrganizationsGetParams {
  /**
   * Maximum number of items returned by a single call
   */
  limit?: number | null;

  /**
   * Token returned by previous call to retreive the subsequent page
   */
  pageToken?: string | null;

  sortBy?: NameOrIdSortMode;
}

export interface OrganizationsPostParams {}

export interface OrganizationsGetOrganizationParams {
  orgName: Name;
}

export interface OrganizationsPutOrganizationParams {
  orgName: Name;
}

export interface OrganizationsDeleteOrganizationParams {
  orgName: Name;
}

export interface OrganizationProjectsGetParams {
  /**
   * Maximum number of items returned by a single call
   */
  limit?: number | null;

  /**
   * Token returned by previous call to retreive the subsequent page
   */
  pageToken?: string | null;

  sortBy?: NameOrIdSortMode;

  orgName: Name;
}

export interface OrganizationProjectsPostParams {
  orgName: Name;
}

export interface OrganizationProjectsGetProjectParams {
  orgName: Name;

  projectName: Name;
}

export interface OrganizationProjectsPutProjectParams {
  orgName: Name;

  projectName: Name;
}

export interface OrganizationProjectsDeleteProjectParams {
  orgName: Name;

  projectName: Name;
}

export interface ProjectDisksGetParams {
  /**
   * Maximum number of items returned by a single call
   */
  limit?: number | null;

  /**
   * Token returned by previous call to retreive the subsequent page
   */
  pageToken?: string | null;

  sortBy?: NameSortMode;

  orgName: Name;

  projectName: Name;
}

export interface ProjectDisksPostParams {
  orgName: Name;

  projectName: Name;
}

export interface ProjectDisksGetDiskParams {
  diskName: Name;

  orgName: Name;

  projectName: Name;
}

export interface ProjectDisksDeleteDiskParams {
  diskName: Name;

  orgName: Name;

  projectName: Name;
}

export interface ProjectInstancesGetParams {
  /**
   * Maximum number of items returned by a single call
   */
  limit?: number | null;

  /**
   * Token returned by previous call to retreive the subsequent page
   */
  pageToken?: string | null;

  sortBy?: NameSortMode;

  orgName: Name;

  projectName: Name;
}

export interface ProjectInstancesPostParams {
  orgName: Name;

  projectName: Name;
}

export interface ProjectInstancesGetInstanceParams {
  instanceName: Name;

  orgName: Name;

  projectName: Name;
}

export interface ProjectInstancesDeleteInstanceParams {
  instanceName: Name;

  orgName: Name;

  projectName: Name;
}

export interface InstanceDisksGetParams {
  /**
   * Maximum number of items returned by a single call
   */
  limit?: number | null;

  /**
   * Token returned by previous call to retreive the subsequent page
   */
  pageToken?: string | null;

  sortBy?: NameSortMode;

  instanceName: Name;

  orgName: Name;

  projectName: Name;
}

export interface InstanceDisksAttachParams {
  instanceName: Name;

  orgName: Name;

  projectName: Name;
}

export interface InstanceDisksDetachParams {
  instanceName: Name;

  orgName: Name;

  projectName: Name;
}

export interface ProjectInstancesInstanceRebootParams {
  instanceName: Name;

  orgName: Name;

  projectName: Name;
}

export interface ProjectInstancesInstanceStartParams {
  instanceName: Name;

  orgName: Name;

  projectName: Name;
}

export interface ProjectInstancesInstanceStopParams {
  instanceName: Name;

  orgName: Name;

  projectName: Name;
}

export interface ProjectVpcsGetParams {
  /**
   * Maximum number of items returned by a single call
   */
  limit?: number | null;

  /**
   * Token returned by previous call to retreive the subsequent page
   */
  pageToken?: string | null;

  sortBy?: NameSortMode;

  orgName: Name;

  projectName: Name;
}

export interface ProjectVpcsPostParams {
  orgName: Name;

  projectName: Name;
}

export interface ProjectVpcsGetVpcParams {
  orgName: Name;

  projectName: Name;

  vpcName: Name;
}

export interface ProjectVpcsPutVpcParams {
  orgName: Name;

  projectName: Name;

  vpcName: Name;
}

export interface ProjectVpcsDeleteVpcParams {
  orgName: Name;

  projectName: Name;

  vpcName: Name;
}

export interface VpcFirewallRulesGetParams {
  /**
   * Maximum number of items returned by a single call
   */
  limit?: number | null;

  /**
   * Token returned by previous call to retreive the subsequent page
   */
  pageToken?: string | null;

  sortBy?: NameSortMode;

  orgName: Name;

  projectName: Name;

  vpcName: Name;
}

export interface VpcFirewallRulesPutParams {
  orgName: Name;

  projectName: Name;

  vpcName: Name;
}

export interface VpcRoutersGetParams {
  /**
   * Maximum number of items returned by a single call
   */
  limit?: number | null;

  /**
   * Token returned by previous call to retreive the subsequent page
   */
  pageToken?: string | null;

  sortBy?: NameSortMode;

  orgName: Name;

  projectName: Name;

  vpcName: Name;
}

export interface VpcRoutersPostParams {
  orgName: Name;

  projectName: Name;

  vpcName: Name;
}

export interface VpcRoutersGetRouterParams {
  orgName: Name;

  projectName: Name;

  routerName: Name;

  vpcName: Name;
}

export interface VpcRoutersPutRouterParams {
  orgName: Name;

  projectName: Name;

  routerName: Name;

  vpcName: Name;
}

export interface VpcRoutersDeleteRouterParams {
  orgName: Name;

  projectName: Name;

  routerName: Name;

  vpcName: Name;
}

export interface RoutersRoutesGetParams {
  /**
   * Maximum number of items returned by a single call
   */
  limit?: number | null;

  /**
   * Token returned by previous call to retreive the subsequent page
   */
  pageToken?: string | null;

  sortBy?: NameSortMode;

  orgName: Name;

  projectName: Name;

  routerName: Name;

  vpcName: Name;
}

export interface RoutersRoutesPostParams {
  orgName: Name;

  projectName: Name;

  routerName: Name;

  vpcName: Name;
}

export interface RoutersRoutesGetRouteParams {
  orgName: Name;

  projectName: Name;

  routeName: Name;

  routerName: Name;

  vpcName: Name;
}

export interface RoutersRoutesPutRouteParams {
  orgName: Name;

  projectName: Name;

  routeName: Name;

  routerName: Name;

  vpcName: Name;
}

export interface RoutersRoutesDeleteRouteParams {
  orgName: Name;

  projectName: Name;

  routeName: Name;

  routerName: Name;

  vpcName: Name;
}

export interface VpcSubnetsGetParams {
  /**
   * Maximum number of items returned by a single call
   */
  limit?: number | null;

  /**
   * Token returned by previous call to retreive the subsequent page
   */
  pageToken?: string | null;

  sortBy?: NameSortMode;

  orgName: Name;

  projectName: Name;

  vpcName: Name;
}

export interface VpcSubnetsPostParams {
  orgName: Name;

  projectName: Name;

  vpcName: Name;
}

export interface VpcSubnetsGetSubnetParams {
  orgName: Name;

  projectName: Name;

  subnetName: Name;

  vpcName: Name;
}

export interface VpcSubnetsPutSubnetParams {
  orgName: Name;

  projectName: Name;

  subnetName: Name;

  vpcName: Name;
}

export interface VpcSubnetsDeleteSubnetParams {
  orgName: Name;

  projectName: Name;

  subnetName: Name;

  vpcName: Name;
}

export interface SubnetsIpsGetParams {
  /**
   * Maximum number of items returned by a single call
   */
  limit?: number | null;

  /**
   * Token returned by previous call to retreive the subsequent page
   */
  pageToken?: string | null;

  sortBy?: NameSortMode;

  orgName: Name;

  projectName: Name;

  subnetName: Name;

  vpcName: Name;
}

export interface RolesGetParams {
  /**
   * Maximum number of items returned by a single call
   */
  limit?: number | null;

  /**
   * Token returned by previous call to retreive the subsequent page
   */
  pageToken?: string | null;
}

export interface RolesGetRoleParams {
  /**
   * The built-in role's unique name.
   */
  roleName: string;
}

export interface SagasGetParams {
  /**
   * Maximum number of items returned by a single call
   */
  limit?: number | null;

  /**
   * Token returned by previous call to retreive the subsequent page
   */
  pageToken?: string | null;

  sortBy?: IdSortMode;
}

export interface SagasGetSagaParams {
  sagaId: string;
}

export interface SessionMeParams {}

export interface TimeseriesSchemaGetParams {
  /**
   * Maximum number of items returned by a single call
   */
  limit?: number | null;

  /**
   * Token returned by previous call to retreive the subsequent page
   */
  pageToken?: string | null;
}

export interface UsersGetParams {
  /**
   * Maximum number of items returned by a single call
   */
  limit?: number | null;

  /**
   * Token returned by previous call to retreive the subsequent page
   */
  pageToken?: string | null;

  sortBy?: NameSortMode;
}

export interface UsersGetUserParams {
  userName: Name;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
}

export class HttpClient {
  public baseUrl: string = "";
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig = {}) {
    Object.assign(this, apiConfig);
  }

  private encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(
      typeof value === "number" ? value : `${value}`
    )}`;
  }

  private addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  private addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => "undefined" !== typeof query[key]
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key)
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private mergeRequestParams(params: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params,
      headers: {
        ...this.baseApiParams.headers,
        ...params.headers,
      },
    };
  }

  private createAbortSignal = (
    cancelToken: CancelToken
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const requestParams = this.mergeRequestParams(params);
    const queryString = query && this.toQueryString(query);
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${
        queryString ? `?${queryString}` : ""
      }`,
      {
        ...requestParams,
        headers: {
          ...(type && type !== ContentType.FormData
            ? { "Content-Type": type }
            : {}),
          ...(requestParams.headers || {}),
        },
        signal: cancelToken ? this.createAbortSignal(cancelToken) : void 0,
        body: JSON.stringify(body),
      }
    ).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

export class Api extends HttpClient {
  methods = {
    /**
     * List racks in the system.
     */
    hardwareRacksGet: (
      query: HardwareRacksGetParams,
      params: RequestParams = {}
    ) =>
      this.request<RackResultsPage, any>({
        path: `/hardware/racks`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * Fetch information about a particular rack.
     */
    hardwareRacksGetRack: (
      { rackId }: HardwareRacksGetRackParams,
      params: RequestParams = {}
    ) =>
      this.request<Rack, any>({
        path: `/hardware/racks/${rackId}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * List sleds in the system.
     */
    hardwareSledsGet: (
      query: HardwareSledsGetParams,
      params: RequestParams = {}
    ) =>
      this.request<SledResultsPage, any>({
        path: `/hardware/sleds`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * Fetch information about a sled in the system.
     */
    hardwareSledsGetSled: (
      { sledId }: HardwareSledsGetSledParams,
      params: RequestParams = {}
    ) =>
      this.request<Sled, any>({
        path: `/hardware/sleds/${sledId}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    spoofLogin: (
      query: SpoofLoginParams,
      data: LoginParams,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/login`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    logout: (query: LogoutParams, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/logout`,
        method: "POST",
        ...params,
      }),

    /**
     * List all organizations.
     */
    organizationsGet: (
      query: OrganizationsGetParams,
      params: RequestParams = {}
    ) =>
      this.request<OrganizationResultsPage, any>({
        path: `/organizations`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * Create a new organization.
     */
    organizationsPost: (
      query: OrganizationsPostParams,
      data: OrganizationCreate,
      params: RequestParams = {}
    ) =>
      this.request<Organization, any>({
        path: `/organizations`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * Fetch a specific organization
     */
    organizationsGetOrganization: (
      { orgName }: OrganizationsGetOrganizationParams,
      params: RequestParams = {}
    ) =>
      this.request<Organization, any>({
        path: `/organizations/${orgName}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * Update a specific organization.
     *  * TODO-correctness: Is it valid for PUT to accept application/json that's a subset of what the resource actually represents?  If not, is that a problem? (HTTP may require that this be idempotent.)  If so, can we get around that having this be a slightly different content-type (e.g., "application/json-patch")?  We should see what other APIs do.
     */
    organizationsPutOrganization: (
      { orgName }: OrganizationsPutOrganizationParams,
      data: OrganizationUpdate,
      params: RequestParams = {}
    ) =>
      this.request<Organization, any>({
        path: `/organizations/${orgName}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * Delete a specific organization.
     */
    organizationsDeleteOrganization: (
      { orgName }: OrganizationsDeleteOrganizationParams,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/organizations/${orgName}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * List all projects.
     */
    organizationProjectsGet: (
      { orgName, ...query }: OrganizationProjectsGetParams,
      params: RequestParams = {}
    ) =>
      this.request<ProjectResultsPage, any>({
        path: `/organizations/${orgName}/projects`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * Create a new project.
     */
    organizationProjectsPost: (
      { orgName }: OrganizationProjectsPostParams,
      data: ProjectCreate,
      params: RequestParams = {}
    ) =>
      this.request<Project, any>({
        path: `/organizations/${orgName}/projects`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * Fetch a specific project
     */
    organizationProjectsGetProject: (
      { orgName, projectName }: OrganizationProjectsGetProjectParams,
      params: RequestParams = {}
    ) =>
      this.request<Project, any>({
        path: `/organizations/${orgName}/projects/${projectName}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * Update a specific project.
     *  * TODO-correctness: Is it valid for PUT to accept application/json that's a subset of what the resource actually represents?  If not, is that a problem? (HTTP may require that this be idempotent.)  If so, can we get around that having this be a slightly different content-type (e.g., "application/json-patch")?  We should see what other APIs do.
     */
    organizationProjectsPutProject: (
      { orgName, projectName }: OrganizationProjectsPutProjectParams,
      data: ProjectUpdate,
      params: RequestParams = {}
    ) =>
      this.request<Project, any>({
        path: `/organizations/${orgName}/projects/${projectName}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * Delete a specific project.
     */
    organizationProjectsDeleteProject: (
      { orgName, projectName }: OrganizationProjectsDeleteProjectParams,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/organizations/${orgName}/projects/${projectName}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * List disks in a project.
     */
    projectDisksGet: (
      { orgName, projectName, ...query }: ProjectDisksGetParams,
      params: RequestParams = {}
    ) =>
      this.request<DiskResultsPage, any>({
        path: `/organizations/${orgName}/projects/${projectName}/disks`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * Create a disk in a project.
     *  * TODO-correctness See note about instance create.  This should be async.
     */
    projectDisksPost: (
      { orgName, projectName }: ProjectDisksPostParams,
      data: DiskCreate,
      params: RequestParams = {}
    ) =>
      this.request<Disk, any>({
        path: `/organizations/${orgName}/projects/${projectName}/disks`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * Fetch a single disk in a project.
     */
    projectDisksGetDisk: (
      { diskName, orgName, projectName }: ProjectDisksGetDiskParams,
      params: RequestParams = {}
    ) =>
      this.request<Disk, any>({
        path: `/organizations/${orgName}/projects/${projectName}/disks/${diskName}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * Delete a disk from a project.
     */
    projectDisksDeleteDisk: (
      { diskName, orgName, projectName }: ProjectDisksDeleteDiskParams,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/organizations/${orgName}/projects/${projectName}/disks/${diskName}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * List instances in a project.
     */
    projectInstancesGet: (
      { orgName, projectName, ...query }: ProjectInstancesGetParams,
      params: RequestParams = {}
    ) =>
      this.request<InstanceResultsPage, any>({
        path: `/organizations/${orgName}/projects/${projectName}/instances`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * Create an instance in a project.
     *  * TODO-correctness This is supposed to be async.  Is that right?  We can create the instance immediately -- it's just not booted yet.  Maybe the boot operation is what's a separate operation_id.  What about the response code (201 Created vs 202 Accepted)?  Is that orthogonal?  Things can return a useful response, including an operation id, with either response code.  Maybe a "reboot" operation would return a 202 Accepted because there's no actual resource created?
     */
    projectInstancesPost: (
      { orgName, projectName }: ProjectInstancesPostParams,
      data: InstanceCreate,
      params: RequestParams = {}
    ) =>
      this.request<Instance, any>({
        path: `/organizations/${orgName}/projects/${projectName}/instances`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * Get an instance in a project.
     */
    projectInstancesGetInstance: (
      { instanceName, orgName, projectName }: ProjectInstancesGetInstanceParams,
      params: RequestParams = {}
    ) =>
      this.request<Instance, any>({
        path: `/organizations/${orgName}/projects/${projectName}/instances/${instanceName}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * Delete an instance from a project.
     */
    projectInstancesDeleteInstance: (
      {
        instanceName,
        orgName,
        projectName,
      }: ProjectInstancesDeleteInstanceParams,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/organizations/${orgName}/projects/${projectName}/instances/${instanceName}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * List disks attached to this instance.
     */
    instanceDisksGet: (
      { instanceName, orgName, projectName, ...query }: InstanceDisksGetParams,
      params: RequestParams = {}
    ) =>
      this.request<DiskResultsPage, any>({
        path: `/organizations/${orgName}/projects/${projectName}/instances/${instanceName}/disks`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    instanceDisksAttach: (
      { instanceName, orgName, projectName }: InstanceDisksAttachParams,
      data: DiskIdentifier,
      params: RequestParams = {}
    ) =>
      this.request<Disk, any>({
        path: `/organizations/${orgName}/projects/${projectName}/instances/${instanceName}/disks/attach`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    instanceDisksDetach: (
      { instanceName, orgName, projectName }: InstanceDisksDetachParams,
      data: DiskIdentifier,
      params: RequestParams = {}
    ) =>
      this.request<Disk, any>({
        path: `/organizations/${orgName}/projects/${projectName}/instances/${instanceName}/disks/detach`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * Reboot an instance.
     */
    projectInstancesInstanceReboot: (
      {
        instanceName,
        orgName,
        projectName,
      }: ProjectInstancesInstanceRebootParams,
      params: RequestParams = {}
    ) =>
      this.request<Instance, any>({
        path: `/organizations/${orgName}/projects/${projectName}/instances/${instanceName}/reboot`,
        method: "POST",
        format: "json",
        ...params,
      }),

    /**
     * Boot an instance.
     */
    projectInstancesInstanceStart: (
      {
        instanceName,
        orgName,
        projectName,
      }: ProjectInstancesInstanceStartParams,
      params: RequestParams = {}
    ) =>
      this.request<Instance, any>({
        path: `/organizations/${orgName}/projects/${projectName}/instances/${instanceName}/start`,
        method: "POST",
        format: "json",
        ...params,
      }),

    /**
     * Halt an instance.
     */
    projectInstancesInstanceStop: (
      {
        instanceName,
        orgName,
        projectName,
      }: ProjectInstancesInstanceStopParams,
      params: RequestParams = {}
    ) =>
      this.request<Instance, any>({
        path: `/organizations/${orgName}/projects/${projectName}/instances/${instanceName}/stop`,
        method: "POST",
        format: "json",
        ...params,
      }),

    /**
     * List VPCs in a project.
     */
    projectVpcsGet: (
      { orgName, projectName, ...query }: ProjectVpcsGetParams,
      params: RequestParams = {}
    ) =>
      this.request<VpcResultsPage, any>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * Create a VPC in a project.
     */
    projectVpcsPost: (
      { orgName, projectName }: ProjectVpcsPostParams,
      data: VpcCreate,
      params: RequestParams = {}
    ) =>
      this.request<Vpc, any>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * Get a VPC in a project.
     */
    projectVpcsGetVpc: (
      { orgName, projectName, vpcName }: ProjectVpcsGetVpcParams,
      params: RequestParams = {}
    ) =>
      this.request<Vpc, any>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * Update a VPC.
     */
    projectVpcsPutVpc: (
      { orgName, projectName, vpcName }: ProjectVpcsPutVpcParams,
      data: VpcUpdate,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * Delete a vpc from a project.
     */
    projectVpcsDeleteVpc: (
      { orgName, projectName, vpcName }: ProjectVpcsDeleteVpcParams,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * List firewall rules for a VPC.
     */
    vpcFirewallRulesGet: (
      { orgName, projectName, vpcName, ...query }: VpcFirewallRulesGetParams,
      params: RequestParams = {}
    ) =>
      this.request<VpcFirewallRuleResultsPage, any>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/firewall/rules`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * Replace the firewall rules for a VPC
     */
    vpcFirewallRulesPut: (
      { orgName, projectName, vpcName }: VpcFirewallRulesPutParams,
      data: VpcFirewallRuleUpdateParams,
      params: RequestParams = {}
    ) =>
      this.request<VpcFirewallRuleUpdateResult, any>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/firewall/rules`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * List VPC Custom and System Routers
     */
    vpcRoutersGet: (
      { orgName, projectName, vpcName, ...query }: VpcRoutersGetParams,
      params: RequestParams = {}
    ) =>
      this.request<VpcRouterResultsPage, any>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/routers`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * Create a VPC Router
     */
    vpcRoutersPost: (
      { orgName, projectName, vpcName }: VpcRoutersPostParams,
      data: VpcRouterCreate,
      params: RequestParams = {}
    ) =>
      this.request<VpcRouter, any>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/routers`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * Get a VPC Router
     */
    vpcRoutersGetRouter: (
      { orgName, projectName, routerName, vpcName }: VpcRoutersGetRouterParams,
      params: RequestParams = {}
    ) =>
      this.request<VpcRouter, any>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/routers/${routerName}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * Update a VPC Router
     */
    vpcRoutersPutRouter: (
      { orgName, projectName, routerName, vpcName }: VpcRoutersPutRouterParams,
      data: VpcRouterUpdate,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/routers/${routerName}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * Delete a router from its VPC
     */
    vpcRoutersDeleteRouter: (
      {
        orgName,
        projectName,
        routerName,
        vpcName,
      }: VpcRoutersDeleteRouterParams,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/routers/${routerName}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * List a Router's routes
     */
    routersRoutesGet: (
      {
        orgName,
        projectName,
        routerName,
        vpcName,
        ...query
      }: RoutersRoutesGetParams,
      params: RequestParams = {}
    ) =>
      this.request<RouterRouteResultsPage, any>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/routers/${routerName}/routes`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * Create a VPC Router
     */
    routersRoutesPost: (
      { orgName, projectName, routerName, vpcName }: RoutersRoutesPostParams,
      data: RouterRouteCreateParams,
      params: RequestParams = {}
    ) =>
      this.request<RouterRoute, any>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/routers/${routerName}/routes`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * Get a VPC Router route
     */
    routersRoutesGetRoute: (
      {
        orgName,
        projectName,
        routeName,
        routerName,
        vpcName,
      }: RoutersRoutesGetRouteParams,
      params: RequestParams = {}
    ) =>
      this.request<RouterRoute, any>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/routers/${routerName}/routes/${routeName}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * Update a Router route
     */
    routersRoutesPutRoute: (
      {
        orgName,
        projectName,
        routeName,
        routerName,
        vpcName,
      }: RoutersRoutesPutRouteParams,
      data: RouterRouteUpdateParams,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/routers/${routerName}/routes/${routeName}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * Delete a route from its router
     */
    routersRoutesDeleteRoute: (
      {
        orgName,
        projectName,
        routeName,
        routerName,
        vpcName,
      }: RoutersRoutesDeleteRouteParams,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/routers/${routerName}/routes/${routeName}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * List subnets in a VPC.
     */
    vpcSubnetsGet: (
      { orgName, projectName, vpcName, ...query }: VpcSubnetsGetParams,
      params: RequestParams = {}
    ) =>
      this.request<VpcSubnetResultsPage, any>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/subnets`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * Create a subnet in a VPC.
     */
    vpcSubnetsPost: (
      { orgName, projectName, vpcName }: VpcSubnetsPostParams,
      data: VpcSubnetCreate,
      params: RequestParams = {}
    ) =>
      this.request<VpcSubnet, any>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/subnets`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * Get subnet in a VPC.
     */
    vpcSubnetsGetSubnet: (
      { orgName, projectName, subnetName, vpcName }: VpcSubnetsGetSubnetParams,
      params: RequestParams = {}
    ) =>
      this.request<VpcSubnet, any>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/subnets/${subnetName}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * Update a VPC Subnet.
     */
    vpcSubnetsPutSubnet: (
      { orgName, projectName, subnetName, vpcName }: VpcSubnetsPutSubnetParams,
      data: VpcSubnetUpdate,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/subnets/${subnetName}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * Delete a subnet from a VPC.
     */
    vpcSubnetsDeleteSubnet: (
      {
        orgName,
        projectName,
        subnetName,
        vpcName,
      }: VpcSubnetsDeleteSubnetParams,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/subnets/${subnetName}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * List IP addresses on a VPC subnet.
     */
    subnetsIpsGet: (
      {
        orgName,
        projectName,
        subnetName,
        vpcName,
        ...query
      }: SubnetsIpsGetParams,
      params: RequestParams = {}
    ) =>
      this.request<NetworkInterfaceResultsPage, any>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/subnets/${subnetName}/ips`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * List the built-in roles
     */
    rolesGet: (query: RolesGetParams, params: RequestParams = {}) =>
      this.request<RoleResultsPage, any>({
        path: `/roles`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * Fetch a specific built-in role
     */
    rolesGetRole: (
      { roleName }: RolesGetRoleParams,
      params: RequestParams = {}
    ) =>
      this.request<Role, any>({
        path: `/roles/${roleName}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * List all sagas (for debugging)
     */
    sagasGet: (query: SagasGetParams, params: RequestParams = {}) =>
      this.request<SagaResultsPage, any>({
        path: `/sagas`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * Fetch information about a single saga (for debugging)
     */
    sagasGetSaga: (
      { sagaId }: SagasGetSagaParams,
      params: RequestParams = {}
    ) =>
      this.request<Saga, any>({
        path: `/sagas/${sagaId}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * Fetch the user associated with the current session
     */
    sessionMe: (query: SessionMeParams, params: RequestParams = {}) =>
      this.request<SessionUser, any>({
        path: `/session/me`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * List all timeseries schema
     */
    timeseriesSchemaGet: (
      query: TimeseriesSchemaGetParams,
      params: RequestParams = {}
    ) =>
      this.request<TimeseriesSchemaResultsPage, any>({
        path: `/timeseries/schema`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * List the built-in system users
     */
    usersGet: (query: UsersGetParams, params: RequestParams = {}) =>
      this.request<UserResultsPage, any>({
        path: `/users`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * Fetch a specific built-in system user
     */
    usersGetUser: (
      { userName }: UsersGetUserParams,
      params: RequestParams = {}
    ) =>
      this.request<User, any>({
        path: `/users/${userName}`,
        method: "GET",
        format: "json",
        ...params,
      }),
  };
}
