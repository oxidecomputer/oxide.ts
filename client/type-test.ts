import { z } from "zod";
import { assert, Equals } from "tsafe";
import type {
  BinRangedouble as BinRangedouble_Type,
  BinRangeint64 as BinRangeint64_Type,
  Bindouble as Bindouble_Type,
  Binint64 as Binint64_Type,
  BlockSize as BlockSize_Type,
  ByteCount as ByteCount_Type,
  Cumulativedouble as Cumulativedouble_Type,
  Cumulativeint64 as Cumulativeint64_Type,
  Histogramint64 as Histogramint64_Type,
  Histogramdouble as Histogramdouble_Type,
  Datum as Datum_Type,
  DatumType as DatumType_Type,
  DerEncodedKeyPair as DerEncodedKeyPair_Type,
  DeviceAccessTokenRequest as DeviceAccessTokenRequest_Type,
  DeviceAuthRequest as DeviceAuthRequest_Type,
  DeviceAuthVerify as DeviceAuthVerify_Type,
  Digest as Digest_Type,
  Name as Name_Type,
  DiskState as DiskState_Type,
  Disk as Disk_Type,
  DiskSource as DiskSource_Type,
  DiskCreate as DiskCreate_Type,
  DiskIdentifier as DiskIdentifier_Type,
  DiskResultsPage as DiskResultsPage_Type,
  Distribution as Distribution_Type,
  IpKind as IpKind_Type,
  ExternalIp as ExternalIp_Type,
  ExternalIpCreate as ExternalIpCreate_Type,
  ExternalIpResultsPage as ExternalIpResultsPage_Type,
  FieldSource as FieldSource_Type,
  FieldType as FieldType_Type,
  FieldSchema as FieldSchema_Type,
  FleetRole as FleetRole_Type,
  IdentityType as IdentityType_Type,
  FleetRoleRoleAssignment as FleetRoleRoleAssignment_Type,
  FleetRolePolicy as FleetRolePolicy_Type,
  GlobalImage as GlobalImage_Type,
  ImageSource as ImageSource_Type,
  GlobalImageCreate as GlobalImageCreate_Type,
  GlobalImageResultsPage as GlobalImageResultsPage_Type,
  IdentityProviderType as IdentityProviderType_Type,
  IdentityProvider as IdentityProvider_Type,
  IdentityProviderResultsPage as IdentityProviderResultsPage_Type,
  IdpMetadataSource as IdpMetadataSource_Type,
  Image as Image_Type,
  ImageCreate as ImageCreate_Type,
  ImageResultsPage as ImageResultsPage_Type,
  InstanceCpuCount as InstanceCpuCount_Type,
  InstanceState as InstanceState_Type,
  Instance as Instance_Type,
  InstanceDiskAttachment as InstanceDiskAttachment_Type,
  NetworkInterfaceCreate as NetworkInterfaceCreate_Type,
  InstanceNetworkInterfaceAttachment as InstanceNetworkInterfaceAttachment_Type,
  InstanceCreate as InstanceCreate_Type,
  InstanceMigrate as InstanceMigrate_Type,
  InstanceResultsPage as InstanceResultsPage_Type,
  InstanceSerialConsoleData as InstanceSerialConsoleData_Type,
  Ipv4Net as Ipv4Net_Type,
  Ipv6Net as Ipv6Net_Type,
  IpNet as IpNet_Type,
  IpPool as IpPool_Type,
  IpPoolCreate as IpPoolCreate_Type,
  Ipv4Range as Ipv4Range_Type,
  Ipv6Range as Ipv6Range_Type,
  IpRange as IpRange_Type,
  IpPoolRange as IpPoolRange_Type,
  IpPoolRangeResultsPage as IpPoolRangeResultsPage_Type,
  IpPoolResultsPage as IpPoolResultsPage_Type,
  IpPoolUpdate as IpPoolUpdate_Type,
  L4PortRange as L4PortRange_Type,
  MacAddr as MacAddr_Type,
  Measurement as Measurement_Type,
  MeasurementResultsPage as MeasurementResultsPage_Type,
  NetworkInterface as NetworkInterface_Type,
  NetworkInterfaceResultsPage as NetworkInterfaceResultsPage_Type,
  NetworkInterfaceUpdate as NetworkInterfaceUpdate_Type,
  NodeName as NodeName_Type,
  Organization as Organization_Type,
  OrganizationCreate as OrganizationCreate_Type,
  OrganizationResultsPage as OrganizationResultsPage_Type,
  OrganizationRole as OrganizationRole_Type,
  OrganizationRoleRoleAssignment as OrganizationRoleRoleAssignment_Type,
  OrganizationRolePolicy as OrganizationRolePolicy_Type,
  OrganizationUpdate as OrganizationUpdate_Type,
  Project as Project_Type,
  ProjectCreate as ProjectCreate_Type,
  ProjectResultsPage as ProjectResultsPage_Type,
  ProjectRole as ProjectRole_Type,
  ProjectRoleRoleAssignment as ProjectRoleRoleAssignment_Type,
  ProjectRolePolicy as ProjectRolePolicy_Type,
  ProjectUpdate as ProjectUpdate_Type,
  Rack as Rack_Type,
  RackResultsPage as RackResultsPage_Type,
  RoleName as RoleName_Type,
  Role as Role_Type,
  RoleResultsPage as RoleResultsPage_Type,
  RouteDestination as RouteDestination_Type,
  RouteTarget as RouteTarget_Type,
  RouterRouteKind as RouterRouteKind_Type,
  RouterRoute as RouterRoute_Type,
  RouterRouteCreateParams as RouterRouteCreateParams_Type,
  RouterRouteResultsPage as RouterRouteResultsPage_Type,
  RouterRouteUpdateParams as RouterRouteUpdateParams_Type,
  SagaErrorInfo as SagaErrorInfo_Type,
  SagaState as SagaState_Type,
  Saga as Saga_Type,
  SagaResultsPage as SagaResultsPage_Type,
  SamlIdentityProvider as SamlIdentityProvider_Type,
  SamlIdentityProviderCreate as SamlIdentityProviderCreate_Type,
  SiloIdentityMode as SiloIdentityMode_Type,
  Silo as Silo_Type,
  SiloCreate as SiloCreate_Type,
  SiloResultsPage as SiloResultsPage_Type,
  SiloRole as SiloRole_Type,
  SiloRoleRoleAssignment as SiloRoleRoleAssignment_Type,
  SiloRolePolicy as SiloRolePolicy_Type,
  Sled as Sled_Type,
  SledResultsPage as SledResultsPage_Type,
  SnapshotState as SnapshotState_Type,
  Snapshot as Snapshot_Type,
  SnapshotCreate as SnapshotCreate_Type,
  SnapshotResultsPage as SnapshotResultsPage_Type,
  SpoofLoginBody as SpoofLoginBody_Type,
  SshKey as SshKey_Type,
  SshKeyCreate as SshKeyCreate_Type,
  SshKeyResultsPage as SshKeyResultsPage_Type,
  TimeseriesName as TimeseriesName_Type,
  TimeseriesSchema as TimeseriesSchema_Type,
  TimeseriesSchemaResultsPage as TimeseriesSchemaResultsPage_Type,
  User as User_Type,
  UserBuiltin as UserBuiltin_Type,
  UserBuiltinResultsPage as UserBuiltinResultsPage_Type,
  UserResultsPage as UserResultsPage_Type,
  Vpc as Vpc_Type,
  VpcCreate as VpcCreate_Type,
  VpcFirewallRuleAction as VpcFirewallRuleAction_Type,
  VpcFirewallRuleDirection as VpcFirewallRuleDirection_Type,
  VpcFirewallRuleHostFilter as VpcFirewallRuleHostFilter_Type,
  VpcFirewallRuleProtocol as VpcFirewallRuleProtocol_Type,
  VpcFirewallRuleFilter as VpcFirewallRuleFilter_Type,
  VpcFirewallRuleStatus as VpcFirewallRuleStatus_Type,
  VpcFirewallRuleTarget as VpcFirewallRuleTarget_Type,
  VpcFirewallRule as VpcFirewallRule_Type,
  VpcFirewallRuleUpdate as VpcFirewallRuleUpdate_Type,
  VpcFirewallRuleUpdateParams as VpcFirewallRuleUpdateParams_Type,
  VpcFirewallRules as VpcFirewallRules_Type,
  VpcResultsPage as VpcResultsPage_Type,
  VpcRouterKind as VpcRouterKind_Type,
  VpcRouter as VpcRouter_Type,
  VpcRouterCreate as VpcRouterCreate_Type,
  VpcRouterResultsPage as VpcRouterResultsPage_Type,
  VpcRouterUpdate as VpcRouterUpdate_Type,
  VpcSubnet as VpcSubnet_Type,
  VpcSubnetCreate as VpcSubnetCreate_Type,
  VpcSubnetResultsPage as VpcSubnetResultsPage_Type,
  VpcSubnetUpdate as VpcSubnetUpdate_Type,
  VpcUpdate as VpcUpdate_Type,
  NameOrIdSortMode as NameOrIdSortMode_Type,
  NameSortMode as NameSortMode_Type,
  DiskMetricName as DiskMetricName_Type,
  IdSortMode as IdSortMode_Type,
} from "./Api";
import {
  BinRangedouble,
  BinRangeint64,
  Bindouble,
  Binint64,
  BlockSize,
  ByteCount,
  Cumulativedouble,
  Cumulativeint64,
  Histogramint64,
  Histogramdouble,
  Datum,
  DatumType,
  DerEncodedKeyPair,
  DeviceAccessTokenRequest,
  DeviceAuthRequest,
  DeviceAuthVerify,
  Digest,
  Name,
  DiskState,
  Disk,
  DiskSource,
  DiskCreate,
  DiskIdentifier,
  DiskResultsPage,
  Distribution,
  IpKind,
  ExternalIp,
  ExternalIpCreate,
  ExternalIpResultsPage,
  FieldSource,
  FieldType,
  FieldSchema,
  FleetRole,
  IdentityType,
  FleetRoleRoleAssignment,
  FleetRolePolicy,
  GlobalImage,
  ImageSource,
  GlobalImageCreate,
  GlobalImageResultsPage,
  IdentityProviderType,
  IdentityProvider,
  IdentityProviderResultsPage,
  IdpMetadataSource,
  Image,
  ImageCreate,
  ImageResultsPage,
  InstanceCpuCount,
  InstanceState,
  Instance,
  InstanceDiskAttachment,
  NetworkInterfaceCreate,
  InstanceNetworkInterfaceAttachment,
  InstanceCreate,
  InstanceMigrate,
  InstanceResultsPage,
  InstanceSerialConsoleData,
  Ipv4Net,
  Ipv6Net,
  IpNet,
  IpPool,
  IpPoolCreate,
  Ipv4Range,
  Ipv6Range,
  IpRange,
  IpPoolRange,
  IpPoolRangeResultsPage,
  IpPoolResultsPage,
  IpPoolUpdate,
  L4PortRange,
  MacAddr,
  Measurement,
  MeasurementResultsPage,
  NetworkInterface,
  NetworkInterfaceResultsPage,
  NetworkInterfaceUpdate,
  NodeName,
  Organization,
  OrganizationCreate,
  OrganizationResultsPage,
  OrganizationRole,
  OrganizationRoleRoleAssignment,
  OrganizationRolePolicy,
  OrganizationUpdate,
  Project,
  ProjectCreate,
  ProjectResultsPage,
  ProjectRole,
  ProjectRoleRoleAssignment,
  ProjectRolePolicy,
  ProjectUpdate,
  Rack,
  RackResultsPage,
  RoleName,
  Role,
  RoleResultsPage,
  RouteDestination,
  RouteTarget,
  RouterRouteKind,
  RouterRoute,
  RouterRouteCreateParams,
  RouterRouteResultsPage,
  RouterRouteUpdateParams,
  SagaErrorInfo,
  SagaState,
  Saga,
  SagaResultsPage,
  SamlIdentityProvider,
  SamlIdentityProviderCreate,
  SiloIdentityMode,
  Silo,
  SiloCreate,
  SiloResultsPage,
  SiloRole,
  SiloRoleRoleAssignment,
  SiloRolePolicy,
  Sled,
  SledResultsPage,
  SnapshotState,
  Snapshot,
  SnapshotCreate,
  SnapshotResultsPage,
  SpoofLoginBody,
  SshKey,
  SshKeyCreate,
  SshKeyResultsPage,
  TimeseriesName,
  TimeseriesSchema,
  TimeseriesSchemaResultsPage,
  User,
  UserBuiltin,
  UserBuiltinResultsPage,
  UserResultsPage,
  Vpc,
  VpcCreate,
  VpcFirewallRuleAction,
  VpcFirewallRuleDirection,
  VpcFirewallRuleHostFilter,
  VpcFirewallRuleProtocol,
  VpcFirewallRuleFilter,
  VpcFirewallRuleStatus,
  VpcFirewallRuleTarget,
  VpcFirewallRule,
  VpcFirewallRuleUpdate,
  VpcFirewallRuleUpdateParams,
  VpcFirewallRules,
  VpcResultsPage,
  VpcRouterKind,
  VpcRouter,
  VpcRouterCreate,
  VpcRouterResultsPage,
  VpcRouterUpdate,
  VpcSubnet,
  VpcSubnetCreate,
  VpcSubnetResultsPage,
  VpcSubnetUpdate,
  VpcUpdate,
  NameOrIdSortMode,
  NameSortMode,
  DiskMetricName,
  IdSortMode,
} from "./validate";
assert<Equals<BinRangedouble_Type, z.infer<typeof BinRangedouble>>>();
assert<Equals<BinRangeint64_Type, z.infer<typeof BinRangeint64>>>();
assert<Equals<Bindouble_Type, z.infer<typeof Bindouble>>>();
assert<Equals<Binint64_Type, z.infer<typeof Binint64>>>();
assert<Equals<BlockSize_Type, z.infer<typeof BlockSize>>>();
assert<Equals<ByteCount_Type, z.infer<typeof ByteCount>>>();
assert<Equals<Cumulativedouble_Type, z.infer<typeof Cumulativedouble>>>();
assert<Equals<Cumulativeint64_Type, z.infer<typeof Cumulativeint64>>>();
assert<Equals<Histogramint64_Type, z.infer<typeof Histogramint64>>>();
assert<Equals<Histogramdouble_Type, z.infer<typeof Histogramdouble>>>();
assert<Equals<Datum_Type, z.infer<typeof Datum>>>();
assert<Equals<DatumType_Type, z.infer<typeof DatumType>>>();
assert<Equals<DerEncodedKeyPair_Type, z.infer<typeof DerEncodedKeyPair>>>();
assert<
  Equals<
    DeviceAccessTokenRequest_Type,
    z.infer<typeof DeviceAccessTokenRequest>
  >
