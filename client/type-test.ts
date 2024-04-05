/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { type z } from "zod";
import { assert, type Equals } from "tsafe";
import type * as A from "./Api";
import type * as V from "./validate";

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
assert<Equals<A.BgpMessageHistory, z.infer<typeof V.BgpMessageHistory>>>();
assert<Equals<A.SwitchLocation, z.infer<typeof V.SwitchLocation>>>();
assert<Equals<A.SwitchBgpHistory, z.infer<typeof V.SwitchBgpHistory>>>();
assert<
  Equals<
    A.AggregateBgpMessageHistory,
    z.infer<typeof V.AggregateBgpMessageHistory>
  >
>();
assert<Equals<A.Baseboard, z.infer<typeof V.Baseboard>>>();
assert<Equals<A.BfdMode, z.infer<typeof V.BfdMode>>>();
assert<Equals<A.BfdSessionDisable, z.infer<typeof V.BfdSessionDisable>>>();
assert<Equals<A.BfdSessionEnable, z.infer<typeof V.BfdSessionEnable>>>();
assert<Equals<A.BfdState, z.infer<typeof V.BfdState>>>();
assert<Equals<A.BfdStatus, z.infer<typeof V.BfdStatus>>>();
assert<Equals<A.BgpAnnounceSet, z.infer<typeof V.BgpAnnounceSet>>>();
assert<
  Equals<A.BgpAnnouncementCreate, z.infer<typeof V.BgpAnnouncementCreate>>
>();
assert<
  Equals<A.BgpAnnounceSetCreate, z.infer<typeof V.BgpAnnounceSetCreate>>
>();
assert<Equals<A.BgpAnnouncement, z.infer<typeof V.BgpAnnouncement>>>();
assert<Equals<A.BgpConfig, z.infer<typeof V.BgpConfig>>>();
assert<Equals<A.BgpConfigCreate, z.infer<typeof V.BgpConfigCreate>>>();
assert<
  Equals<A.BgpConfigResultsPage, z.infer<typeof V.BgpConfigResultsPage>>
>();
assert<
  Equals<A.BgpImportedRouteIpv4, z.infer<typeof V.BgpImportedRouteIpv4>>
