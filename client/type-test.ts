import { z } from "zod";
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
const assertType = <T1, T2 extends T1>() => {};
assertType<BinRangedouble_Type, z.infer<typeof BinRangedouble>>();
assertType<BinRangeint64_Type, z.infer<typeof BinRangeint64>>();
assertType<Bindouble_Type, z.infer<typeof Bindouble>>();
assertType<Binint64_Type, z.infer<typeof Binint64>>();
assertType<BlockSize_Type, z.infer<typeof BlockSize>>();
assertType<ByteCount_Type, z.infer<typeof ByteCount>>();
assertType<Cumulativedouble_Type, z.infer<typeof Cumulativedouble>>();
assertType<Cumulativeint64_Type, z.infer<typeof Cumulativeint64>>();
assertType<Histogramint64_Type, z.infer<typeof Histogramint64>>();
assertType<Histogramdouble_Type, z.infer<typeof Histogramdouble>>();
assertType<Datum_Type, z.infer<typeof Datum>>();
assertType<DatumType_Type, z.infer<typeof DatumType>>();
assertType<DerEncodedKeyPair_Type, z.infer<typeof DerEncodedKeyPair>>();
assertType<
  DeviceAccessTokenRequest_Type,
  z.infer<typeof DeviceAccessTokenRequest>
>();
assertType<DeviceAuthRequest_Type, z.infer<typeof DeviceAuthRequest>>();
assertType<DeviceAuthVerify_Type, z.infer<typeof DeviceAuthVerify>>();
assertType<Digest_Type, z.infer<typeof Digest>>();
assertType<Name_Type, z.infer<typeof Name>>();
assertType<DiskState_Type, z.infer<typeof DiskState>>();
assertType<Disk_Type, z.infer<typeof Disk>>();
assertType<DiskSource_Type, z.infer<typeof DiskSource>>();
assertType<DiskCreate_Type, z.infer<typeof DiskCreate>>();
assertType<DiskIdentifier_Type, z.infer<typeof DiskIdentifier>>();
assertType<DiskResultsPage_Type, z.infer<typeof DiskResultsPage>>();
assertType<Distribution_Type, z.infer<typeof Distribution>>();
assertType<IpKind_Type, z.infer<typeof IpKind>>();
assertType<ExternalIp_Type, z.infer<typeof ExternalIp>>();
assertType<ExternalIpCreate_Type, z.infer<typeof ExternalIpCreate>>();
assertType<ExternalIpResultsPage_Type, z.infer<typeof ExternalIpResultsPage>>();
assertType<FieldSource_Type, z.infer<typeof FieldSource>>();
assertType<FieldType_Type, z.infer<typeof FieldType>>();
assertType<FieldSchema_Type, z.infer<typeof FieldSchema>>();
assertType<FleetRole_Type, z.infer<typeof FleetRole>>();
assertType<IdentityType_Type, z.infer<typeof IdentityType>>();
assertType<
  FleetRoleRoleAssignment_Type,
  z.infer<typeof FleetRoleRoleAssignment>
>();
assertType<FleetRolePolicy_Type, z.infer<typeof FleetRolePolicy>>();
assertType<GlobalImage_Type, z.infer<typeof GlobalImage>>();
assertType<ImageSource_Type, z.infer<typeof ImageSource>>();
assertType<GlobalImageCreate_Type, z.infer<typeof GlobalImageCreate>>();
assertType<
  GlobalImageResultsPage_Type,
  z.infer<typeof GlobalImageResultsPage>
>();
assertType<IdentityProviderType_Type, z.infer<typeof IdentityProviderType>>();
assertType<IdentityProvider_Type, z.infer<typeof IdentityProvider>>();
assertType<
  IdentityProviderResultsPage_Type,
  z.infer<typeof IdentityProviderResultsPage>
>();
assertType<IdpMetadataSource_Type, z.infer<typeof IdpMetadataSource>>();
assertType<Image_Type, z.infer<typeof Image>>();
assertType<ImageCreate_Type, z.infer<typeof ImageCreate>>();
assertType<ImageResultsPage_Type, z.infer<typeof ImageResultsPage>>();
assertType<InstanceCpuCount_Type, z.infer<typeof InstanceCpuCount>>();
assertType<InstanceState_Type, z.infer<typeof InstanceState>>();
assertType<Instance_Type, z.infer<typeof Instance>>();
assertType<
  InstanceDiskAttachment_Type,
  z.infer<typeof InstanceDiskAttachment>
>();
assertType<
  NetworkInterfaceCreate_Type,
  z.infer<typeof NetworkInterfaceCreate>
>();
assertType<
  InstanceNetworkInterfaceAttachment_Type,
  z.infer<typeof InstanceNetworkInterfaceAttachment>
>();
assertType<InstanceCreate_Type, z.infer<typeof InstanceCreate>>();
assertType<InstanceMigrate_Type, z.infer<typeof InstanceMigrate>>();
assertType<InstanceResultsPage_Type, z.infer<typeof InstanceResultsPage>>();
assertType<
  InstanceSerialConsoleData_Type,
  z.infer<typeof InstanceSerialConsoleData>
