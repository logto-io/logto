import api_resource_details from './api-resource-details.js';
import api_resources from './api-resources.js';
import application_details from './application-details.js';
import applications from './applications.js';
import cloud from './cloud.js';
import components from './components.js';
import connector_details from './connector-details.js';
import connectors from './connectors.js';
import contact from './contact.js';
import dashboard from './dashboard.js';
import domain from './domain.js';
import enterprise_sso_details from './enterprise-sso-details.js';
import enterprise_sso from './enterprise-sso.js';
import errors from './errors.js';
import general from './general.js';
import get_started from './get-started.js';
import guide from './guide.js';
import inkeep_ai_bot from './inkeep-ai-bot.js';
import invitation from './invitation.js';
import jwt_claims from './jwt-claims.js';
import log_details from './log-details.js';
import logs from './logs.js';
import menu from './menu.js';
import mfa from './mfa.js';
import organization_details from './organization-details.js';
import organization_role_details from './organization-role-details.js';
import organization_template from './organization-template.js';
import organizations from './organizations.js';
import permissions from './permissions.js';
import profile from './profile.js';
import protected_app from './protected-app.js';
import role_details from './role-details.js';
import roles from './roles.js';
import security from './security.js';
import session_expired from './session-expired.js';
import sign_in_exp from './sign-in-exp/index.js';
import signing_keys from './signing-keys.js';
import subscription from './subscription/index.js';
import tab_sections from './tab-sections.js';
import tabs from './tabs.js';
import tenant_members from './tenant-members.js';
import tenants from './tenants.js';
import topbar from './topbar.js';
import upsell from './upsell/index.js';
import user_details from './user-details.js';
import user_identity_details from './user-identity-details.js';
import users from './users.js';
import webhook_details from './webhook-details.js';
import webhooks from './webhooks.js';
import welcome from './welcome.js';

const admin_console = {
  title: 'คอนโซลผู้ดูแลระบบ',
  admin_user: 'ผู้ดูแล',
  system_app: 'ระบบ',
  menu,
  general,
  errors,
  tab_sections,
  tabs,
  applications,
  application_details,
  api_resources,
  api_resource_details,
  connectors,
  connector_details,
  enterprise_sso,
  enterprise_sso_details,
  security,
  get_started,
  users,
  user_details,
  contact,
  sign_in_exp,
  dashboard,
  logs,
  log_details,
  session_expired,
  welcome,
  roles,
  role_details,
  permissions,
  cloud,
  profile,
  components,
  webhooks,
  webhook_details,
  domain,
  tenants,
  tenant_members,
  topbar,
  subscription,
  upsell,
  guide,
  mfa,
  organizations,
  organization_details,
  protected_app,
  jwt_claims,
  invitation,
  signing_keys,
  organization_template,
  organization_role_details,
  inkeep_ai_bot,
  user_identity_details,
};

export default Object.freeze(admin_console);
