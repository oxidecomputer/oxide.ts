import { z } from "zod";
import { assert, Equals } from "tsafe";
import type * as A from "./Api";
import * as V from "./validate";

assert<Equals<A.Ipv4Net, z.infer<typeof V.Ipv4Net>>>();
assert<Equals<A.Ipv6Net, z.infer<typeof V.Ipv6Net>>>();
assert<Equals<A.IpNet, z.infer<typeof V.IpNet>>>();
assert<Equals<A.Name, z.infer<typeof V.Name>>>();
assert<Equals<A.NameOrId, z.infer<typeof V.NameOrId>>>();
assert<Equals<A.Address, z.infer<typeof V.Address>>>();
assert<Equals<A.AddressConfig, z.infer<typeof V.AddressConfig>>>();
assert<Equals<A.AddressLotKind, z.infer<typeof V.AddressLotKind>>>();
assert<Equals<A.AddressLot, z.infer<typeof V.AddressLot>>>();
assert<Equals<A.AddressLotBlock, z.infer<typeof V.AddressLotBlock>>>();
assert<
  Equals<A.AddressLotBlockCreate, z.infer<typeof V.AddressLotBlockCreate>>
>();
assert<
  Equals<
    A.AddressLotBlockResultsPage,
    z.infer<typeof V.AddressLotBlockResultsPage>
  >
>();
assert<Equals<A.AddressLotCreate, z.infer<typeof V.AddressLotCreate>>>();
assert<
  Equals<A.AddressLotCreateResponse, z.infer<typeof V.AddressLotCreateResponse>>
>();
assert<
  Equals<A.AddressLotResultsPage, z.infer<typeof V.AddressLotResultsPage>>
>();
assert<Equals<A.Baseboard, z.infer<typeof V.Baseboard>>>();
assert<Equals<A.BgpPeerConfig, z.infer<typeof V.BgpPeerConfig>>>();
assert<Equals<A.BinRangedouble, z.infer<typeof V.BinRangedouble>>>();
assert<Equals<A.BinRangeint64, z.infer<typeof V.BinRangeint64>>>();
assert<Equals<A.Bindouble, z.infer<typeof V.Bindouble>>>();
assert<Equals<A.Binint64, z.infer<typeof V.Binint64>>>();
assert<Equals<A.BlockSize, z.infer<typeof V.BlockSize>>>();
assert<Equals<A.ByteCount, z.infer<typeof V.ByteCount>>>();
assert<
  Equals<A.ServiceUsingCertificate, z.infer<typeof V.ServiceUsingCertificate>>
>();
assert<Equals<A.Certificate, z.infer<typeof V.Certificate>>>();
assert<Equals<A.CertificateCreate, z.infer<typeof V.CertificateCreate>>>();
assert<
  Equals<A.CertificateResultsPage, z.infer<typeof V.CertificateResultsPage>>
>();
assert<
  Equals<A.UpdateableComponentType, z.infer<typeof V.UpdateableComponentType>>
>();
assert<Equals<A.SemverVersion, z.infer<typeof V.SemverVersion>>>();
assert<Equals<A.ComponentUpdate, z.infer<typeof V.ComponentUpdate>>>();
assert<
  Equals<
    A.ComponentUpdateResultsPage,
    z.infer<typeof V.ComponentUpdateResultsPage>
  >
>();
assert<Equals<A.Cumulativedouble, z.infer<typeof V.Cumulativedouble>>>();
assert<Equals<A.Cumulativeint64, z.infer<typeof V.Cumulativeint64>>>();
assert<Equals<A.CurrentUser, z.infer<typeof V.CurrentUser>>>();
assert<Equals<A.Histogramint64, z.infer<typeof V.Histogramint64>>>();
assert<Equals<A.Histogramdouble, z.infer<typeof V.Histogramdouble>>>();
assert<Equals<A.Datum, z.infer<typeof V.Datum>>>();
assert<Equals<A.DerEncodedKeyPair, z.infer<typeof V.DerEncodedKeyPair>>>();
assert<
  Equals<A.DeviceAccessTokenRequest, z.infer<typeof V.DeviceAccessTokenRequest>>