>();
assertType<Ipv4Net_Type, z.infer<typeof Ipv4Net>>();
assertType<Ipv6Net_Type, z.infer<typeof Ipv6Net>>();
assertType<IpNet_Type, z.infer<typeof IpNet>>();
assertType<IpPool_Type, z.infer<typeof IpPool>>();
assertType<IpPoolCreate_Type, z.infer<typeof IpPoolCreate>>();
assertType<Ipv4Range_Type, z.infer<typeof Ipv4Range>>();
assertType<Ipv6Range_Type, z.infer<typeof Ipv6Range>>();
assertType<IpRange_Type, z.infer<typeof IpRange>>();
assertType<IpPoolRange_Type, z.infer<typeof IpPoolRange>>();
assertType<
  IpPoolRangeResultsPage_Type,
  z.infer<typeof IpPoolRangeResultsPage>
>();
assertType<IpPoolResultsPage_Type, z.infer<typeof IpPoolResultsPage>>();
assertType<IpPoolUpdate_Type, z.infer<typeof IpPoolUpdate>>();
assertType<L4PortRange_Type, z.infer<typeof L4PortRange>>();
assertType<MacAddr_Type, z.infer<typeof MacAddr>>();
assertType<Measurement_Type, z.infer<typeof Measurement>>();
assertType<
  MeasurementResultsPage_Type,
  z.infer<typeof MeasurementResultsPage>
>();
assertType<NetworkInterface_Type, z.infer<typeof NetworkInterface>>();
assertType<
  NetworkInterfaceResultsPage_Type,
  z.infer<typeof NetworkInterfaceResultsPage>
>();
assertType<
  NetworkInterfaceUpdate_Type,
  z.infer<typeof NetworkInterfaceUpdate>
>();
assertType<NodeName_Type, z.infer<typeof NodeName>>();
assertType<Organization_Type, z.infer<typeof Organization>>();
assertType<OrganizationCreate_Type, z.infer<typeof OrganizationCreate>>();
assertType<
  OrganizationResultsPage_Type,
  z.infer<typeof OrganizationResultsPage>
>();
assertType<OrganizationRole_Type, z.infer<typeof OrganizationRole>>();
assertType<
  OrganizationRoleRoleAssignment_Type,
  z.infer<typeof OrganizationRoleRoleAssignment>
>();
assertType<
  OrganizationRolePolicy_Type,
  z.infer<typeof OrganizationRolePolicy>
>();
assertType<OrganizationUpdate_Type, z.infer<typeof OrganizationUpdate>>();
assertType<Project_Type, z.infer<typeof Project>>();
assertType<ProjectCreate_Type, z.infer<typeof ProjectCreate>>();
assertType<ProjectResultsPage_Type, z.infer<typeof ProjectResultsPage>>();
assertType<ProjectRole_Type, z.infer<typeof ProjectRole>>();
assertType<
  ProjectRoleRoleAssignment_Type,
  z.infer<typeof ProjectRoleRoleAssignment>
>();
assertType<ProjectRolePolicy_Type, z.infer<typeof ProjectRolePolicy>>();
assertType<ProjectUpdate_Type, z.infer<typeof ProjectUpdate>>();
assertType<Rack_Type, z.infer<typeof Rack>>();
assertType<RackResultsPage_Type, z.infer<typeof RackResultsPage>>();
assertType<RoleName_Type, z.infer<typeof RoleName>>();
assertType<Role_Type, z.infer<typeof Role>>();
assertType<RoleResultsPage_Type, z.infer<typeof RoleResultsPage>>();
assertType<RouteDestination_Type, z.infer<typeof RouteDestination>>();
assertType<RouteTarget_Type, z.infer<typeof RouteTarget>>();
assertType<RouterRouteKind_Type, z.infer<typeof RouterRouteKind>>();
assertType<RouterRoute_Type, z.infer<typeof RouterRoute>>();
assertType<
  RouterRouteCreateParams_Type,
  z.infer<typeof RouterRouteCreateParams>
>();
assertType<
  RouterRouteResultsPage_Type,
  z.infer<typeof RouterRouteResultsPage>
>();
assertType<
  RouterRouteUpdateParams_Type,
  z.infer<typeof RouterRouteUpdateParams>
>();
assertType<SagaErrorInfo_Type, z.infer<typeof SagaErrorInfo>>();
assertType<SagaState_Type, z.infer<typeof SagaState>>();
assertType<Saga_Type, z.infer<typeof Saga>>();
assertType<SagaResultsPage_Type, z.infer<typeof SagaResultsPage>>();
assertType<SamlIdentityProvider_Type, z.infer<typeof SamlIdentityProvider>>();
assertType<
  SamlIdentityProviderCreate_Type,
  z.infer<typeof SamlIdentityProviderCreate>