>();
assert<Equals<DeviceAuthRequest_Type, z.infer<typeof DeviceAuthRequest>>>();
assert<Equals<DeviceAuthVerify_Type, z.infer<typeof DeviceAuthVerify>>>();
assert<Equals<Digest_Type, z.infer<typeof Digest>>>();
assert<Equals<Name_Type, z.infer<typeof Name>>>();
assert<Equals<DiskState_Type, z.infer<typeof DiskState>>>();
assert<Equals<Disk_Type, z.infer<typeof Disk>>>();
assert<Equals<DiskSource_Type, z.infer<typeof DiskSource>>>();
assert<Equals<DiskCreate_Type, z.infer<typeof DiskCreate>>>();
assert<Equals<DiskIdentifier_Type, z.infer<typeof DiskIdentifier>>>();
assert<Equals<DiskResultsPage_Type, z.infer<typeof DiskResultsPage>>>();
assert<Equals<Distribution_Type, z.infer<typeof Distribution>>>();
assert<Equals<IpKind_Type, z.infer<typeof IpKind>>>();
assert<Equals<ExternalIp_Type, z.infer<typeof ExternalIp>>>();
assert<Equals<ExternalIpCreate_Type, z.infer<typeof ExternalIpCreate>>>();
assert<
  Equals<ExternalIpResultsPage_Type, z.infer<typeof ExternalIpResultsPage>>