>();
assert<Equals<A.DeviceAuthRequest, z.infer<typeof V.DeviceAuthRequest>>>();
assert<Equals<A.DeviceAuthVerify, z.infer<typeof V.DeviceAuthVerify>>>();
assert<Equals<A.Digest, z.infer<typeof V.Digest>>>();
assert<Equals<A.DiskState, z.infer<typeof V.DiskState>>>();
assert<Equals<A.Disk, z.infer<typeof V.Disk>>>();
assert<Equals<A.DiskSource, z.infer<typeof V.DiskSource>>>();
assert<Equals<A.DiskCreate, z.infer<typeof V.DiskCreate>>>();
assert<Equals<A.DiskPath, z.infer<typeof V.DiskPath>>>();
assert<Equals<A.DiskResultsPage, z.infer<typeof V.DiskResultsPage>>>();
assert<Equals<A.ExpectedDigest, z.infer<typeof V.ExpectedDigest>>>();
assert<Equals<A.IpKind, z.infer<typeof V.IpKind>>>();
assert<Equals<A.ExternalIp, z.infer<typeof V.ExternalIp>>>();
assert<Equals<A.ExternalIpCreate, z.infer<typeof V.ExternalIpCreate>>>();
assert<
  Equals<A.ExternalIpResultsPage, z.infer<typeof V.ExternalIpResultsPage>>
>();
assert<Equals<A.FinalizeDisk, z.infer<typeof V.FinalizeDisk>>>();
assert<Equals<A.FleetRole, z.infer<typeof V.FleetRole>>>();
assert<Equals<A.IdentityType, z.infer<typeof V.IdentityType>>>();
assert<
  Equals<A.FleetRoleRoleAssignment, z.infer<typeof V.FleetRoleRoleAssignment>>
>();
assert<Equals<A.FleetRolePolicy, z.infer<typeof V.FleetRolePolicy>>>();
assert<Equals<A.Group, z.infer<typeof V.Group>>>();
assert<Equals<A.GroupResultsPage, z.infer<typeof V.GroupResultsPage>>>();
assert<
  Equals<A.IdentityProviderType, z.infer<typeof V.IdentityProviderType>>
>();
assert<Equals<A.IdentityProvider, z.infer<typeof V.IdentityProvider>>>();
assert<
  Equals<
    A.IdentityProviderResultsPage,
    z.infer<typeof V.IdentityProviderResultsPage>
  >
>();
assert<Equals<A.IdpMetadataSource, z.infer<typeof V.IdpMetadataSource>>>();
assert<Equals<A.Image, z.infer<typeof V.Image>>>();
assert<Equals<A.ImageSource, z.infer<typeof V.ImageSource>>>();
assert<Equals<A.ImageCreate, z.infer<typeof V.ImageCreate>>>();
assert<Equals<A.ImageResultsPage, z.infer<typeof V.ImageResultsPage>>>();
assert<
  Equals<A.ImportBlocksBulkWrite, z.infer<typeof V.ImportBlocksBulkWrite>>
>();
assert<Equals<A.ImportBlocksFromUrl, z.infer<typeof V.ImportBlocksFromUrl>>>();
assert<Equals<A.InstanceCpuCount, z.infer<typeof V.InstanceCpuCount>>>();
assert<Equals<A.InstanceState, z.infer<typeof V.InstanceState>>>();
assert<Equals<A.Instance, z.infer<typeof V.Instance>>>();
assert<
  Equals<A.InstanceDiskAttachment, z.infer<typeof V.InstanceDiskAttachment>>
>();
assert<
  Equals<
    A.InstanceNetworkInterfaceCreate,
    z.infer<typeof V.InstanceNetworkInterfaceCreate>
  >
>();
assert<
  Equals<
    A.InstanceNetworkInterfaceAttachment,
    z.infer<typeof V.InstanceNetworkInterfaceAttachment>
  >
>();
assert<Equals<A.InstanceCreate, z.infer<typeof V.InstanceCreate>>>();
assert<Equals<A.InstanceMigrate, z.infer<typeof V.InstanceMigrate>>>();
assert<Equals<A.MacAddr, z.infer<typeof V.MacAddr>>>();
assert<
  Equals<A.InstanceNetworkInterface, z.infer<typeof V.InstanceNetworkInterface>>
>();
assert<
  Equals<
    A.InstanceNetworkInterfaceResultsPage,
    z.infer<typeof V.InstanceNetworkInterfaceResultsPage>
  >
>();
assert<
  Equals<
    A.InstanceNetworkInterfaceUpdate,
    z.infer<typeof V.InstanceNetworkInterfaceUpdate>
  >
>();
assert<Equals<A.InstanceResultsPage, z.infer<typeof V.InstanceResultsPage>>>();
assert<
  Equals<
    A.InstanceSerialConsoleData,
    z.infer<typeof V.InstanceSerialConsoleData>
  >
