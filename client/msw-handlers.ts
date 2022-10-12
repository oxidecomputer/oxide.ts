/* eslint-disable */

import { z, ZodSchema } from "zod";
import {
  rest,
  compose,
  context,
  DefaultBodyType as DBT,
  RestHandler,
  RestRequest,
  ResponseTransformer,
} from "msw";
import type * as Api from "./Api";
import * as schema from "./validate";

type MaybePromise<T> = T | Promise<T>;

/**
 * Custom transformer: convenience function for setting response `status` and/or
 * `delay`.
 *
 * @see https://mswjs.io/docs/basics/response-transformer#custom-transformer
 */
export function json<B>(
  body: B,
  options: { status?: number; delay?: number } = {}
): ResponseTransformer<B> {
  const { status = 200, delay = 0 } = options;
  return compose(
    context.status(status),
    context.json(body),
    context.delay(delay)
  );
}

export interface MSWHandlers {
  diskViewById: (
    params: Api.DiskViewByIdParams
  ) => MaybePromise<Api.Disk | [result: Api.Disk, status: number]>;
  imageViewById: (
    params: Api.ImageViewByIdParams
  ) => MaybePromise<Api.Image | [result: Api.Image, status: number]>;
  instanceViewById: (
    params: Api.InstanceViewByIdParams
  ) => MaybePromise<Api.Instance | [result: Api.Instance, status: number]>;
  instanceNetworkInterfaceViewById: (
    params: Api.InstanceNetworkInterfaceViewByIdParams
  ) => MaybePromise<
    Api.NetworkInterface | [result: Api.NetworkInterface, status: number]
  >;
  organizationViewById: (
    params: Api.OrganizationViewByIdParams
  ) => MaybePromise<
    Api.Organization | [result: Api.Organization, status: number]
  >;
  projectViewById: (
    params: Api.ProjectViewByIdParams
  ) => MaybePromise<Api.Project | [result: Api.Project, status: number]>;
  snapshotViewById: (
    params: Api.SnapshotViewByIdParams
  ) => MaybePromise<Api.Snapshot | [result: Api.Snapshot, status: number]>;
  vpcRouterRouteViewById: (
    params: Api.VpcRouterRouteViewByIdParams
  ) => MaybePromise<
    Api.RouterRoute | [result: Api.RouterRoute, status: number]
  >;
  vpcRouterViewById: (
    params: Api.VpcRouterViewByIdParams
  ) => MaybePromise<Api.VpcRouter | [result: Api.VpcRouter, status: number]>;
  vpcSubnetViewById: (
    params: Api.VpcSubnetViewByIdParams
  ) => MaybePromise<Api.VpcSubnet | [result: Api.VpcSubnet, status: number]>;
  vpcViewById: (
    params: Api.VpcViewByIdParams
  ) => MaybePromise<Api.Vpc | [result: Api.Vpc, status: number]>;
  deviceAuthRequest: () => MaybePromise<number>;
  deviceAuthConfirm: (body: Api.DeviceAuthVerify) => MaybePromise<number>;
  deviceAccessToken: () => MaybePromise<number>;
  loginSpoof: (body: Api.SpoofLoginBody) => MaybePromise<number>;
  loginSamlBegin: (params: Api.LoginSamlBeginParams) => MaybePromise<number>;
  loginSaml: (params: Api.LoginSamlParams) => MaybePromise<number>;
  logout: () => MaybePromise<number>;
  organizationList: (
    params: Api.OrganizationListParams
  ) => MaybePromise<
    | Api.OrganizationResultsPage
    | [result: Api.OrganizationResultsPage, status: number]
  >;
  organizationCreate: (
    body: Api.OrganizationCreate
  ) => MaybePromise<
    Api.Organization | [result: Api.Organization, status: number]
  >;
  organizationView: (
    params: Api.OrganizationViewParams
  ) => MaybePromise<
    Api.Organization | [result: Api.Organization, status: number]
  >;
  organizationUpdate: (
    body: Api.OrganizationUpdate,
    params: Api.OrganizationUpdateParams
  ) => MaybePromise<
    Api.Organization | [result: Api.Organization, status: number]
  >;
  organizationDelete: (
    params: Api.OrganizationDeleteParams
  ) => MaybePromise<number>;
  organizationPolicyView: (
    params: Api.OrganizationPolicyViewParams
  ) => MaybePromise<
    | Api.OrganizationRolePolicy
    | [result: Api.OrganizationRolePolicy, status: number]
  >;
  organizationPolicyUpdate: (
    body: Api.OrganizationRolePolicy,
    params: Api.OrganizationPolicyUpdateParams
  ) => MaybePromise<
    | Api.OrganizationRolePolicy
    | [result: Api.OrganizationRolePolicy, status: number]
  >;
  projectList: (
    params: Api.ProjectListParams
  ) => MaybePromise<
    Api.ProjectResultsPage | [result: Api.ProjectResultsPage, status: number]
  >;
  projectCreate: (
    body: Api.ProjectCreate,
    params: Api.ProjectCreateParams
  ) => MaybePromise<Api.Project | [result: Api.Project, status: number]>;
  projectView: (
    params: Api.ProjectViewParams
  ) => MaybePromise<Api.Project | [result: Api.Project, status: number]>;
  projectUpdate: (
    body: Api.ProjectUpdate,
    params: Api.ProjectUpdateParams
  ) => MaybePromise<Api.Project | [result: Api.Project, status: number]>;
  projectDelete: (params: Api.ProjectDeleteParams) => MaybePromise<number>;
  diskList: (
    params: Api.DiskListParams
  ) => MaybePromise<
    Api.DiskResultsPage | [result: Api.DiskResultsPage, status: number]
  >;
  diskCreate: (
    body: Api.DiskCreate,
    params: Api.DiskCreateParams
  ) => MaybePromise<Api.Disk | [result: Api.Disk, status: number]>;
  diskView: (
    params: Api.DiskViewParams
  ) => MaybePromise<Api.Disk | [result: Api.Disk, status: number]>;
  diskDelete: (params: Api.DiskDeleteParams) => MaybePromise<number>;
  diskMetricsList: (
    params: Api.DiskMetricsListParams
  ) => MaybePromise<
    | Api.MeasurementResultsPage
    | [result: Api.MeasurementResultsPage, status: number]
  >;
  imageList: (
    params: Api.ImageListParams
  ) => MaybePromise<
    Api.ImageResultsPage | [result: Api.ImageResultsPage, status: number]
  >;
  imageCreate: (
    body: Api.ImageCreate,
    params: Api.ImageCreateParams
  ) => MaybePromise<Api.Image | [result: Api.Image, status: number]>;
  imageView: (
    params: Api.ImageViewParams
  ) => MaybePromise<Api.Image | [result: Api.Image, status: number]>;
  imageDelete: (params: Api.ImageDeleteParams) => MaybePromise<number>;
  instanceList: (
    params: Api.InstanceListParams
  ) => MaybePromise<
    Api.InstanceResultsPage | [result: Api.InstanceResultsPage, status: number]
  >;
  instanceCreate: (
    body: Api.InstanceCreate,
    params: Api.InstanceCreateParams
  ) => MaybePromise<Api.Instance | [result: Api.Instance, status: number]>;
  instanceView: (
    params: Api.InstanceViewParams
  ) => MaybePromise<Api.Instance | [result: Api.Instance, status: number]>;
  instanceDelete: (params: Api.InstanceDeleteParams) => MaybePromise<number>;
  instanceDiskList: (
    params: Api.InstanceDiskListParams
  ) => MaybePromise<
    Api.DiskResultsPage | [result: Api.DiskResultsPage, status: number]
  >;
  instanceDiskAttach: (
    body: Api.DiskIdentifier,
    params: Api.InstanceDiskAttachParams
  ) => MaybePromise<Api.Disk | [result: Api.Disk, status: number]>;
  instanceDiskDetach: (
    body: Api.DiskIdentifier,
    params: Api.InstanceDiskDetachParams
  ) => MaybePromise<Api.Disk | [result: Api.Disk, status: number]>;
  instanceExternalIpList: (
    params: Api.InstanceExternalIpListParams
  ) => MaybePromise<
    | Api.ExternalIpResultsPage
    | [result: Api.ExternalIpResultsPage, status: number]
  >;
  instanceMigrate: (
    body: Api.InstanceMigrate,
    params: Api.InstanceMigrateParams
  ) => MaybePromise<Api.Instance | [result: Api.Instance, status: number]>;
  instanceNetworkInterfaceList: (
    params: Api.InstanceNetworkInterfaceListParams
  ) => MaybePromise<
    | Api.NetworkInterfaceResultsPage
    | [result: Api.NetworkInterfaceResultsPage, status: number]
  >;
  instanceNetworkInterfaceCreate: (
    body: Api.NetworkInterfaceCreate,
    params: Api.InstanceNetworkInterfaceCreateParams
  ) => MaybePromise<
    Api.NetworkInterface | [result: Api.NetworkInterface, status: number]
  >;
  instanceNetworkInterfaceView: (
    params: Api.InstanceNetworkInterfaceViewParams
  ) => MaybePromise<
    Api.NetworkInterface | [result: Api.NetworkInterface, status: number]
  >;
  instanceNetworkInterfaceUpdate: (
    body: Api.NetworkInterfaceUpdate,
    params: Api.InstanceNetworkInterfaceUpdateParams
  ) => MaybePromise<
    Api.NetworkInterface | [result: Api.NetworkInterface, status: number]
  >;
  instanceNetworkInterfaceDelete: (
    params: Api.InstanceNetworkInterfaceDeleteParams
  ) => MaybePromise<number>;
  instanceReboot: (
    params: Api.InstanceRebootParams
  ) => MaybePromise<Api.Instance | [result: Api.Instance, status: number]>;
  instanceSerialConsole: (
    params: Api.InstanceSerialConsoleParams
  ) => MaybePromise<
    | Api.InstanceSerialConsoleData
    | [result: Api.InstanceSerialConsoleData, status: number]
  >;
  instanceStart: (
    params: Api.InstanceStartParams
  ) => MaybePromise<Api.Instance | [result: Api.Instance, status: number]>;
  instanceStop: (
    params: Api.InstanceStopParams
  ) => MaybePromise<Api.Instance | [result: Api.Instance, status: number]>;
  projectPolicyView: (
    params: Api.ProjectPolicyViewParams
  ) => MaybePromise<
    Api.ProjectRolePolicy | [result: Api.ProjectRolePolicy, status: number]
  >;
  projectPolicyUpdate: (
    body: Api.ProjectRolePolicy,
    params: Api.ProjectPolicyUpdateParams
  ) => MaybePromise<
    Api.ProjectRolePolicy | [result: Api.ProjectRolePolicy, status: number]
  >;
  snapshotList: (
    params: Api.SnapshotListParams
  ) => MaybePromise<
    Api.SnapshotResultsPage | [result: Api.SnapshotResultsPage, status: number]
  >;
  snapshotCreate: (
    body: Api.SnapshotCreate,
    params: Api.SnapshotCreateParams
  ) => MaybePromise<Api.Snapshot | [result: Api.Snapshot, status: number]>;
  snapshotView: (
    params: Api.SnapshotViewParams
  ) => MaybePromise<Api.Snapshot | [result: Api.Snapshot, status: number]>;
  snapshotDelete: (params: Api.SnapshotDeleteParams) => MaybePromise<number>;
  vpcList: (
    params: Api.VpcListParams
  ) => MaybePromise<
    Api.VpcResultsPage | [result: Api.VpcResultsPage, status: number]
  >;
  vpcCreate: (
    body: Api.VpcCreate,
    params: Api.VpcCreateParams
  ) => MaybePromise<Api.Vpc | [result: Api.Vpc, status: number]>;
  vpcView: (
    params: Api.VpcViewParams
  ) => MaybePromise<Api.Vpc | [result: Api.Vpc, status: number]>;
  vpcUpdate: (
    body: Api.VpcUpdate,
    params: Api.VpcUpdateParams
  ) => MaybePromise<Api.Vpc | [result: Api.Vpc, status: number]>;
  vpcDelete: (params: Api.VpcDeleteParams) => MaybePromise<number>;
  vpcFirewallRulesView: (
    params: Api.VpcFirewallRulesViewParams
  ) => MaybePromise<
    Api.VpcFirewallRules | [result: Api.VpcFirewallRules, status: number]
  >;
  vpcFirewallRulesUpdate: (
    body: Api.VpcFirewallRuleUpdateParams,
    params: Api.VpcFirewallRulesUpdateParams
  ) => MaybePromise<
    Api.VpcFirewallRules | [result: Api.VpcFirewallRules, status: number]
  >;
  vpcRouterList: (
    params: Api.VpcRouterListParams
  ) => MaybePromise<
    | Api.VpcRouterResultsPage
    | [result: Api.VpcRouterResultsPage, status: number]
  >;
  vpcRouterCreate: (
    body: Api.VpcRouterCreate,
    params: Api.VpcRouterCreateParams
  ) => MaybePromise<Api.VpcRouter | [result: Api.VpcRouter, status: number]>;
  vpcRouterView: (
    params: Api.VpcRouterViewParams
  ) => MaybePromise<Api.VpcRouter | [result: Api.VpcRouter, status: number]>;
  vpcRouterUpdate: (
    body: Api.VpcRouterUpdate,
    params: Api.VpcRouterUpdateParams
  ) => MaybePromise<Api.VpcRouter | [result: Api.VpcRouter, status: number]>;
  vpcRouterDelete: (params: Api.VpcRouterDeleteParams) => MaybePromise<number>;
  vpcRouterRouteList: (
    params: Api.VpcRouterRouteListParams
  ) => MaybePromise<
    | Api.RouterRouteResultsPage
    | [result: Api.RouterRouteResultsPage, status: number]
  >;
  vpcRouterRouteCreate: (
    body: Api.RouterRouteCreateParams,
    params: Api.VpcRouterRouteCreateParams
  ) => MaybePromise<
    Api.RouterRoute | [result: Api.RouterRoute, status: number]
  >;
  vpcRouterRouteView: (
    params: Api.VpcRouterRouteViewParams
  ) => MaybePromise<
    Api.RouterRoute | [result: Api.RouterRoute, status: number]
  >;
  vpcRouterRouteUpdate: (
    body: Api.RouterRouteUpdateParams,
    params: Api.VpcRouterRouteUpdateParams
  ) => MaybePromise<
    Api.RouterRoute | [result: Api.RouterRoute, status: number]
  >;
  vpcRouterRouteDelete: (
    params: Api.VpcRouterRouteDeleteParams
  ) => MaybePromise<number>;
  vpcSubnetList: (
    params: Api.VpcSubnetListParams
  ) => MaybePromise<
    | Api.VpcSubnetResultsPage
    | [result: Api.VpcSubnetResultsPage, status: number]
  >;
  vpcSubnetCreate: (
    body: Api.VpcSubnetCreate,
    params: Api.VpcSubnetCreateParams
  ) => MaybePromise<Api.VpcSubnet | [result: Api.VpcSubnet, status: number]>;
  vpcSubnetView: (
    params: Api.VpcSubnetViewParams
  ) => MaybePromise<Api.VpcSubnet | [result: Api.VpcSubnet, status: number]>;
  vpcSubnetUpdate: (
    body: Api.VpcSubnetUpdate,
    params: Api.VpcSubnetUpdateParams
  ) => MaybePromise<Api.VpcSubnet | [result: Api.VpcSubnet, status: number]>;
  vpcSubnetDelete: (params: Api.VpcSubnetDeleteParams) => MaybePromise<number>;
  vpcSubnetListNetworkInterfaces: (
    params: Api.VpcSubnetListNetworkInterfacesParams
  ) => MaybePromise<
    | Api.NetworkInterfaceResultsPage
    | [result: Api.NetworkInterfaceResultsPage, status: number]
  >;
  policyView: () => MaybePromise<
    Api.SiloRolePolicy | [result: Api.SiloRolePolicy, status: number]
  >;
  policyUpdate: (
    body: Api.SiloRolePolicy
  ) => MaybePromise<
    Api.SiloRolePolicy | [result: Api.SiloRolePolicy, status: number]
  >;
  roleList: (
    params: Api.RoleListParams
  ) => MaybePromise<
    Api.RoleResultsPage | [result: Api.RoleResultsPage, status: number]
  >;
  roleView: (
    params: Api.RoleViewParams
  ) => MaybePromise<Api.Role | [result: Api.Role, status: number]>;
  sessionMe: () => MaybePromise<Api.User | [result: Api.User, status: number]>;
  sessionSshkeyList: (
    params: Api.SessionSshkeyListParams
  ) => MaybePromise<
    Api.SshKeyResultsPage | [result: Api.SshKeyResultsPage, status: number]
  >;
  sessionSshkeyCreate: (
    body: Api.SshKeyCreate
  ) => MaybePromise<Api.SshKey | [result: Api.SshKey, status: number]>;
  sessionSshkeyView: (
    params: Api.SessionSshkeyViewParams
  ) => MaybePromise<Api.SshKey | [result: Api.SshKey, status: number]>;
  sessionSshkeyDelete: (
    params: Api.SessionSshkeyDeleteParams
  ) => MaybePromise<number>;
  systemImageViewById: (
    params: Api.SystemImageViewByIdParams
  ) => MaybePromise<
    Api.GlobalImage | [result: Api.GlobalImage, status: number]
  >;
  ipPoolViewById: (
    params: Api.IpPoolViewByIdParams
  ) => MaybePromise<Api.IpPool | [result: Api.IpPool, status: number]>;
  siloViewById: (
    params: Api.SiloViewByIdParams
  ) => MaybePromise<Api.Silo | [result: Api.Silo, status: number]>;
  rackList: (
    params: Api.RackListParams
  ) => MaybePromise<
    Api.RackResultsPage | [result: Api.RackResultsPage, status: number]
  >;
  rackView: (
    params: Api.RackViewParams
  ) => MaybePromise<Api.Rack | [result: Api.Rack, status: number]>;
  sledList: (
    params: Api.SledListParams
  ) => MaybePromise<
    Api.SledResultsPage | [result: Api.SledResultsPage, status: number]
  >;
  sledView: (
    params: Api.SledViewParams
  ) => MaybePromise<Api.Sled | [result: Api.Sled, status: number]>;
  systemImageList: (
    params: Api.SystemImageListParams
  ) => MaybePromise<
    | Api.GlobalImageResultsPage
    | [result: Api.GlobalImageResultsPage, status: number]
  >;
  systemImageCreate: (
    body: Api.GlobalImageCreate
  ) => MaybePromise<
    Api.GlobalImage | [result: Api.GlobalImage, status: number]
  >;
  systemImageView: (
    params: Api.SystemImageViewParams
  ) => MaybePromise<
    Api.GlobalImage | [result: Api.GlobalImage, status: number]
  >;
  systemImageDelete: (
    params: Api.SystemImageDeleteParams
  ) => MaybePromise<number>;
  ipPoolList: (
    params: Api.IpPoolListParams
  ) => MaybePromise<
    Api.IpPoolResultsPage | [result: Api.IpPoolResultsPage, status: number]
  >;
  ipPoolCreate: (
    body: Api.IpPoolCreate
  ) => MaybePromise<Api.IpPool | [result: Api.IpPool, status: number]>;
  ipPoolView: (
    params: Api.IpPoolViewParams
  ) => MaybePromise<Api.IpPool | [result: Api.IpPool, status: number]>;
  ipPoolUpdate: (
    body: Api.IpPoolUpdate,
    params: Api.IpPoolUpdateParams
  ) => MaybePromise<Api.IpPool | [result: Api.IpPool, status: number]>;
  ipPoolDelete: (params: Api.IpPoolDeleteParams) => MaybePromise<number>;
  ipPoolRangeList: (
    params: Api.IpPoolRangeListParams
  ) => MaybePromise<
    | Api.IpPoolRangeResultsPage
    | [result: Api.IpPoolRangeResultsPage, status: number]
  >;
  ipPoolRangeAdd: (
    body: Api.IpRange,
    params: Api.IpPoolRangeAddParams
  ) => MaybePromise<
    Api.IpPoolRange | [result: Api.IpPoolRange, status: number]
  >;
  ipPoolRangeRemove: (
    body: Api.IpRange,
    params: Api.IpPoolRangeRemoveParams
  ) => MaybePromise<number>;
  ipPoolServiceView: (
    params: Api.IpPoolServiceViewParams
  ) => MaybePromise<Api.IpPool | [result: Api.IpPool, status: number]>;
  ipPoolServiceRangeList: (
    params: Api.IpPoolServiceRangeListParams
  ) => MaybePromise<
    | Api.IpPoolRangeResultsPage
    | [result: Api.IpPoolRangeResultsPage, status: number]
  >;
  ipPoolServiceRangeAdd: (
    body: Api.IpRange,
    params: Api.IpPoolServiceRangeAddParams
  ) => MaybePromise<
    Api.IpPoolRange | [result: Api.IpPoolRange, status: number]
  >;
  ipPoolServiceRangeRemove: (
    body: Api.IpRange,
    params: Api.IpPoolServiceRangeRemoveParams
  ) => MaybePromise<number>;
  systemPolicyView: () => MaybePromise<
    Api.FleetRolePolicy | [result: Api.FleetRolePolicy, status: number]
  >;
  systemPolicyUpdate: (
    body: Api.FleetRolePolicy
  ) => MaybePromise<
    Api.FleetRolePolicy | [result: Api.FleetRolePolicy, status: number]
  >;
  sagaList: (
    params: Api.SagaListParams
  ) => MaybePromise<
    Api.SagaResultsPage | [result: Api.SagaResultsPage, status: number]
  >;
  sagaView: (
    params: Api.SagaViewParams
  ) => MaybePromise<Api.Saga | [result: Api.Saga, status: number]>;
  siloList: (
    params: Api.SiloListParams
  ) => MaybePromise<
    Api.SiloResultsPage | [result: Api.SiloResultsPage, status: number]
  >;
  siloCreate: (
    body: Api.SiloCreate
  ) => MaybePromise<Api.Silo | [result: Api.Silo, status: number]>;
  siloView: (
    params: Api.SiloViewParams
  ) => MaybePromise<Api.Silo | [result: Api.Silo, status: number]>;
  siloDelete: (params: Api.SiloDeleteParams) => MaybePromise<number>;
  siloIdentityProviderList: (
    params: Api.SiloIdentityProviderListParams
  ) => MaybePromise<
    | Api.IdentityProviderResultsPage
    | [result: Api.IdentityProviderResultsPage, status: number]
  >;
  samlIdentityProviderCreate: (
    body: Api.SamlIdentityProviderCreate,
    params: Api.SamlIdentityProviderCreateParams
  ) => MaybePromise<
    | Api.SamlIdentityProvider
    | [result: Api.SamlIdentityProvider, status: number]
  >;
  samlIdentityProviderView: (
    params: Api.SamlIdentityProviderViewParams
  ) => MaybePromise<
    | Api.SamlIdentityProvider
    | [result: Api.SamlIdentityProvider, status: number]
  >;
  siloPolicyView: (
    params: Api.SiloPolicyViewParams
  ) => MaybePromise<
    Api.SiloRolePolicy | [result: Api.SiloRolePolicy, status: number]
  >;
  siloPolicyUpdate: (
    body: Api.SiloRolePolicy,
    params: Api.SiloPolicyUpdateParams
  ) => MaybePromise<
    Api.SiloRolePolicy | [result: Api.SiloRolePolicy, status: number]
  >;
  updatesRefresh: () => MaybePromise<number>;
  systemUserList: (
    params: Api.SystemUserListParams
  ) => MaybePromise<
    | Api.UserBuiltinResultsPage
    | [result: Api.UserBuiltinResultsPage, status: number]
  >;
  systemUserView: (
    params: Api.SystemUserViewParams
  ) => MaybePromise<
    Api.UserBuiltin | [result: Api.UserBuiltin, status: number]
  >;
  timeseriesSchemaGet: (
    params: Api.TimeseriesSchemaGetParams
  ) => MaybePromise<
    | Api.TimeseriesSchemaResultsPage
    | [result: Api.TimeseriesSchemaResultsPage, status: number]
  >;
  userList: (
    params: Api.UserListParams
  ) => MaybePromise<
    Api.UserResultsPage | [result: Api.UserResultsPage, status: number]
  >;
}

