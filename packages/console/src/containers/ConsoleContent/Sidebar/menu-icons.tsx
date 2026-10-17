import { type FC } from 'react';

// 32px pixel icons for the sidebar menu, one per item. Drawn in assets/images/menu.

import actionsSrc from '@/assets/images/menu/actions.png';
import agentSrc from '@/assets/images/menu/agent.png';
import apiResourcesSrc from '@/assets/images/menu/api-resources.png';
import applicationsSrc from '@/assets/images/menu/applications.png';
import auditLogsSrc from '@/assets/images/menu/audit-logs.png';
import bundleSrc from '@/assets/images/menu/bundle.png';
import capacitySrc from '@/assets/images/menu/capacity.png';
import connectorsSrc from '@/assets/images/menu/connectors.png';
import customizeJwtSrc from '@/assets/images/menu/customize-jwt.png';
import dashboardSrc from '@/assets/images/menu/dashboard.png';
import enterpriseSsoSrc from '@/assets/images/menu/enterprise-sso.png';
import getStartedSrc from '@/assets/images/menu/get-started.png';
import mcpServersSrc from '@/assets/images/menu/mcp-servers.png';
import mfaSrc from '@/assets/images/menu/mfa.png';
import organizationTemplateSrc from '@/assets/images/menu/organization-template.png';
import organizationsSrc from '@/assets/images/menu/organizations.png';
import rolesSrc from '@/assets/images/menu/roles.png';
import securitySrc from '@/assets/images/menu/security.png';
import signInExperienceSrc from '@/assets/images/menu/sign-in-experience.png';
import stacksSrc from '@/assets/images/menu/stacks.png';
import tenantSettingsSrc from '@/assets/images/menu/tenant-settings.png';
import usersSrc from '@/assets/images/menu/users.png';
import webhooksSrc from '@/assets/images/menu/webhooks.png';

const menuIcon = (src: string): FC => {
  const MenuIcon = () => <img src={src} alt="" width={32} height={32} className="pixel-menu-icon" />;
  return MenuIcon;
};

export const menuIcons = {
  get_started: menuIcon(getStartedSrc),
  dashboard: menuIcon(dashboardSrc),
  applications: menuIcon(applicationsSrc),
  sign_in_experience: menuIcon(signInExperienceSrc),
  mfa: menuIcon(mfaSrc),
  connectors: menuIcon(connectorsSrc),
  enterprise_sso: menuIcon(enterpriseSsoSrc),
  security: menuIcon(securitySrc),
  stacks: menuIcon(stacksSrc),
  capacity: menuIcon(capacitySrc),
  agent: menuIcon(agentSrc),
  bundle: menuIcon(bundleSrc),
  mcp_servers: menuIcon(mcpServersSrc),
  api_resources: menuIcon(apiResourcesSrc),
  roles: menuIcon(rolesSrc),
  organization_template: menuIcon(organizationTemplateSrc),
  organizations: menuIcon(organizationsSrc),
  users: menuIcon(usersSrc),
  actions: menuIcon(actionsSrc),
  customize_jwt: menuIcon(customizeJwtSrc),
  webhooks: menuIcon(webhooksSrc),
  audit_logs: menuIcon(auditLogsSrc),
  tenant_settings: menuIcon(tenantSettingsSrc),
} satisfies Record<string, FC>;