>();
assert<Equals<A.IpPool, z.infer<typeof V.IpPool>>>();
assert<Equals<A.IpPoolCreate, z.infer<typeof V.IpPoolCreate>>>();
assert<Equals<A.Ipv4Range, z.infer<typeof V.Ipv4Range>>>();
assert<Equals<A.Ipv6Range, z.infer<typeof V.Ipv6Range>>>();
assert<Equals<A.IpRange, z.infer<typeof V.IpRange>>>();
assert<Equals<A.IpPoolRange, z.infer<typeof V.IpPoolRange>>>();
assert<
  Equals<A.IpPoolRangeResultsPage, z.infer<typeof V.IpPoolRangeResultsPage>>
>();
assert<Equals<A.IpPoolResultsPage, z.infer<typeof V.IpPoolResultsPage>>>();
assert<Equals<A.IpPoolUpdate, z.infer<typeof V.IpPoolUpdate>>>();
assert<Equals<A.L4PortRange, z.infer<typeof V.L4PortRange>>>();
assert<Equals<A.LldpServiceConfig, z.infer<typeof V.LldpServiceConfig>>>();
assert<Equals<A.LinkConfig, z.infer<typeof V.LinkConfig>>>();
assert<Equals<A.LoopbackAddress, z.infer<typeof V.LoopbackAddress>>>();
assert<
  Equals<A.LoopbackAddressCreate, z.infer<typeof V.LoopbackAddressCreate>>
>();
assert<
  Equals<
    A.LoopbackAddressResultsPage,
    z.infer<typeof V.LoopbackAddressResultsPage>
  >
>();
assert<Equals<A.Measurement, z.infer<typeof V.Measurement>>>();
assert<
  Equals<A.MeasurementResultsPage, z.infer<typeof V.MeasurementResultsPage>>
>();
assert<Equals<A.Password, z.infer<typeof V.Password>>>();
assert<Equals<A.PhysicalDiskType, z.infer<typeof V.PhysicalDiskType>>>();
assert<Equals<A.PhysicalDisk, z.infer<typeof V.PhysicalDisk>>>();
assert<
  Equals<A.PhysicalDiskResultsPage, z.infer<typeof V.PhysicalDiskResultsPage>>
>();
assert<Equals<A.Project, z.infer<typeof V.Project>>>();
assert<Equals<A.ProjectCreate, z.infer<typeof V.ProjectCreate>>>();
assert<Equals<A.ProjectResultsPage, z.infer<typeof V.ProjectResultsPage>>>();
assert<Equals<A.ProjectRole, z.infer<typeof V.ProjectRole>>>();
assert<
  Equals<
    A.ProjectRoleRoleAssignment,
    z.infer<typeof V.ProjectRoleRoleAssignment>
  >
>();
assert<Equals<A.ProjectRolePolicy, z.infer<typeof V.ProjectRolePolicy>>>();
assert<Equals<A.ProjectUpdate, z.infer<typeof V.ProjectUpdate>>>();
assert<Equals<A.Rack, z.infer<typeof V.Rack>>>();
assert<Equals<A.RackResultsPage, z.infer<typeof V.RackResultsPage>>>();
assert<Equals<A.RoleName, z.infer<typeof V.RoleName>>>();
assert<Equals<A.Role, z.infer<typeof V.Role>>>();
assert<Equals<A.RoleResultsPage, z.infer<typeof V.RoleResultsPage>>>();
assert<Equals<A.Route, z.infer<typeof V.Route>>>();
assert<Equals<A.RouteConfig, z.infer<typeof V.RouteConfig>>>();
assert<Equals<A.RouteDestination, z.infer<typeof V.RouteDestination>>>();
assert<Equals<A.RouteTarget, z.infer<typeof V.RouteTarget>>>();
assert<Equals<A.RouterRouteKind, z.infer<typeof V.RouterRouteKind>>>();
assert<Equals<A.RouterRoute, z.infer<typeof V.RouterRoute>>>();
assert<Equals<A.RouterRouteCreate, z.infer<typeof V.RouterRouteCreate>>>();
assert<
  Equals<A.RouterRouteResultsPage, z.infer<typeof V.RouterRouteResultsPage>>
>();
assert<Equals<A.RouterRouteUpdate, z.infer<typeof V.RouterRouteUpdate>>>();
assert<
  Equals<A.SamlIdentityProvider, z.infer<typeof V.SamlIdentityProvider>>
>();
assert<
  Equals<
    A.SamlIdentityProviderCreate,
    z.infer<typeof V.SamlIdentityProviderCreate>
  >
>();
assert<Equals<A.SiloIdentityMode, z.infer<typeof V.SiloIdentityMode>>>();
assert<Equals<A.Silo, z.infer<typeof V.Silo>>>();
assert<Equals<A.SiloCreate, z.infer<typeof V.SiloCreate>>>();
assert<Equals<A.SiloResultsPage, z.infer<typeof V.SiloResultsPage>>>();
assert<Equals<A.SiloRole, z.infer<typeof V.SiloRole>>>();
assert<
  Equals<A.SiloRoleRoleAssignment, z.infer<typeof V.SiloRoleRoleAssignment>>