>();
assert<Equals<FieldSource_Type, z.infer<typeof FieldSource>>>();
assert<Equals<FieldType_Type, z.infer<typeof FieldType>>>();
assert<Equals<FieldSchema_Type, z.infer<typeof FieldSchema>>>();
assert<Equals<FleetRole_Type, z.infer<typeof FleetRole>>>();
assert<Equals<IdentityType_Type, z.infer<typeof IdentityType>>>();
assert<
  Equals<FleetRoleRoleAssignment_Type, z.infer<typeof FleetRoleRoleAssignment>>
>();
assert<Equals<FleetRolePolicy_Type, z.infer<typeof FleetRolePolicy>>>();
assert<Equals<GlobalImage_Type, z.infer<typeof GlobalImage>>>();
assert<Equals<ImageSource_Type, z.infer<typeof ImageSource>>>();
assert<Equals<GlobalImageCreate_Type, z.infer<typeof GlobalImageCreate>>>();
assert<
  Equals<GlobalImageResultsPage_Type, z.infer<typeof GlobalImageResultsPage>>
>();
assert<
  Equals<IdentityProviderType_Type, z.infer<typeof IdentityProviderType>>
>();
assert<Equals<IdentityProvider_Type, z.infer<typeof IdentityProvider>>>();
assert<
  Equals<
    IdentityProviderResultsPage_Type,
    z.infer<typeof IdentityProviderResultsPage>
  >
