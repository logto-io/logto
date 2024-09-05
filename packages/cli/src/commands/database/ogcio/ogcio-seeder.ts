/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @silverhand/fp/no-mutation */
/* eslint-disable @silverhand/fp/no-let */

export type OgcioApplicationTypes = 'User' | 'MachineToMachine';
export type OgcioTenantSeeder = Record<string, OgcioSeeder>;

export type OgcioSeeder = {
  organizations?: OrganizationSeeder[];
  organization_permissions?: OrganizationPermissionSeeder;
  organization_roles?: OrganizationRoleSeeder[];
  applications?: ApplicationSeeder[];
  resources?: ResourceSeeder[];
  connectors?: ConnectorSeeder[];
  webhooks?: WebhookSeeder[];
  sign_in_experiences?: SignInExperienceSeeder[];
  resource_permissions?: ResourcePermissionSeeder[];
  resource_roles?: ResourceRoleSeeder[];
  users?: UserSeeder[];
};

export type OrganizationSeeder = {
  name: string;
  description: string;
  id: string;
};

export type OrganizationPermissionSeeder = {
  specific_permissions: string[];
};

export type OrganizationRoleSeeder = {
  id: string;
  name: string;
  specific_permissions: string[];
  description: string;
  type?: OgcioApplicationTypes;
  related_applications?: Array<{ application_id: string; organization_id: string }>;
};

export type ApplicationSeeder = {
  id: string;
  name: string;
  description: string;
  type: string;
  redirect_uri: string | string[];
  logout_redirect_uri: string | string[];
  secret: string;
  is_third_party?: boolean;
  always_issue_refresh_token?: boolean;
  apply_management_api_role?: boolean;
};

export type ResourceSeeder = {
  id: string;
  name: string;
  indicator: string;
};

export type ConnectorSeeder = {
  id: string;
  sync_profile: boolean;
  connector_id: string;
  config: {
    scope: string;
    clientId: string;
    clientSecret: string;
    tokenEndpoint: string;
    authorizationEndpoint: string;
    tokenEndpointAuthMethod: string;
    idTokenVerificationConfig: {
      jwksUri: string;
    };
    clientSecretJwtSigningAlgorithm: string;
  };
  metadata: {
    logo: string;
    name: Record<string, string>;
    target: string;
  };
};

export type SignInExperienceSeeder = {
  id: string;
  color: {
    primaryColor: string;
    darkPrimaryColor: string;
    isDarkModeEnabled: boolean;
  };
  branding: {
    logoUrl: string;
    darkLogoUrl: string;
  };
  language_info: {
    autoDetect: boolean;
    fallbackLanguage: string;
  };
  sign_in: {
    methods: string[];
  };
  sign_up: {
    verify: boolean;
    password: boolean;
    identifiers: string[];
  };
  social_sign_in_connector_targets: string[];
  sign_in_mode: string;
};

export type ResourcePermissionSeeder = {
  resource_id: string;
  specific_permissions: string[];
};

export type ResourceRoleSeeder = {
  id: string;
  name: string;
  description: string;
  permissions: ScopePerResourceRoleSeeder[];
  type?: OgcioApplicationTypes;
  related_application_ids?: string[];
};

export type ScopePerResourceRoleSeeder = {
  resource_id: string;
  specific_permissions: string[];
  description: string;
};

export type WebhookSeeder = {
  id: string;
  name: string;
  events: string[];
  config: {
    url: string;
  };
  signing_key: string;
  enabled: true;
};

export type UserSeeder = {
  id: string;
  username: string;
  primary_email: string;
  primary_phone?: string;
  name: string;
  application_id: string;
  resource_role_ids: string[];
};

let inputSeeder: OgcioTenantSeeder | undefined;
export const getTenantSeederData = (): OgcioTenantSeeder => {
  if (inputSeeder === undefined) {
    throw new Error('Tenant seeder data missing');
  }

  return inputSeeder;
};

export const setTenantSeederData = (toSet: OgcioTenantSeeder): void => {
  inputSeeder = toSet;
};