>();
assertType<SiloIdentityMode_Type, z.infer<typeof SiloIdentityMode>>();
assertType<Silo_Type, z.infer<typeof Silo>>();
assertType<SiloCreate_Type, z.infer<typeof SiloCreate>>();
assertType<SiloResultsPage_Type, z.infer<typeof SiloResultsPage>>();
assertType<SiloRole_Type, z.infer<typeof SiloRole>>();
assertType<
  SiloRoleRoleAssignment_Type,
  z.infer<typeof SiloRoleRoleAssignment>
>();
assertType<SiloRolePolicy_Type, z.infer<typeof SiloRolePolicy>>();
assertType<Sled_Type, z.infer<typeof Sled>>();
assertType<SledResultsPage_Type, z.infer<typeof SledResultsPage>>();
assertType<SnapshotState_Type, z.infer<typeof SnapshotState>>();
assertType<Snapshot_Type, z.infer<typeof Snapshot>>();
assertType<SnapshotCreate_Type, z.infer<typeof SnapshotCreate>>();
assertType<SnapshotResultsPage_Type, z.infer<typeof SnapshotResultsPage>>();
assertType<SpoofLoginBody_Type, z.infer<typeof SpoofLoginBody>>();
assertType<SshKey_Type, z.infer<typeof SshKey>>();
assertType<SshKeyCreate_Type, z.infer<typeof SshKeyCreate>>();
assertType<SshKeyResultsPage_Type, z.infer<typeof SshKeyResultsPage>>();
assertType<TimeseriesName_Type, z.infer<typeof TimeseriesName>>();
assertType<TimeseriesSchema_Type, z.infer<typeof TimeseriesSchema>>();
assertType<
  TimeseriesSchemaResultsPage_Type,
  z.infer<typeof TimeseriesSchemaResultsPage>
>();
assertType<User_Type, z.infer<typeof User>>();
assertType<UserBuiltin_Type, z.infer<typeof UserBuiltin>>();
assertType<
  UserBuiltinResultsPage_Type,
  z.infer<typeof UserBuiltinResultsPage>
>();
assertType<UserResultsPage_Type, z.infer<typeof UserResultsPage>>();
assertType<Vpc_Type, z.infer<typeof Vpc>>();
assertType<VpcCreate_Type, z.infer<typeof VpcCreate>>();
assertType<VpcFirewallRuleAction_Type, z.infer<typeof VpcFirewallRuleAction>>();
assertType<
  VpcFirewallRuleDirection_Type,
  z.infer<typeof VpcFirewallRuleDirection>
>();
assertType<
  VpcFirewallRuleHostFilter_Type,
  z.infer<typeof VpcFirewallRuleHostFilter>
>();
assertType<
  VpcFirewallRuleProtocol_Type,
  z.infer<typeof VpcFirewallRuleProtocol>
>();
assertType<VpcFirewallRuleFilter_Type, z.infer<typeof VpcFirewallRuleFilter>>();
assertType<VpcFirewallRuleStatus_Type, z.infer<typeof VpcFirewallRuleStatus>>();
assertType<VpcFirewallRuleTarget_Type, z.infer<typeof VpcFirewallRuleTarget>>();
assertType<VpcFirewallRule_Type, z.infer<typeof VpcFirewallRule>>();
assertType<VpcFirewallRuleUpdate_Type, z.infer<typeof VpcFirewallRuleUpdate>>();
assertType<
  VpcFirewallRuleUpdateParams_Type,
  z.infer<typeof VpcFirewallRuleUpdateParams>
>();
assertType<VpcFirewallRules_Type, z.infer<typeof VpcFirewallRules>>();
assertType<VpcResultsPage_Type, z.infer<typeof VpcResultsPage>>();
assertType<VpcRouterKind_Type, z.infer<typeof VpcRouterKind>>();
assertType<VpcRouter_Type, z.infer<typeof VpcRouter>>();
assertType<VpcRouterCreate_Type, z.infer<typeof VpcRouterCreate>>();
assertType<VpcRouterResultsPage_Type, z.infer<typeof VpcRouterResultsPage>>();
assertType<VpcRouterUpdate_Type, z.infer<typeof VpcRouterUpdate>>();
assertType<VpcSubnet_Type, z.infer<typeof VpcSubnet>>();
assertType<VpcSubnetCreate_Type, z.infer<typeof VpcSubnetCreate>>();
assertType<VpcSubnetResultsPage_Type, z.infer<typeof VpcSubnetResultsPage>>();
assertType<VpcSubnetUpdate_Type, z.infer<typeof VpcSubnetUpdate>>();
assertType<VpcUpdate_Type, z.infer<typeof VpcUpdate>>();
assertType<NameOrIdSortMode_Type, z.infer<typeof NameOrIdSortMode>>();
assertType<NameSortMode_Type, z.infer<typeof NameSortMode>>();
assertType<DiskMetricName_Type, z.infer<typeof DiskMetricName>>();
assertType<IdSortMode_Type, z.infer<typeof IdSortMode>>();