>();
assert<Equals<A.SiloRolePolicy, z.infer<typeof V.SiloRolePolicy>>>();
assert<Equals<A.Sled, z.infer<typeof V.Sled>>>();
assert<Equals<A.SledInstance, z.infer<typeof V.SledInstance>>>();
assert<
  Equals<A.SledInstanceResultsPage, z.infer<typeof V.SledInstanceResultsPage>>
>();
assert<Equals<A.SledResultsPage, z.infer<typeof V.SledResultsPage>>>();
assert<Equals<A.SnapshotState, z.infer<typeof V.SnapshotState>>>();
assert<Equals<A.Snapshot, z.infer<typeof V.Snapshot>>>();
assert<Equals<A.SnapshotCreate, z.infer<typeof V.SnapshotCreate>>>();
assert<Equals<A.SnapshotResultsPage, z.infer<typeof V.SnapshotResultsPage>>>();
assert<Equals<A.SshKey, z.infer<typeof V.SshKey>>>();
assert<Equals<A.SshKeyCreate, z.infer<typeof V.SshKeyCreate>>>();
assert<Equals<A.SshKeyResultsPage, z.infer<typeof V.SshKeyResultsPage>>>();
assert<Equals<A.Switch, z.infer<typeof V.Switch>>>();
assert<Equals<A.SwitchInterfaceKind, z.infer<typeof V.SwitchInterfaceKind>>>();
assert<
  Equals<A.SwitchInterfaceConfig, z.infer<typeof V.SwitchInterfaceConfig>>
>();
assert<Equals<A.SwitchPort, z.infer<typeof V.SwitchPort>>>();
assert<
  Equals<A.SwitchPortAddressConfig, z.infer<typeof V.SwitchPortAddressConfig>>
>();
assert<
  Equals<A.SwitchPortApplySettings, z.infer<typeof V.SwitchPortApplySettings>>
>();
assert<
  Equals<A.SwitchPortBgpPeerConfig, z.infer<typeof V.SwitchPortBgpPeerConfig>>
>();
assert<Equals<A.SwitchPortGeometry, z.infer<typeof V.SwitchPortGeometry>>>();
assert<Equals<A.SwitchPortConfig, z.infer<typeof V.SwitchPortConfig>>>();
assert<
  Equals<A.SwitchPortLinkConfig, z.infer<typeof V.SwitchPortLinkConfig>>
>();
assert<
  Equals<A.SwitchPortResultsPage, z.infer<typeof V.SwitchPortResultsPage>>
>();
assert<
  Equals<A.SwitchPortRouteConfig, z.infer<typeof V.SwitchPortRouteConfig>>
>();
assert<Equals<A.SwitchPortSettings, z.infer<typeof V.SwitchPortSettings>>>();
assert<
  Equals<A.SwitchPortSettingsCreate, z.infer<typeof V.SwitchPortSettingsCreate>>
>();
assert<
  Equals<A.SwitchPortSettingsGroups, z.infer<typeof V.SwitchPortSettingsGroups>>
>();
assert<
  Equals<
    A.SwitchPortSettingsResultsPage,
    z.infer<typeof V.SwitchPortSettingsResultsPage>
  >
>();
assert<
  Equals<
    A.SwitchVlanInterfaceConfig,
    z.infer<typeof V.SwitchVlanInterfaceConfig>
  >
>();
assert<
  Equals<A.SwitchPortSettingsView, z.infer<typeof V.SwitchPortSettingsView>>
>();
assert<Equals<A.SwitchResultsPage, z.infer<typeof V.SwitchResultsPage>>>();
assert<Equals<A.SystemUpdate, z.infer<typeof V.SystemUpdate>>>();
assert<
  Equals<A.SystemUpdateResultsPage, z.infer<typeof V.SystemUpdateResultsPage>>
>();
assert<Equals<A.SystemUpdateStart, z.infer<typeof V.SystemUpdateStart>>>();
assert<Equals<A.UpdateStatus, z.infer<typeof V.UpdateStatus>>>();
assert<Equals<A.VersionRange, z.infer<typeof V.VersionRange>>>();
assert<Equals<A.SystemVersion, z.infer<typeof V.SystemVersion>>>();
assert<Equals<A.UpdateDeployment, z.infer<typeof V.UpdateDeployment>>>();
assert<
  Equals<
    A.UpdateDeploymentResultsPage,
    z.infer<typeof V.UpdateDeploymentResultsPage>
  >