>();
assert<Equals<IdpMetadataSource_Type, z.infer<typeof IdpMetadataSource>>>();
assert<Equals<Image_Type, z.infer<typeof Image>>>();
assert<Equals<ImageCreate_Type, z.infer<typeof ImageCreate>>>();
assert<Equals<ImageResultsPage_Type, z.infer<typeof ImageResultsPage>>>();
assert<Equals<InstanceCpuCount_Type, z.infer<typeof InstanceCpuCount>>>();
assert<Equals<InstanceState_Type, z.infer<typeof InstanceState>>>();
assert<Equals<Instance_Type, z.infer<typeof Instance>>>();
assert<
  Equals<InstanceDiskAttachment_Type, z.infer<typeof InstanceDiskAttachment>>
>();
assert<
  Equals<NetworkInterfaceCreate_Type, z.infer<typeof NetworkInterfaceCreate>>
>();
assert<
  Equals<
    InstanceNetworkInterfaceAttachment_Type,
    z.infer<typeof InstanceNetworkInterfaceAttachment>
  >
>();
assert<Equals<InstanceCreate_Type, z.infer<typeof InstanceCreate>>>();
assert<Equals<InstanceMigrate_Type, z.infer<typeof InstanceMigrate>>>();
assert<Equals<InstanceResultsPage_Type, z.infer<typeof InstanceResultsPage>>>();
assert<
  Equals<
    InstanceSerialConsoleData_Type,
    z.infer<typeof InstanceSerialConsoleData>
  >