>();
assert<Equals<A.BgpPeer, z.infer<typeof V.BgpPeer>>>();
assert<Equals<A.BgpPeerConfig, z.infer<typeof V.BgpPeerConfig>>>();
assert<Equals<A.BgpPeerState, z.infer<typeof V.BgpPeerState>>>();
assert<Equals<A.BgpPeerStatus, z.infer<typeof V.BgpPeerStatus>>>();
assert<Equals<A.BinRangedouble, z.infer<typeof V.BinRangedouble>>>();
assert<Equals<A.BinRangefloat, z.infer<typeof V.BinRangefloat>>>();
assert<Equals<A.BinRangeint16, z.infer<typeof V.BinRangeint16>>>();
assert<Equals<A.BinRangeint32, z.infer<typeof V.BinRangeint32>>>();
assert<Equals<A.BinRangeint64, z.infer<typeof V.BinRangeint64>>>();
assert<Equals<A.BinRangeint8, z.infer<typeof V.BinRangeint8>>>();
assert<Equals<A.BinRangeuint16, z.infer<typeof V.BinRangeuint16>>>();
assert<Equals<A.BinRangeuint32, z.infer<typeof V.BinRangeuint32>>>();
assert<Equals<A.BinRangeuint64, z.infer<typeof V.BinRangeuint64>>>();
assert<Equals<A.BinRangeuint8, z.infer<typeof V.BinRangeuint8>>>();
assert<Equals<A.Bindouble, z.infer<typeof V.Bindouble>>>();
assert<Equals<A.Binfloat, z.infer<typeof V.Binfloat>>>();
assert<Equals<A.Binint16, z.infer<typeof V.Binint16>>>();
assert<Equals<A.Binint32, z.infer<typeof V.Binint32>>>();
assert<Equals<A.Binint64, z.infer<typeof V.Binint64>>>();
assert<Equals<A.Binint8, z.infer<typeof V.Binint8>>>();
assert<Equals<A.Binuint16, z.infer<typeof V.Binuint16>>>();
assert<Equals<A.Binuint32, z.infer<typeof V.Binuint32>>>();
assert<Equals<A.Binuint64, z.infer<typeof V.Binuint64>>>();
assert<Equals<A.Binuint8, z.infer<typeof V.Binuint8>>>();
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
assert<Equals<A.Cumulativedouble, z.infer<typeof V.Cumulativedouble>>>();
assert<Equals<A.Cumulativefloat, z.infer<typeof V.Cumulativefloat>>>();
assert<Equals<A.Cumulativeint64, z.infer<typeof V.Cumulativeint64>>>();
assert<Equals<A.Cumulativeuint64, z.infer<typeof V.Cumulativeuint64>>>();
assert<Equals<A.CurrentUser, z.infer<typeof V.CurrentUser>>>();
assert<Equals<A.Histogramint8, z.infer<typeof V.Histogramint8>>>();
assert<Equals<A.Histogramuint8, z.infer<typeof V.Histogramuint8>>>();
assert<Equals<A.Histogramint16, z.infer<typeof V.Histogramint16>>>();
assert<Equals<A.Histogramuint16, z.infer<typeof V.Histogramuint16>>>();
assert<Equals<A.Histogramint32, z.infer<typeof V.Histogramint32>>>();
assert<Equals<A.Histogramuint32, z.infer<typeof V.Histogramuint32>>>();
assert<Equals<A.Histogramint64, z.infer<typeof V.Histogramint64>>>();
assert<Equals<A.Histogramuint64, z.infer<typeof V.Histogramuint64>>>();
assert<Equals<A.Histogramfloat, z.infer<typeof V.Histogramfloat>>>();
assert<Equals<A.Histogramdouble, z.infer<typeof V.Histogramdouble>>>();
assert<Equals<A.DatumType, z.infer<typeof V.DatumType>>>();
assert<Equals<A.MissingDatum, z.infer<typeof V.MissingDatum>>>();
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
assert<Equals<A.Distributiondouble, z.infer<typeof V.Distributiondouble>>>();
assert<Equals<A.Distributionint64, z.infer<typeof V.Distributionint64>>>();
assert<Equals<A.EphemeralIpCreate, z.infer<typeof V.EphemeralIpCreate>>>();
assert<Equals<A.ExternalIp, z.infer<typeof V.ExternalIp>>>();
assert<Equals<A.ExternalIpCreate, z.infer<typeof V.ExternalIpCreate>>>();
assert<
  Equals<A.ExternalIpResultsPage, z.infer<typeof V.ExternalIpResultsPage>>
>();
assert<Equals<A.FieldType, z.infer<typeof V.FieldType>>>();
assert<Equals<A.FieldSource, z.infer<typeof V.FieldSource>>>();
assert<Equals<A.FieldSchema, z.infer<typeof V.FieldSchema>>>();
assert<Equals<A.FieldValue, z.infer<typeof V.FieldValue>>>();
assert<Equals<A.FinalizeDisk, z.infer<typeof V.FinalizeDisk>>>();
assert<Equals<A.FleetRole, z.infer<typeof V.FleetRole>>>();
assert<Equals<A.IdentityType, z.infer<typeof V.IdentityType>>>();
assert<
  Equals<A.FleetRoleRoleAssignment, z.infer<typeof V.FleetRoleRoleAssignment>>
>();
assert<Equals<A.FleetRolePolicy, z.infer<typeof V.FleetRolePolicy>>>();
assert<Equals<A.FloatingIp, z.infer<typeof V.FloatingIp>>>();
assert<
  Equals<A.FloatingIpParentKind, z.infer<typeof V.FloatingIpParentKind>>
>();
assert<Equals<A.FloatingIpAttach, z.infer<typeof V.FloatingIpAttach>>>();
assert<Equals<A.FloatingIpCreate, z.infer<typeof V.FloatingIpCreate>>>();
assert<
  Equals<A.FloatingIpResultsPage, z.infer<typeof V.FloatingIpResultsPage>>