>();
assert<Equals<A.UpdateableComponent, z.infer<typeof V.UpdateableComponent>>>();
assert<
  Equals<
    A.UpdateableComponentResultsPage,
    z.infer<typeof V.UpdateableComponentResultsPage>
  >
>();
assert<Equals<A.User, z.infer<typeof V.User>>>();
assert<Equals<A.UserBuiltin, z.infer<typeof V.UserBuiltin>>>();
assert<
  Equals<A.UserBuiltinResultsPage, z.infer<typeof V.UserBuiltinResultsPage>>
>();
assert<Equals<A.UserId, z.infer<typeof V.UserId>>>();
assert<Equals<A.UserPassword, z.infer<typeof V.UserPassword>>>();
assert<Equals<A.UserCreate, z.infer<typeof V.UserCreate>>>();
assert<Equals<A.UserResultsPage, z.infer<typeof V.UserResultsPage>>>();
assert<
  Equals<
    A.UsernamePasswordCredentials,
    z.infer<typeof V.UsernamePasswordCredentials>
  >
>();
assert<Equals<A.Vpc, z.infer<typeof V.Vpc>>>();
assert<Equals<A.VpcCreate, z.infer<typeof V.VpcCreate>>>();
assert<
  Equals<A.VpcFirewallRuleAction, z.infer<typeof V.VpcFirewallRuleAction>>
>();
assert<
  Equals<A.VpcFirewallRuleDirection, z.infer<typeof V.VpcFirewallRuleDirection>>
>();
assert<
  Equals<
    A.VpcFirewallRuleHostFilter,
    z.infer<typeof V.VpcFirewallRuleHostFilter>
  >
>();
assert<
  Equals<A.VpcFirewallRuleProtocol, z.infer<typeof V.VpcFirewallRuleProtocol>>
>();
assert<
  Equals<A.VpcFirewallRuleFilter, z.infer<typeof V.VpcFirewallRuleFilter>>
>();
assert<
  Equals<A.VpcFirewallRuleStatus, z.infer<typeof V.VpcFirewallRuleStatus>>
>();
assert<
  Equals<A.VpcFirewallRuleTarget, z.infer<typeof V.VpcFirewallRuleTarget>>
>();
assert<Equals<A.VpcFirewallRule, z.infer<typeof V.VpcFirewallRule>>>();
assert<
  Equals<A.VpcFirewallRuleUpdate, z.infer<typeof V.VpcFirewallRuleUpdate>>
>();
assert<
  Equals<
    A.VpcFirewallRuleUpdateParams,
    z.infer<typeof V.VpcFirewallRuleUpdateParams>
  >
>();
assert<Equals<A.VpcFirewallRules, z.infer<typeof V.VpcFirewallRules>>>();
assert<Equals<A.VpcResultsPage, z.infer<typeof V.VpcResultsPage>>>();
assert<Equals<A.VpcRouterKind, z.infer<typeof V.VpcRouterKind>>>();
assert<Equals<A.VpcRouter, z.infer<typeof V.VpcRouter>>>();
assert<Equals<A.VpcRouterCreate, z.infer<typeof V.VpcRouterCreate>>>();
assert<
  Equals<A.VpcRouterResultsPage, z.infer<typeof V.VpcRouterResultsPage>>
>();
assert<Equals<A.VpcRouterUpdate, z.infer<typeof V.VpcRouterUpdate>>>();
assert<Equals<A.VpcSubnet, z.infer<typeof V.VpcSubnet>>>();
assert<Equals<A.VpcSubnetCreate, z.infer<typeof V.VpcSubnetCreate>>>();
assert<
  Equals<A.VpcSubnetResultsPage, z.infer<typeof V.VpcSubnetResultsPage>>
>();
assert<Equals<A.VpcSubnetUpdate, z.infer<typeof V.VpcSubnetUpdate>>>();
assert<Equals<A.VpcUpdate, z.infer<typeof V.VpcUpdate>>>();
assert<Equals<A.NameOrIdSortMode, z.infer<typeof V.NameOrIdSortMode>>>();
assert<Equals<A.DiskMetricName, z.infer<typeof V.DiskMetricName>>>();
assert<Equals<A.PaginationOrder, z.infer<typeof V.PaginationOrder>>>();
assert<Equals<A.IdSortMode, z.infer<typeof V.IdSortMode>>>();
assert<Equals<A.SystemMetricName, z.infer<typeof V.SystemMetricName>>>();
assert<Equals<A.NameSortMode, z.infer<typeof V.NameSortMode>>>();