>();
assert<Equals<Ipv4Net_Type, z.infer<typeof Ipv4Net>>>();
assert<Equals<Ipv6Net_Type, z.infer<typeof Ipv6Net>>>();
assert<Equals<IpNet_Type, z.infer<typeof IpNet>>>();
assert<Equals<IpPool_Type, z.infer<typeof IpPool>>>();
assert<Equals<IpPoolCreate_Type, z.infer<typeof IpPoolCreate>>>();
assert<Equals<Ipv4Range_Type, z.infer<typeof Ipv4Range>>>();
assert<Equals<Ipv6Range_Type, z.infer<typeof Ipv6Range>>>();
assert<Equals<IpRange_Type, z.infer<typeof IpRange>>>();
assert<Equals<IpPoolRange_Type, z.infer<typeof IpPoolRange>>>();
assert<
  Equals<IpPoolRangeResultsPage_Type, z.infer<typeof IpPoolRangeResultsPage>>
>();
assert<Equals<IpPoolResultsPage_Type, z.infer<typeof IpPoolResultsPage>>>();
assert<Equals<IpPoolUpdate_Type, z.infer<typeof IpPoolUpdate>>>();
assert<Equals<L4PortRange_Type, z.infer<typeof L4PortRange>>>();
assert<Equals<MacAddr_Type, z.infer<typeof MacAddr>>>();
assert<Equals<Measurement_Type, z.infer<typeof Measurement>>>();
assert<
  Equals<MeasurementResultsPage_Type, z.infer<typeof MeasurementResultsPage>>
>();
assert<Equals<NetworkInterface_Type, z.infer<typeof NetworkInterface>>>();
assert<
  Equals<
    NetworkInterfaceResultsPage_Type,
    z.infer<typeof NetworkInterfaceResultsPage>
  >
>();
assert<
  Equals<NetworkInterfaceUpdate_Type, z.infer<typeof NetworkInterfaceUpdate>>
>();
assert<Equals<NodeName_Type, z.infer<typeof NodeName>>>();
assert<Equals<Organization_Type, z.infer<typeof Organization>>>();
assert<Equals<OrganizationCreate_Type, z.infer<typeof OrganizationCreate>>>();
assert<
  Equals<OrganizationResultsPage_Type, z.infer<typeof OrganizationResultsPage>>