>();
assert<Equals<A.FloatingIpUpdate, z.infer<typeof V.FloatingIpUpdate>>>();
assert<Equals<A.Group, z.infer<typeof V.Group>>>();
assert<Equals<A.GroupResultsPage, z.infer<typeof V.GroupResultsPage>>>();
assert<Equals<A.Hostname, z.infer<typeof V.Hostname>>>();
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
assert<Equals<A.IpKind, z.infer<typeof V.IpKind>>>();
assert<Equals<A.IpPool, z.infer<typeof V.IpPool>>>();
assert<Equals<A.IpPoolCreate, z.infer<typeof V.IpPoolCreate>>>();
assert<Equals<A.IpPoolLinkSilo, z.infer<typeof V.IpPoolLinkSilo>>>();
assert<Equals<A.Ipv4Range, z.infer<typeof V.Ipv4Range>>>();
assert<Equals<A.Ipv6Range, z.infer<typeof V.Ipv6Range>>>();
assert<Equals<A.IpRange, z.infer<typeof V.IpRange>>>();
assert<Equals<A.IpPoolRange, z.infer<typeof V.IpPoolRange>>>();
assert<
  Equals<A.IpPoolRangeResultsPage, z.infer<typeof V.IpPoolRangeResultsPage>>
>();
assert<Equals<A.IpPoolResultsPage, z.infer<typeof V.IpPoolResultsPage>>>();
assert<Equals<A.IpPoolSiloLink, z.infer<typeof V.IpPoolSiloLink>>>();
assert<
  Equals<
    A.IpPoolSiloLinkResultsPage,
    z.infer<typeof V.IpPoolSiloLinkResultsPage>
  >
>();
assert<Equals<A.IpPoolSiloUpdate, z.infer<typeof V.IpPoolSiloUpdate>>>();
assert<Equals<A.IpPoolUpdate, z.infer<typeof V.IpPoolUpdate>>>();
assert<Equals<A.Ipv4Utilization, z.infer<typeof V.Ipv4Utilization>>>();
assert<Equals<A.Ipv6Utilization, z.infer<typeof V.Ipv6Utilization>>>();
assert<Equals<A.IpPoolUtilization, z.infer<typeof V.IpPoolUtilization>>>();
assert<Equals<A.L4PortRange, z.infer<typeof V.L4PortRange>>>();
assert<Equals<A.LinkFec, z.infer<typeof V.LinkFec>>>();
assert<
  Equals<A.LldpServiceConfigCreate, z.infer<typeof V.LldpServiceConfigCreate>>
>();
assert<Equals<A.LinkSpeed, z.infer<typeof V.LinkSpeed>>>();
assert<Equals<A.LinkConfigCreate, z.infer<typeof V.LinkConfigCreate>>>();
assert<Equals<A.LldpServiceConfig, z.infer<typeof V.LldpServiceConfig>>>();
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
assert<Equals<A.MetricType, z.infer<typeof V.MetricType>>>();
assert<
  Equals<A.NetworkInterfaceKind, z.infer<typeof V.NetworkInterfaceKind>>
>();
assert<Equals<A.Vni, z.infer<typeof V.Vni>>>();
assert<Equals<A.NetworkInterface, z.infer<typeof V.NetworkInterface>>>();
assert<Equals<A.Password, z.infer<typeof V.Password>>>();
assert<Equals<A.PhysicalDiskKind, z.infer<typeof V.PhysicalDiskKind>>>();
assert<Equals<A.PhysicalDiskPolicy, z.infer<typeof V.PhysicalDiskPolicy>>>();
assert<Equals<A.PhysicalDiskState, z.infer<typeof V.PhysicalDiskState>>>();
assert<Equals<A.PhysicalDisk, z.infer<typeof V.PhysicalDisk>>>();
assert<
  Equals<A.PhysicalDiskResultsPage, z.infer<typeof V.PhysicalDiskResultsPage>>
>();
assert<Equals<A.PingStatus, z.infer<typeof V.PingStatus>>>();
assert<Equals<A.Ping, z.infer<typeof V.Ping>>>();
assert<Equals<A.ValueArray, z.infer<typeof V.ValueArray>>>();
assert<Equals<A.Values, z.infer<typeof V.Values>>>();
assert<Equals<A.Points, z.infer<typeof V.Points>>>();
assert<Equals<A.Probe, z.infer<typeof V.Probe>>>();
assert<Equals<A.ProbeCreate, z.infer<typeof V.ProbeCreate>>>();
assert<Equals<A.ProbeExternalIp, z.infer<typeof V.ProbeExternalIp>>>();
assert<Equals<A.ProbeInfo, z.infer<typeof V.ProbeInfo>>>();
assert<
  Equals<A.ProbeInfoResultsPage, z.infer<typeof V.ProbeInfoResultsPage>>
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
assert<Equals<A.SiloQuotasCreate, z.infer<typeof V.SiloQuotasCreate>>>();
assert<Equals<A.SiloCreate, z.infer<typeof V.SiloCreate>>>();
assert<Equals<A.SiloIpPool, z.infer<typeof V.SiloIpPool>>>();
assert<
  Equals<A.SiloIpPoolResultsPage, z.infer<typeof V.SiloIpPoolResultsPage>>