type ValidateBody = <S extends ZodSchema>(
  schema: S,
  body: unknown
) =>
  | { body: z.infer<S>; bodyErr?: undefined }
  | { body?: undefined; bodyErr: ResponseTransformer };
type ValidateParams = <S extends ZodSchema>(
  schema: S,
  req: RestRequest
) =>
  | { params: z.infer<S>; paramsErr?: undefined }
  | { params?: undefined; paramsErr: ResponseTransformer };

export function makeHandlers(
  handlers: MSWHandlers,
  validateBody: ValidateBody,
  validateParams: ValidateParams
): RestHandler[] {
  return [
    rest.get("/by-id/disks/:id", async (req, res, ctx) => {
      const handler = handlers["diskViewById"];

      const { params, paramsErr } = validateParams(
        schema.DiskViewByIdParams,
        req
      );
      if (paramsErr) return res(paramsErr);

      try {
        const result = await handler(params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.get("/by-id/images/:id", async (req, res, ctx) => {
      const handler = handlers["imageViewById"];

      const { params, paramsErr } = validateParams(
        schema.ImageViewByIdParams,
        req
      );
      if (paramsErr) return res(paramsErr);

      try {
        const result = await handler(params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.get("/by-id/instances/:id", async (req, res, ctx) => {
      const handler = handlers["instanceViewById"];

      const { params, paramsErr } = validateParams(
        schema.InstanceViewByIdParams,
        req
      );
      if (paramsErr) return res(paramsErr);

      try {
        const result = await handler(params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.get("/by-id/network-interfaces/:id", async (req, res, ctx) => {
      const handler = handlers["instanceNetworkInterfaceViewById"];

      const { params, paramsErr } = validateParams(
        schema.InstanceNetworkInterfaceViewByIdParams,
        req
      );
      if (paramsErr) return res(paramsErr);

      try {
        const result = await handler(params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.get("/by-id/organizations/:id", async (req, res, ctx) => {
      const handler = handlers["organizationViewById"];

      const { params, paramsErr } = validateParams(
        schema.OrganizationViewByIdParams,
        req
      );
      if (paramsErr) return res(paramsErr);

      try {
        const result = await handler(params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.get("/by-id/projects/:id", async (req, res, ctx) => {
      const handler = handlers["projectViewById"];

      const { params, paramsErr } = validateParams(
        schema.ProjectViewByIdParams,
        req
      );
      if (paramsErr) return res(paramsErr);

      try {
        const result = await handler(params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.get("/by-id/snapshots/:id", async (req, res, ctx) => {
      const handler = handlers["snapshotViewById"];

      const { params, paramsErr } = validateParams(
        schema.SnapshotViewByIdParams,
        req
      );
      if (paramsErr) return res(paramsErr);

      try {
        const result = await handler(params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.get("/by-id/vpc-router-routes/:id", async (req, res, ctx) => {
      const handler = handlers["vpcRouterRouteViewById"];

      const { params, paramsErr } = validateParams(
        schema.VpcRouterRouteViewByIdParams,
        req
      );
      if (paramsErr) return res(paramsErr);

      try {
        const result = await handler(params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.get("/by-id/vpc-routers/:id", async (req, res, ctx) => {
      const handler = handlers["vpcRouterViewById"];

      const { params, paramsErr } = validateParams(
        schema.VpcRouterViewByIdParams,
        req
      );
      if (paramsErr) return res(paramsErr);

      try {
        const result = await handler(params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.get("/by-id/vpc-subnets/:id", async (req, res, ctx) => {
      const handler = handlers["vpcSubnetViewById"];

      const { params, paramsErr } = validateParams(
        schema.VpcSubnetViewByIdParams,
        req
      );
      if (paramsErr) return res(paramsErr);

      try {
        const result = await handler(params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.get("/by-id/vpcs/:id", async (req, res, ctx) => {
      const handler = handlers["vpcViewById"];

      const { params, paramsErr } = validateParams(
        schema.VpcViewByIdParams,
        req
      );
      if (paramsErr) return res(paramsErr);

      try {
        const result = await handler(params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.post("/device/auth", async (req, res, ctx) => {
      const handler = handlers["deviceAuthRequest"];
      try {
        const result = await handler();

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.post("/device/confirm", async (req, res, ctx) => {
      const handler = handlers["deviceAuthConfirm"];

      const { body, bodyErr } = validateBody(
        schema.DeviceAuthVerify,
        await req.json()
      );
      if (bodyErr) return res(bodyErr);

      try {
        const result = await handler(body);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.post("/device/token", async (req, res, ctx) => {
      const handler = handlers["deviceAccessToken"];
      try {
        const result = await handler();

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.post("/login", async (req, res, ctx) => {
      const handler = handlers["loginSpoof"];

      const { body, bodyErr } = validateBody(
        schema.SpoofLoginBody,
        await req.json()
      );
      if (bodyErr) return res(bodyErr);

      try {
        const result = await handler(body);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.get("/login/:siloName/saml/:providerName", async (req, res, ctx) => {
      const handler = handlers["loginSamlBegin"];

      const { params, paramsErr } = validateParams(
        schema.LoginSamlBeginParams,
        req
      );
      if (paramsErr) return res(paramsErr);

      try {
        const result = await handler(params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.post("/login/:siloName/saml/:providerName", async (req, res, ctx) => {
      const handler = handlers["loginSaml"];

      const { params, paramsErr } = validateParams(schema.LoginSamlParams, req);
      if (paramsErr) return res(paramsErr);

      try {
        const result = await handler(params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.post("/logout", async (req, res, ctx) => {
      const handler = handlers["logout"];
      try {
        const result = await handler();

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.get("/organizations", async (req, res, ctx) => {
      const handler = handlers["organizationList"];

      const { params, paramsErr } = validateParams(
        schema.OrganizationListParams,
        req
      );
      if (paramsErr) return res(paramsErr);

      try {
        const result = await handler(params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.post("/organizations", async (req, res, ctx) => {
      const handler = handlers["organizationCreate"];

      const { body, bodyErr } = validateBody(
        schema.OrganizationCreate,
        await req.json()
      );
      if (bodyErr) return res(bodyErr);

      try {
        const result = await handler(body);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.get("/organizations/:orgName", async (req, res, ctx) => {
      const handler = handlers["organizationView"];

      const { params, paramsErr } = validateParams(
        schema.OrganizationViewParams,
        req
      );
      if (paramsErr) return res(paramsErr);

      try {
        const result = await handler(params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.put("/organizations/:orgName", async (req, res, ctx) => {
      const handler = handlers["organizationUpdate"];

      const { params, paramsErr } = validateParams(
        schema.OrganizationUpdateParams,
        req
      );
      if (paramsErr) return res(paramsErr);

      const { body, bodyErr } = validateBody(
        schema.OrganizationUpdate,
        await req.json()
      );
      if (bodyErr) return res(bodyErr);

      try {
        const result = await handler(body, params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.delete("/organizations/:orgName", async (req, res, ctx) => {
      const handler = handlers["organizationDelete"];

      const { params, paramsErr } = validateParams(
        schema.OrganizationDeleteParams,
        req
      );
      if (paramsErr) return res(paramsErr);

      try {
        const result = await handler(params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.get("/organizations/:orgName/policy", async (req, res, ctx) => {
      const handler = handlers["organizationPolicyView"];

      const { params, paramsErr } = validateParams(
        schema.OrganizationPolicyViewParams,
        req
      );
      if (paramsErr) return res(paramsErr);

      try {
        const result = await handler(params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.put("/organizations/:orgName/policy", async (req, res, ctx) => {
      const handler = handlers["organizationPolicyUpdate"];

      const { params, paramsErr } = validateParams(
        schema.OrganizationPolicyUpdateParams,
        req
      );
      if (paramsErr) return res(paramsErr);

      const { body, bodyErr } = validateBody(
        schema.OrganizationRolePolicy,
        await req.json()
      );
      if (bodyErr) return res(bodyErr);

      try {
        const result = await handler(body, params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.get("/organizations/:orgName/projects", async (req, res, ctx) => {
      const handler = handlers["projectList"];

      const { params, paramsErr } = validateParams(
        schema.ProjectListParams,
        req
      );
      if (paramsErr) return res(paramsErr);

      try {
        const result = await handler(params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.post("/organizations/:orgName/projects", async (req, res, ctx) => {
      const handler = handlers["projectCreate"];

      const { params, paramsErr } = validateParams(
        schema.ProjectCreateParams,
        req
      );
      if (paramsErr) return res(paramsErr);

      const { body, bodyErr } = validateBody(
        schema.ProjectCreate,
        await req.json()
      );
      if (bodyErr) return res(bodyErr);

      try {
        const result = await handler(body, params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.get(
      "/organizations/:orgName/projects/:projectName",
      async (req, res, ctx) => {
        const handler = handlers["projectView"];

        const { params, paramsErr } = validateParams(
          schema.ProjectViewParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        try {
          const result = await handler(params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.put(
      "/organizations/:orgName/projects/:projectName",
      async (req, res, ctx) => {
        const handler = handlers["projectUpdate"];

        const { params, paramsErr } = validateParams(
          schema.ProjectUpdateParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        const { body, bodyErr } = validateBody(
          schema.ProjectUpdate,
          await req.json()
        );
        if (bodyErr) return res(bodyErr);

        try {
          const result = await handler(body, params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.delete(
      "/organizations/:orgName/projects/:projectName",
      async (req, res, ctx) => {
        const handler = handlers["projectDelete"];

        const { params, paramsErr } = validateParams(
          schema.ProjectDeleteParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        try {
          const result = await handler(params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.get(
      "/organizations/:orgName/projects/:projectName/disks",
      async (req, res, ctx) => {
        const handler = handlers["diskList"];

        const { params, paramsErr } = validateParams(
          schema.DiskListParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        try {
          const result = await handler(params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.post(
      "/organizations/:orgName/projects/:projectName/disks",
      async (req, res, ctx) => {
        const handler = handlers["diskCreate"];

        const { params, paramsErr } = validateParams(
          schema.DiskCreateParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        const { body, bodyErr } = validateBody(
          schema.DiskCreate,
          await req.json()
        );
        if (bodyErr) return res(bodyErr);

        try {
          const result = await handler(body, params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.get(
      "/organizations/:orgName/projects/:projectName/disks/:diskName",
      async (req, res, ctx) => {
        const handler = handlers["diskView"];

        const { params, paramsErr } = validateParams(
          schema.DiskViewParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        try {
          const result = await handler(params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.delete(
      "/organizations/:orgName/projects/:projectName/disks/:diskName",
      async (req, res, ctx) => {
        const handler = handlers["diskDelete"];

        const { params, paramsErr } = validateParams(
          schema.DiskDeleteParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        try {
          const result = await handler(params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.get(
      "/organizations/:orgName/projects/:projectName/disks/:diskName/metrics/:metricName",
      async (req, res, ctx) => {
        const handler = handlers["diskMetricsList"];

        const { params, paramsErr } = validateParams(
          schema.DiskMetricsListParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        try {
          const result = await handler(params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.get(
      "/organizations/:orgName/projects/:projectName/images",
      async (req, res, ctx) => {
        const handler = handlers["imageList"];

        const { params, paramsErr } = validateParams(
          schema.ImageListParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        try {
          const result = await handler(params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.post(
      "/organizations/:orgName/projects/:projectName/images",
      async (req, res, ctx) => {
        const handler = handlers["imageCreate"];

        const { params, paramsErr } = validateParams(
          schema.ImageCreateParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        const { body, bodyErr } = validateBody(
          schema.ImageCreate,
          await req.json()
        );
        if (bodyErr) return res(bodyErr);

        try {
          const result = await handler(body, params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.get(
      "/organizations/:orgName/projects/:projectName/images/:imageName",
      async (req, res, ctx) => {
        const handler = handlers["imageView"];

        const { params, paramsErr } = validateParams(
          schema.ImageViewParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        try {
          const result = await handler(params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.delete(
      "/organizations/:orgName/projects/:projectName/images/:imageName",
      async (req, res, ctx) => {
        const handler = handlers["imageDelete"];

        const { params, paramsErr } = validateParams(
          schema.ImageDeleteParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        try {
          const result = await handler(params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.get(
      "/organizations/:orgName/projects/:projectName/instances",
      async (req, res, ctx) => {
        const handler = handlers["instanceList"];

        const { params, paramsErr } = validateParams(
          schema.InstanceListParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        try {
          const result = await handler(params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.post(
      "/organizations/:orgName/projects/:projectName/instances",
      async (req, res, ctx) => {
        const handler = handlers["instanceCreate"];

        const { params, paramsErr } = validateParams(
          schema.InstanceCreateParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        const { body, bodyErr } = validateBody(
          schema.InstanceCreate,
          await req.json()
        );
        if (bodyErr) return res(bodyErr);

        try {
          const result = await handler(body, params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.get(
      "/organizations/:orgName/projects/:projectName/instances/:instanceName",
      async (req, res, ctx) => {
        const handler = handlers["instanceView"];

        const { params, paramsErr } = validateParams(
          schema.InstanceViewParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        try {
          const result = await handler(params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.delete(
      "/organizations/:orgName/projects/:projectName/instances/:instanceName",
      async (req, res, ctx) => {
        const handler = handlers["instanceDelete"];

        const { params, paramsErr } = validateParams(
          schema.InstanceDeleteParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        try {
          const result = await handler(params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.get(
      "/organizations/:orgName/projects/:projectName/instances/:instanceName/disks",
      async (req, res, ctx) => {
        const handler = handlers["instanceDiskList"];

        const { params, paramsErr } = validateParams(
          schema.InstanceDiskListParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        try {
          const result = await handler(params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.post(
      "/organizations/:orgName/projects/:projectName/instances/:instanceName/disks/attach",
      async (req, res, ctx) => {
        const handler = handlers["instanceDiskAttach"];

        const { params, paramsErr } = validateParams(
          schema.InstanceDiskAttachParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        const { body, bodyErr } = validateBody(
          schema.DiskIdentifier,
          await req.json()
        );
        if (bodyErr) return res(bodyErr);

        try {
          const result = await handler(body, params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.post(
      "/organizations/:orgName/projects/:projectName/instances/:instanceName/disks/detach",
      async (req, res, ctx) => {
        const handler = handlers["instanceDiskDetach"];

        const { params, paramsErr } = validateParams(
          schema.InstanceDiskDetachParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        const { body, bodyErr } = validateBody(
          schema.DiskIdentifier,
          await req.json()
        );
        if (bodyErr) return res(bodyErr);

        try {
          const result = await handler(body, params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.get(
      "/organizations/:orgName/projects/:projectName/instances/:instanceName/external-ips",
      async (req, res, ctx) => {
        const handler = handlers["instanceExternalIpList"];

        const { params, paramsErr } = validateParams(
          schema.InstanceExternalIpListParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        try {
          const result = await handler(params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.post(
      "/organizations/:orgName/projects/:projectName/instances/:instanceName/migrate",
      async (req, res, ctx) => {
        const handler = handlers["instanceMigrate"];

        const { params, paramsErr } = validateParams(
          schema.InstanceMigrateParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        const { body, bodyErr } = validateBody(
          schema.InstanceMigrate,
          await req.json()
        );
        if (bodyErr) return res(bodyErr);

        try {
          const result = await handler(body, params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.get(
      "/organizations/:orgName/projects/:projectName/instances/:instanceName/network-interfaces",
      async (req, res, ctx) => {
        const handler = handlers["instanceNetworkInterfaceList"];

        const { params, paramsErr } = validateParams(
          schema.InstanceNetworkInterfaceListParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        try {
          const result = await handler(params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.post(
      "/organizations/:orgName/projects/:projectName/instances/:instanceName/network-interfaces",
      async (req, res, ctx) => {
        const handler = handlers["instanceNetworkInterfaceCreate"];

        const { params, paramsErr } = validateParams(
          schema.InstanceNetworkInterfaceCreateParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        const { body, bodyErr } = validateBody(
          schema.NetworkInterfaceCreate,
          await req.json()
        );
        if (bodyErr) return res(bodyErr);

        try {
          const result = await handler(body, params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.get(
      "/organizations/:orgName/projects/:projectName/instances/:instanceName/network-interfaces/:interfaceName",
      async (req, res, ctx) => {
        const handler = handlers["instanceNetworkInterfaceView"];

        const { params, paramsErr } = validateParams(
          schema.InstanceNetworkInterfaceViewParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        try {
          const result = await handler(params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.put(
      "/organizations/:orgName/projects/:projectName/instances/:instanceName/network-interfaces/:interfaceName",
      async (req, res, ctx) => {
        const handler = handlers["instanceNetworkInterfaceUpdate"];

        const { params, paramsErr } = validateParams(
          schema.InstanceNetworkInterfaceUpdateParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        const { body, bodyErr } = validateBody(
          schema.NetworkInterfaceUpdate,
          await req.json()
        );
        if (bodyErr) return res(bodyErr);

        try {
          const result = await handler(body, params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.delete(
      "/organizations/:orgName/projects/:projectName/instances/:instanceName/network-interfaces/:interfaceName",
      async (req, res, ctx) => {
        const handler = handlers["instanceNetworkInterfaceDelete"];

        const { params, paramsErr } = validateParams(
          schema.InstanceNetworkInterfaceDeleteParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        try {
          const result = await handler(params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.post(
      "/organizations/:orgName/projects/:projectName/instances/:instanceName/reboot",
      async (req, res, ctx) => {
        const handler = handlers["instanceReboot"];

        const { params, paramsErr } = validateParams(
          schema.InstanceRebootParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        try {
          const result = await handler(params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.get(
      "/organizations/:orgName/projects/:projectName/instances/:instanceName/serial-console",
      async (req, res, ctx) => {
        const handler = handlers["instanceSerialConsole"];

        const { params, paramsErr } = validateParams(
          schema.InstanceSerialConsoleParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        try {
          const result = await handler(params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.post(
      "/organizations/:orgName/projects/:projectName/instances/:instanceName/start",
      async (req, res, ctx) => {
        const handler = handlers["instanceStart"];

        const { params, paramsErr } = validateParams(
          schema.InstanceStartParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        try {
          const result = await handler(params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.post(
      "/organizations/:orgName/projects/:projectName/instances/:instanceName/stop",
      async (req, res, ctx) => {
        const handler = handlers["instanceStop"];

        const { params, paramsErr } = validateParams(
          schema.InstanceStopParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        try {
          const result = await handler(params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.get(
      "/organizations/:orgName/projects/:projectName/policy",
      async (req, res, ctx) => {
        const handler = handlers["projectPolicyView"];

        const { params, paramsErr } = validateParams(
          schema.ProjectPolicyViewParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        try {
          const result = await handler(params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.put(
      "/organizations/:orgName/projects/:projectName/policy",
      async (req, res, ctx) => {
        const handler = handlers["projectPolicyUpdate"];

        const { params, paramsErr } = validateParams(
          schema.ProjectPolicyUpdateParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        const { body, bodyErr } = validateBody(
          schema.ProjectRolePolicy,
          await req.json()
        );
        if (bodyErr) return res(bodyErr);

        try {
          const result = await handler(body, params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.get(
      "/organizations/:orgName/projects/:projectName/snapshots",
      async (req, res, ctx) => {
        const handler = handlers["snapshotList"];

        const { params, paramsErr } = validateParams(
          schema.SnapshotListParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        try {
          const result = await handler(params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.post(
      "/organizations/:orgName/projects/:projectName/snapshots",
      async (req, res, ctx) => {
        const handler = handlers["snapshotCreate"];

        const { params, paramsErr } = validateParams(
          schema.SnapshotCreateParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        const { body, bodyErr } = validateBody(
          schema.SnapshotCreate,
          await req.json()
        );
        if (bodyErr) return res(bodyErr);

        try {
          const result = await handler(body, params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.get(
      "/organizations/:orgName/projects/:projectName/snapshots/:snapshotName",
      async (req, res, ctx) => {
        const handler = handlers["snapshotView"];

        const { params, paramsErr } = validateParams(
          schema.SnapshotViewParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        try {
          const result = await handler(params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.delete(
      "/organizations/:orgName/projects/:projectName/snapshots/:snapshotName",
      async (req, res, ctx) => {
        const handler = handlers["snapshotDelete"];

        const { params, paramsErr } = validateParams(
          schema.SnapshotDeleteParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        try {
          const result = await handler(params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.get(
      "/organizations/:orgName/projects/:projectName/vpcs",
      async (req, res, ctx) => {
        const handler = handlers["vpcList"];

        const { params, paramsErr } = validateParams(schema.VpcListParams, req);
        if (paramsErr) return res(paramsErr);

        try {
          const result = await handler(params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.post(
      "/organizations/:orgName/projects/:projectName/vpcs",
      async (req, res, ctx) => {
        const handler = handlers["vpcCreate"];

        const { params, paramsErr } = validateParams(
          schema.VpcCreateParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        const { body, bodyErr } = validateBody(
          schema.VpcCreate,
          await req.json()
        );
        if (bodyErr) return res(bodyErr);

        try {
          const result = await handler(body, params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.get(
      "/organizations/:orgName/projects/:projectName/vpcs/:vpcName",
      async (req, res, ctx) => {
        const handler = handlers["vpcView"];

        const { params, paramsErr } = validateParams(schema.VpcViewParams, req);
        if (paramsErr) return res(paramsErr);

        try {
          const result = await handler(params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.put(
      "/organizations/:orgName/projects/:projectName/vpcs/:vpcName",
      async (req, res, ctx) => {
        const handler = handlers["vpcUpdate"];

        const { params, paramsErr } = validateParams(
          schema.VpcUpdateParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        const { body, bodyErr } = validateBody(
          schema.VpcUpdate,
          await req.json()
        );
        if (bodyErr) return res(bodyErr);

        try {
          const result = await handler(body, params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.delete(
      "/organizations/:orgName/projects/:projectName/vpcs/:vpcName",
      async (req, res, ctx) => {
        const handler = handlers["vpcDelete"];

        const { params, paramsErr } = validateParams(
          schema.VpcDeleteParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        try {
          const result = await handler(params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.get(
      "/organizations/:orgName/projects/:projectName/vpcs/:vpcName/firewall/rules",
      async (req, res, ctx) => {
        const handler = handlers["vpcFirewallRulesView"];

        const { params, paramsErr } = validateParams(
          schema.VpcFirewallRulesViewParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        try {
          const result = await handler(params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.put(
      "/organizations/:orgName/projects/:projectName/vpcs/:vpcName/firewall/rules",
      async (req, res, ctx) => {
        const handler = handlers["vpcFirewallRulesUpdate"];

        const { params, paramsErr } = validateParams(
          schema.VpcFirewallRulesUpdateParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        const { body, bodyErr } = validateBody(
          schema.VpcFirewallRuleUpdateParams,
          await req.json()
        );
        if (bodyErr) return res(bodyErr);

        try {
          const result = await handler(body, params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.get(
      "/organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers",
      async (req, res, ctx) => {
        const handler = handlers["vpcRouterList"];

        const { params, paramsErr } = validateParams(
          schema.VpcRouterListParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        try {
          const result = await handler(params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.post(
      "/organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers",
      async (req, res, ctx) => {
        const handler = handlers["vpcRouterCreate"];

        const { params, paramsErr } = validateParams(
          schema.VpcRouterCreateParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        const { body, bodyErr } = validateBody(
          schema.VpcRouterCreate,
          await req.json()
        );
        if (bodyErr) return res(bodyErr);

        try {
          const result = await handler(body, params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.get(
      "/organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName",
      async (req, res, ctx) => {
        const handler = handlers["vpcRouterView"];

        const { params, paramsErr } = validateParams(
          schema.VpcRouterViewParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        try {
          const result = await handler(params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.put(
      "/organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName",
      async (req, res, ctx) => {
        const handler = handlers["vpcRouterUpdate"];

        const { params, paramsErr } = validateParams(
          schema.VpcRouterUpdateParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        const { body, bodyErr } = validateBody(
          schema.VpcRouterUpdate,
          await req.json()
        );
        if (bodyErr) return res(bodyErr);

        try {
          const result = await handler(body, params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.delete(
      "/organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName",
      async (req, res, ctx) => {
        const handler = handlers["vpcRouterDelete"];

        const { params, paramsErr } = validateParams(
          schema.VpcRouterDeleteParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        try {
          const result = await handler(params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.get(
      "/organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName/routes",
      async (req, res, ctx) => {
        const handler = handlers["vpcRouterRouteList"];

        const { params, paramsErr } = validateParams(
          schema.VpcRouterRouteListParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        try {
          const result = await handler(params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.post(
      "/organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName/routes",
      async (req, res, ctx) => {
        const handler = handlers["vpcRouterRouteCreate"];

        const { params, paramsErr } = validateParams(
          schema.VpcRouterRouteCreateParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        const { body, bodyErr } = validateBody(
          schema.RouterRouteCreateParams,
          await req.json()
        );
        if (bodyErr) return res(bodyErr);

        try {
          const result = await handler(body, params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.get(
      "/organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName/routes/:routeName",
      async (req, res, ctx) => {
        const handler = handlers["vpcRouterRouteView"];

        const { params, paramsErr } = validateParams(
          schema.VpcRouterRouteViewParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        try {
          const result = await handler(params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.put(
      "/organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName/routes/:routeName",
      async (req, res, ctx) => {
        const handler = handlers["vpcRouterRouteUpdate"];

        const { params, paramsErr } = validateParams(
          schema.VpcRouterRouteUpdateParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        const { body, bodyErr } = validateBody(
          schema.RouterRouteUpdateParams,
          await req.json()
        );
        if (bodyErr) return res(bodyErr);

        try {
          const result = await handler(body, params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.delete(
      "/organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName/routes/:routeName",
      async (req, res, ctx) => {
        const handler = handlers["vpcRouterRouteDelete"];

        const { params, paramsErr } = validateParams(
          schema.VpcRouterRouteDeleteParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        try {
          const result = await handler(params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.get(
      "/organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets",
      async (req, res, ctx) => {
        const handler = handlers["vpcSubnetList"];

        const { params, paramsErr } = validateParams(
          schema.VpcSubnetListParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        try {
          const result = await handler(params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.post(
      "/organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets",
      async (req, res, ctx) => {
        const handler = handlers["vpcSubnetCreate"];

        const { params, paramsErr } = validateParams(
          schema.VpcSubnetCreateParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        const { body, bodyErr } = validateBody(
          schema.VpcSubnetCreate,
          await req.json()
        );
        if (bodyErr) return res(bodyErr);

        try {
          const result = await handler(body, params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.get(
      "/organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets/:subnetName",
      async (req, res, ctx) => {
        const handler = handlers["vpcSubnetView"];

        const { params, paramsErr } = validateParams(
          schema.VpcSubnetViewParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        try {
          const result = await handler(params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.put(
      "/organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets/:subnetName",
      async (req, res, ctx) => {
        const handler = handlers["vpcSubnetUpdate"];

        const { params, paramsErr } = validateParams(
          schema.VpcSubnetUpdateParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        const { body, bodyErr } = validateBody(
          schema.VpcSubnetUpdate,
          await req.json()
        );
        if (bodyErr) return res(bodyErr);

        try {
          const result = await handler(body, params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.delete(
      "/organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets/:subnetName",
      async (req, res, ctx) => {
        const handler = handlers["vpcSubnetDelete"];

        const { params, paramsErr } = validateParams(
          schema.VpcSubnetDeleteParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        try {
          const result = await handler(params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.get(
      "/organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets/:subnetName/network-interfaces",
      async (req, res, ctx) => {
        const handler = handlers["vpcSubnetListNetworkInterfaces"];

        const { params, paramsErr } = validateParams(
          schema.VpcSubnetListNetworkInterfacesParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        try {
          const result = await handler(params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.get("/policy", async (req, res, ctx) => {
      const handler = handlers["policyView"];
      try {
        const result = await handler();

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.put("/policy", async (req, res, ctx) => {
      const handler = handlers["policyUpdate"];

      const { body, bodyErr } = validateBody(
        schema.SiloRolePolicy,
        await req.json()
      );
      if (bodyErr) return res(bodyErr);

      try {
        const result = await handler(body);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.get("/roles", async (req, res, ctx) => {
      const handler = handlers["roleList"];

      const { params, paramsErr } = validateParams(schema.RoleListParams, req);
      if (paramsErr) return res(paramsErr);

      try {
        const result = await handler(params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.get("/roles/:roleName", async (req, res, ctx) => {
      const handler = handlers["roleView"];

      const { params, paramsErr } = validateParams(schema.RoleViewParams, req);
      if (paramsErr) return res(paramsErr);

      try {
        const result = await handler(params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.get("/session/me", async (req, res, ctx) => {
      const handler = handlers["sessionMe"];
      try {
        const result = await handler();

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.get("/session/me/sshkeys", async (req, res, ctx) => {
      const handler = handlers["sessionSshkeyList"];

      const { params, paramsErr } = validateParams(
        schema.SessionSshkeyListParams,
        req
      );
      if (paramsErr) return res(paramsErr);

      try {
        const result = await handler(params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.post("/session/me/sshkeys", async (req, res, ctx) => {
      const handler = handlers["sessionSshkeyCreate"];

      const { body, bodyErr } = validateBody(
        schema.SshKeyCreate,
        await req.json()
      );
      if (bodyErr) return res(bodyErr);

      try {
        const result = await handler(body);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.get("/session/me/sshkeys/:sshKeyName", async (req, res, ctx) => {
      const handler = handlers["sessionSshkeyView"];

      const { params, paramsErr } = validateParams(
        schema.SessionSshkeyViewParams,
        req
      );
      if (paramsErr) return res(paramsErr);

      try {
        const result = await handler(params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.delete("/session/me/sshkeys/:sshKeyName", async (req, res, ctx) => {
      const handler = handlers["sessionSshkeyDelete"];

      const { params, paramsErr } = validateParams(
        schema.SessionSshkeyDeleteParams,
        req
      );
      if (paramsErr) return res(paramsErr);

      try {
        const result = await handler(params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.get("/system/by-id/images/:id", async (req, res, ctx) => {
      const handler = handlers["systemImageViewById"];

      const { params, paramsErr } = validateParams(
        schema.SystemImageViewByIdParams,
        req
      );
      if (paramsErr) return res(paramsErr);

      try {
        const result = await handler(params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.get("/system/by-id/ip-pools/:id", async (req, res, ctx) => {
      const handler = handlers["ipPoolViewById"];

      const { params, paramsErr } = validateParams(
        schema.IpPoolViewByIdParams,
        req
      );
      if (paramsErr) return res(paramsErr);

      try {
        const result = await handler(params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.get("/system/by-id/silos/:id", async (req, res, ctx) => {
      const handler = handlers["siloViewById"];

      const { params, paramsErr } = validateParams(
        schema.SiloViewByIdParams,
        req
      );
      if (paramsErr) return res(paramsErr);

      try {
        const result = await handler(params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.get("/system/hardware/racks", async (req, res, ctx) => {
      const handler = handlers["rackList"];

      const { params, paramsErr } = validateParams(schema.RackListParams, req);
      if (paramsErr) return res(paramsErr);

      try {
        const result = await handler(params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.get("/system/hardware/racks/:rackId", async (req, res, ctx) => {
      const handler = handlers["rackView"];

      const { params, paramsErr } = validateParams(schema.RackViewParams, req);
      if (paramsErr) return res(paramsErr);

      try {
        const result = await handler(params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.get("/system/hardware/sleds", async (req, res, ctx) => {
      const handler = handlers["sledList"];

      const { params, paramsErr } = validateParams(schema.SledListParams, req);
      if (paramsErr) return res(paramsErr);

      try {
        const result = await handler(params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.get("/system/hardware/sleds/:sledId", async (req, res, ctx) => {
      const handler = handlers["sledView"];

      const { params, paramsErr } = validateParams(schema.SledViewParams, req);
      if (paramsErr) return res(paramsErr);

      try {
        const result = await handler(params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.get("/system/images", async (req, res, ctx) => {
      const handler = handlers["systemImageList"];

      const { params, paramsErr } = validateParams(
        schema.SystemImageListParams,
        req
      );
      if (paramsErr) return res(paramsErr);

      try {
        const result = await handler(params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.post("/system/images", async (req, res, ctx) => {
      const handler = handlers["systemImageCreate"];

      const { body, bodyErr } = validateBody(
        schema.GlobalImageCreate,
        await req.json()
      );
      if (bodyErr) return res(bodyErr);

      try {
        const result = await handler(body);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.get("/system/images/:imageName", async (req, res, ctx) => {
      const handler = handlers["systemImageView"];

      const { params, paramsErr } = validateParams(
        schema.SystemImageViewParams,
        req
      );
      if (paramsErr) return res(paramsErr);

      try {
        const result = await handler(params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.delete("/system/images/:imageName", async (req, res, ctx) => {
      const handler = handlers["systemImageDelete"];

      const { params, paramsErr } = validateParams(
        schema.SystemImageDeleteParams,
        req
      );
      if (paramsErr) return res(paramsErr);

      try {
        const result = await handler(params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.get("/system/ip-pools", async (req, res, ctx) => {
      const handler = handlers["ipPoolList"];

      const { params, paramsErr } = validateParams(
        schema.IpPoolListParams,
        req
      );
      if (paramsErr) return res(paramsErr);

      try {
        const result = await handler(params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.post("/system/ip-pools", async (req, res, ctx) => {
      const handler = handlers["ipPoolCreate"];

      const { body, bodyErr } = validateBody(
        schema.IpPoolCreate,
        await req.json()
      );
      if (bodyErr) return res(bodyErr);

      try {
        const result = await handler(body);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.get("/system/ip-pools/:poolName", async (req, res, ctx) => {
      const handler = handlers["ipPoolView"];

      const { params, paramsErr } = validateParams(
        schema.IpPoolViewParams,
        req
      );
      if (paramsErr) return res(paramsErr);

      try {
        const result = await handler(params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.put("/system/ip-pools/:poolName", async (req, res, ctx) => {
      const handler = handlers["ipPoolUpdate"];

      const { params, paramsErr } = validateParams(
        schema.IpPoolUpdateParams,
        req
      );
      if (paramsErr) return res(paramsErr);

      const { body, bodyErr } = validateBody(
        schema.IpPoolUpdate,
        await req.json()
      );
      if (bodyErr) return res(bodyErr);

      try {
        const result = await handler(body, params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.delete("/system/ip-pools/:poolName", async (req, res, ctx) => {
      const handler = handlers["ipPoolDelete"];

      const { params, paramsErr } = validateParams(
        schema.IpPoolDeleteParams,
        req
      );
      if (paramsErr) return res(paramsErr);

      try {
        const result = await handler(params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.get("/system/ip-pools/:poolName/ranges", async (req, res, ctx) => {
      const handler = handlers["ipPoolRangeList"];

      const { params, paramsErr } = validateParams(
        schema.IpPoolRangeListParams,
        req
      );
      if (paramsErr) return res(paramsErr);

      try {
        const result = await handler(params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.post(
      "/system/ip-pools/:poolName/ranges/add",
      async (req, res, ctx) => {
        const handler = handlers["ipPoolRangeAdd"];

        const { params, paramsErr } = validateParams(
          schema.IpPoolRangeAddParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        const { body, bodyErr } = validateBody(
          schema.IpRange,
          await req.json()
        );
        if (bodyErr) return res(bodyErr);

        try {
          const result = await handler(body, params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.post(
      "/system/ip-pools/:poolName/ranges/remove",
      async (req, res, ctx) => {
        const handler = handlers["ipPoolRangeRemove"];

        const { params, paramsErr } = validateParams(
          schema.IpPoolRangeRemoveParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        const { body, bodyErr } = validateBody(
          schema.IpRange,
          await req.json()
        );
        if (bodyErr) return res(bodyErr);

        try {
          const result = await handler(body, params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.get("/system/ip-pools-service/:rackId", async (req, res, ctx) => {
      const handler = handlers["ipPoolServiceView"];

      const { params, paramsErr } = validateParams(
        schema.IpPoolServiceViewParams,
        req
      );
      if (paramsErr) return res(paramsErr);

      try {
        const result = await handler(params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.get(
      "/system/ip-pools-service/:rackId/ranges",
      async (req, res, ctx) => {
        const handler = handlers["ipPoolServiceRangeList"];

        const { params, paramsErr } = validateParams(
          schema.IpPoolServiceRangeListParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        try {
          const result = await handler(params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.post(
      "/system/ip-pools-service/:rackId/ranges/add",
      async (req, res, ctx) => {
        const handler = handlers["ipPoolServiceRangeAdd"];

        const { params, paramsErr } = validateParams(
          schema.IpPoolServiceRangeAddParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        const { body, bodyErr } = validateBody(
          schema.IpRange,
          await req.json()
        );
        if (bodyErr) return res(bodyErr);

        try {
          const result = await handler(body, params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.post(
      "/system/ip-pools-service/:rackId/ranges/remove",
      async (req, res, ctx) => {
        const handler = handlers["ipPoolServiceRangeRemove"];

        const { params, paramsErr } = validateParams(
          schema.IpPoolServiceRangeRemoveParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        const { body, bodyErr } = validateBody(
          schema.IpRange,
          await req.json()
        );
        if (bodyErr) return res(bodyErr);

        try {
          const result = await handler(body, params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.get("/system/policy", async (req, res, ctx) => {
      const handler = handlers["systemPolicyView"];
      try {
        const result = await handler();

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.put("/system/policy", async (req, res, ctx) => {
      const handler = handlers["systemPolicyUpdate"];

      const { body, bodyErr } = validateBody(
        schema.FleetRolePolicy,
        await req.json()
      );
      if (bodyErr) return res(bodyErr);

      try {
        const result = await handler(body);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.get("/system/sagas", async (req, res, ctx) => {
      const handler = handlers["sagaList"];

      const { params, paramsErr } = validateParams(schema.SagaListParams, req);
      if (paramsErr) return res(paramsErr);

      try {
        const result = await handler(params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.get("/system/sagas/:sagaId", async (req, res, ctx) => {
      const handler = handlers["sagaView"];

      const { params, paramsErr } = validateParams(schema.SagaViewParams, req);
      if (paramsErr) return res(paramsErr);

      try {
        const result = await handler(params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.get("/system/silos", async (req, res, ctx) => {
      const handler = handlers["siloList"];

      const { params, paramsErr } = validateParams(schema.SiloListParams, req);
      if (paramsErr) return res(paramsErr);

      try {
        const result = await handler(params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.post("/system/silos", async (req, res, ctx) => {
      const handler = handlers["siloCreate"];

      const { body, bodyErr } = validateBody(
        schema.SiloCreate,
        await req.json()
      );
      if (bodyErr) return res(bodyErr);

      try {
        const result = await handler(body);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.get("/system/silos/:siloName", async (req, res, ctx) => {
      const handler = handlers["siloView"];

      const { params, paramsErr } = validateParams(schema.SiloViewParams, req);
      if (paramsErr) return res(paramsErr);

      try {
        const result = await handler(params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.delete("/system/silos/:siloName", async (req, res, ctx) => {
      const handler = handlers["siloDelete"];

      const { params, paramsErr } = validateParams(
        schema.SiloDeleteParams,
        req
      );
      if (paramsErr) return res(paramsErr);

      try {
        const result = await handler(params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.get(
      "/system/silos/:siloName/identity-providers",
      async (req, res, ctx) => {
        const handler = handlers["siloIdentityProviderList"];

        const { params, paramsErr } = validateParams(
          schema.SiloIdentityProviderListParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        try {
          const result = await handler(params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.post(
      "/system/silos/:siloName/identity-providers/saml",
      async (req, res, ctx) => {
        const handler = handlers["samlIdentityProviderCreate"];

        const { params, paramsErr } = validateParams(
          schema.SamlIdentityProviderCreateParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        const { body, bodyErr } = validateBody(
          schema.SamlIdentityProviderCreate,
          await req.json()
        );
        if (bodyErr) return res(bodyErr);

        try {
          const result = await handler(body, params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.get(
      "/system/silos/:siloName/identity-providers/saml/:providerName",
      async (req, res, ctx) => {
        const handler = handlers["samlIdentityProviderView"];

        const { params, paramsErr } = validateParams(
          schema.SamlIdentityProviderViewParams,
          req
        );
        if (paramsErr) return res(paramsErr);

        try {
          const result = await handler(params);

          if (Array.isArray(result)) {
            return res(json(result[0], { status: result[1] }));
          }
          if (typeof result === "number") {
            return res(ctx.status(result));
          }
          return res(json(result));
        } catch (thrown) {
          if (typeof thrown === "number") {
            return res(ctx.status(thrown));
          }
          return res(thrown as ResponseTransformer);
        }
      }
    ),
    rest.get("/system/silos/:siloName/policy", async (req, res, ctx) => {
      const handler = handlers["siloPolicyView"];

      const { params, paramsErr } = validateParams(
        schema.SiloPolicyViewParams,
        req
      );
      if (paramsErr) return res(paramsErr);

      try {
        const result = await handler(params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.put("/system/silos/:siloName/policy", async (req, res, ctx) => {
      const handler = handlers["siloPolicyUpdate"];

      const { params, paramsErr } = validateParams(
        schema.SiloPolicyUpdateParams,
        req
      );
      if (paramsErr) return res(paramsErr);

      const { body, bodyErr } = validateBody(
        schema.SiloRolePolicy,
        await req.json()
      );
      if (bodyErr) return res(bodyErr);

      try {
        const result = await handler(body, params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.post("/system/updates/refresh", async (req, res, ctx) => {
      const handler = handlers["updatesRefresh"];
      try {
        const result = await handler();

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.get("/system/user", async (req, res, ctx) => {
      const handler = handlers["systemUserList"];

      const { params, paramsErr } = validateParams(
        schema.SystemUserListParams,
        req
      );
      if (paramsErr) return res(paramsErr);

      try {
        const result = await handler(params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.get("/system/user/:userName", async (req, res, ctx) => {
      const handler = handlers["systemUserView"];

      const { params, paramsErr } = validateParams(
        schema.SystemUserViewParams,
        req
      );
      if (paramsErr) return res(paramsErr);

      try {
        const result = await handler(params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.get("/timeseries/schema", async (req, res, ctx) => {
      const handler = handlers["timeseriesSchemaGet"];

      const { params, paramsErr } = validateParams(
        schema.TimeseriesSchemaGetParams,
        req
      );
      if (paramsErr) return res(paramsErr);

      try {
        const result = await handler(params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
    rest.get("/users", async (req, res, ctx) => {
      const handler = handlers["userList"];

      const { params, paramsErr } = validateParams(schema.UserListParams, req);
      if (paramsErr) return res(paramsErr);

      try {
        const result = await handler(params);

        if (Array.isArray(result)) {
          return res(json(result[0], { status: result[1] }));
        }
        if (typeof result === "number") {
          return res(ctx.status(result));
        }
        return res(json(result));
      } catch (thrown) {
        if (typeof thrown === "number") {
          return res(ctx.status(thrown));
        }
        return res(thrown as ResponseTransformer);
      }
    }),
  ];
}