>();
assert<Equals<OrganizationRole_Type, z.infer<typeof OrganizationRole>>>();
assert<
  Equals<
    OrganizationRoleRoleAssignment_Type,
    z.infer<typeof OrganizationRoleRoleAssignment>
  >
>();
assert<
  Equals<OrganizationRolePolicy_Type, z.infer<typeof OrganizationRolePolicy>>
>();
assert<Equals<OrganizationUpdate_Type, z.infer<typeof OrganizationUpdate>>>();
assert<Equals<Project_Type, z.infer<typeof Project>>>();
assert<Equals<ProjectCreate_Type, z.infer<typeof ProjectCreate>>>();
assert<Equals<ProjectResultsPage_Type, z.infer<typeof ProjectResultsPage>>>();
assert<Equals<ProjectRole_Type, z.infer<typeof ProjectRole>>>();
assert<
  Equals<
    ProjectRoleRoleAssignment_Type,
    z.infer<typeof ProjectRoleRoleAssignment>
  >
>();
assert<Equals<ProjectRolePolicy_Type, z.infer<typeof ProjectRolePolicy>>>();
assert<Equals<ProjectUpdate_Type, z.infer<typeof ProjectUpdate>>>();
assert<Equals<Rack_Type, z.infer<typeof Rack>>>();
assert<Equals<RackResultsPage_Type, z.infer<typeof RackResultsPage>>>();
assert<Equals<RoleName_Type, z.infer<typeof RoleName>>>();
assert<Equals<Role_Type, z.infer<typeof Role>>>();
assert<Equals<RoleResultsPage_Type, z.infer<typeof RoleResultsPage>>>();
assert<Equals<RouteDestination_Type, z.infer<typeof RouteDestination>>>();
assert<Equals<RouteTarget_Type, z.infer<typeof RouteTarget>>>();
assert<Equals<RouterRouteKind_Type, z.infer<typeof RouterRouteKind>>>();
assert<Equals<RouterRoute_Type, z.infer<typeof RouterRoute>>>();
assert<
  Equals<RouterRouteCreateParams_Type, z.infer<typeof RouterRouteCreateParams>>
>();
assert<
  Equals<RouterRouteResultsPage_Type, z.infer<typeof RouterRouteResultsPage>>
>();
assert<
  Equals<RouterRouteUpdateParams_Type, z.infer<typeof RouterRouteUpdateParams>>
>();
assert<Equals<SagaErrorInfo_Type, z.infer<typeof SagaErrorInfo>>>();
assert<Equals<SagaState_Type, z.infer<typeof SagaState>>>();
assert<Equals<Saga_Type, z.infer<typeof Saga>>>();
assert<Equals<SagaResultsPage_Type, z.infer<typeof SagaResultsPage>>>();
assert<
  Equals<SamlIdentityProvider_Type, z.infer<typeof SamlIdentityProvider>>
>();
assert<
  Equals<
    SamlIdentityProviderCreate_Type,
    z.infer<typeof SamlIdentityProviderCreate>
  >
>();
assert<Equals<SiloIdentityMode_Type, z.infer<typeof SiloIdentityMode>>>();
assert<Equals<Silo_Type, z.infer<typeof Silo>>>();
assert<Equals<SiloCreate_Type, z.infer<typeof SiloCreate>>>();
assert<Equals<SiloResultsPage_Type, z.infer<typeof SiloResultsPage>>>();
assert<Equals<SiloRole_Type, z.infer<typeof SiloRole>>>();
assert<
  Equals<SiloRoleRoleAssignment_Type, z.infer<typeof SiloRoleRoleAssignment>>