>();
assert<Equals<A.SiloQuotas, z.infer<typeof V.SiloQuotas>>>();
assert<
  Equals<A.SiloQuotasResultsPage, z.infer<typeof V.SiloQuotasResultsPage>>
>();
assert<Equals<A.SiloQuotasUpdate, z.infer<typeof V.SiloQuotasUpdate>>>();
assert<Equals<A.SiloResultsPage, z.infer<typeof V.SiloResultsPage>>>();
assert<Equals<A.SiloRole, z.infer<typeof V.SiloRole>>>();
assert<
  Equals<A.SiloRoleRoleAssignment, z.infer<typeof V.SiloRoleRoleAssignment>>
>();
assert<Equals<A.SiloRolePolicy, z.infer<typeof V.SiloRolePolicy>>>();
assert<
  Equals<A.VirtualResourceCounts, z.infer<typeof V.VirtualResourceCounts>>
>();
assert<Equals<A.SiloUtilization, z.infer<typeof V.SiloUtilization>>>();
assert<
  Equals<
    A.SiloUtilizationResultsPage,
    z.infer<typeof V.SiloUtilizationResultsPage>
  >
>();
assert<Equals<A.SledProvisionPolicy, z.infer<typeof V.SledProvisionPolicy>>>();
assert<Equals<A.SledPolicy, z.infer<typeof V.SledPolicy>>>();
assert<Equals<A.SledState, z.infer<typeof V.SledState>>>();
assert<Equals<A.Sled, z.infer<typeof V.Sled>>>();
assert<Equals<A.SledInstance, z.infer<typeof V.SledInstance>>>();
assert<
  Equals<A.SledInstanceResultsPage, z.infer<typeof V.SledInstanceResultsPage>>
>();
assert<
  Equals<
    A.SledProvisionPolicyParams,
    z.infer<typeof V.SledProvisionPolicyParams>
  >
>();
assert<
  Equals<
    A.SledProvisionPolicyResponse,
    z.infer<typeof V.SledProvisionPolicyResponse>
  >
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
assert<
  Equals<A.SwitchInterfaceKind2, z.infer<typeof V.SwitchInterfaceKind2>>
>();
assert<
  Equals<A.SwitchInterfaceConfig, z.infer<typeof V.SwitchInterfaceConfig>>
>();
assert<Equals<A.SwitchInterfaceKind, z.infer<typeof V.SwitchInterfaceKind>>>();
assert<
  Equals<
    A.SwitchInterfaceConfigCreate,
    z.infer<typeof V.SwitchInterfaceConfigCreate>
  >
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
assert<Equals<A.SwitchPortGeometry2, z.infer<typeof V.SwitchPortGeometry2>>>();
assert<Equals<A.SwitchPortConfig, z.infer<typeof V.SwitchPortConfig>>>();
assert<Equals<A.SwitchPortGeometry, z.infer<typeof V.SwitchPortGeometry>>>();
assert<
  Equals<A.SwitchPortConfigCreate, z.infer<typeof V.SwitchPortConfigCreate>>
>();
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
assert<Equals<A.Timeseries, z.infer<typeof V.Timeseries>>>();
assert<Equals<A.Table, z.infer<typeof V.Table>>>();
assert<Equals<A.TimeseriesName, z.infer<typeof V.TimeseriesName>>>();
assert<Equals<A.TimeseriesQuery, z.infer<typeof V.TimeseriesQuery>>>();
assert<Equals<A.TimeseriesSchema, z.infer<typeof V.TimeseriesSchema>>>();
assert<
  Equals<
    A.TimeseriesSchemaResultsPage,
    z.infer<typeof V.TimeseriesSchemaResultsPage>
  >
>();
assert<Equals<A.UninitializedSled, z.infer<typeof V.UninitializedSled>>>();
assert<Equals<A.UninitializedSledId, z.infer<typeof V.UninitializedSledId>>>();
assert<
  Equals<
    A.UninitializedSledResultsPage,
    z.infer<typeof V.UninitializedSledResultsPage>
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
assert<Equals<A.Utilization, z.infer<typeof V.Utilization>>>();
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