>();
assert<Equals<SiloRolePolicy_Type, z.infer<typeof SiloRolePolicy>>>();
assert<Equals<Sled_Type, z.infer<typeof Sled>>>();
assert<Equals<SledResultsPage_Type, z.infer<typeof SledResultsPage>>>();
assert<Equals<SnapshotState_Type, z.infer<typeof SnapshotState>>>();
assert<Equals<Snapshot_Type, z.infer<typeof Snapshot>>>();
assert<Equals<SnapshotCreate_Type, z.infer<typeof SnapshotCreate>>>();
assert<Equals<SnapshotResultsPage_Type, z.infer<typeof SnapshotResultsPage>>>();
assert<Equals<SpoofLoginBody_Type, z.infer<typeof SpoofLoginBody>>>();
assert<Equals<SshKey_Type, z.infer<typeof SshKey>>>();
assert<Equals<SshKeyCreate_Type, z.infer<typeof SshKeyCreate>>>();
assert<Equals<SshKeyResultsPage_Type, z.infer<typeof SshKeyResultsPage>>>();
assert<Equals<TimeseriesName_Type, z.infer<typeof TimeseriesName>>>();
assert<Equals<TimeseriesSchema_Type, z.infer<typeof TimeseriesSchema>>>();
assert<
  Equals<
    TimeseriesSchemaResultsPage_Type,
    z.infer<typeof TimeseriesSchemaResultsPage>
  >
>();
assert<Equals<User_Type, z.infer<typeof User>>>();
assert<Equals<UserBuiltin_Type, z.infer<typeof UserBuiltin>>>();
assert<
  Equals<UserBuiltinResultsPage_Type, z.infer<typeof UserBuiltinResultsPage>>
>();
assert<Equals<UserResultsPage_Type, z.infer<typeof UserResultsPage>>>();
assert<Equals<Vpc_Type, z.infer<typeof Vpc>>>();
assert<Equals<VpcCreate_Type, z.infer<typeof VpcCreate>>>();
assert<
  Equals<VpcFirewallRuleAction_Type, z.infer<typeof VpcFirewallRuleAction>>
>();
assert<
  Equals<
    VpcFirewallRuleDirection_Type,
    z.infer<typeof VpcFirewallRuleDirection>
  >
>();
assert<
  Equals<
    VpcFirewallRuleHostFilter_Type,
    z.infer<typeof VpcFirewallRuleHostFilter>
  >
>();
assert<
  Equals<VpcFirewallRuleProtocol_Type, z.infer<typeof VpcFirewallRuleProtocol>>
>();
assert<
  Equals<VpcFirewallRuleFilter_Type, z.infer<typeof VpcFirewallRuleFilter>>
>();
assert<
  Equals<VpcFirewallRuleStatus_Type, z.infer<typeof VpcFirewallRuleStatus>>
>();
assert<
  Equals<VpcFirewallRuleTarget_Type, z.infer<typeof VpcFirewallRuleTarget>>
>();
assert<Equals<VpcFirewallRule_Type, z.infer<typeof VpcFirewallRule>>>();
assert<
  Equals<VpcFirewallRuleUpdate_Type, z.infer<typeof VpcFirewallRuleUpdate>>
>();
assert<
  Equals<
    VpcFirewallRuleUpdateParams_Type,
    z.infer<typeof VpcFirewallRuleUpdateParams>
  >
>();
assert<Equals<VpcFirewallRules_Type, z.infer<typeof VpcFirewallRules>>>();
assert<Equals<VpcResultsPage_Type, z.infer<typeof VpcResultsPage>>>();
assert<Equals<VpcRouterKind_Type, z.infer<typeof VpcRouterKind>>>();
assert<Equals<VpcRouter_Type, z.infer<typeof VpcRouter>>>();
assert<Equals<VpcRouterCreate_Type, z.infer<typeof VpcRouterCreate>>>();
assert<
  Equals<VpcRouterResultsPage_Type, z.infer<typeof VpcRouterResultsPage>>
>();
assert<Equals<VpcRouterUpdate_Type, z.infer<typeof VpcRouterUpdate>>>();
assert<Equals<VpcSubnet_Type, z.infer<typeof VpcSubnet>>>();
assert<Equals<VpcSubnetCreate_Type, z.infer<typeof VpcSubnetCreate>>>();
assert<
  Equals<VpcSubnetResultsPage_Type, z.infer<typeof VpcSubnetResultsPage>>
>();
assert<Equals<VpcSubnetUpdate_Type, z.infer<typeof VpcSubnetUpdate>>>();
assert<Equals<VpcUpdate_Type, z.infer<typeof VpcUpdate>>>();
assert<Equals<NameOrIdSortMode_Type, z.infer<typeof NameOrIdSortMode>>>();
assert<Equals<NameSortMode_Type, z.infer<typeof NameSortMode>>>();
assert<Equals<DiskMetricName_Type, z.infer<typeof DiskMetricName>>>();
assert<Equals<IdSortMode_Type, z.infer<typeof IdSortMode>>>();
