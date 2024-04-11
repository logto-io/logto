const paywall = {
  applications:
    '已达到 <planName/> 的{{count, number}}个应用限制。升级计划以满足团队需求。如需帮助，请随时<a>联系我们</a>。',
  applications_other:
    '已达到 <planName/> 的{{count, number}}个应用限制。升级计划以满足团队需求。如需帮助，请随时<a>联系我们</a>。',
  machine_to_machine_feature:
    '升级至<strong>Pro</strong>套餐，解锁额外机器对机器应用，享受所有高级功能。<a>如果有疑问，请联系我们</a>。',
  machine_to_machine:
    '已达到 <planName/> 的{{count, number}}个机器对机器应用限制。升级计划以满足团队需求。如需帮助，请随时<a>联系我们</a>。',
  machine_to_machine_other:
    '已达到 <planName/> 的{{count, number}}个机器对机器应用限制。升级计划以满足团队需求。如需帮助，请随时<a>联系我们</a>。',
  resources:
    '已达到<planName/>的{{count, number}}个 API 资源限制。升级计划以满足您团队的需求。<a>联系我们</a>寻求帮助。',
  resources_other:
    '已达到<planName/>的{{count, number}}个 API 资源限制。升级计划以满足您团队的需求。<a>联系我们</a>寻求帮助。',
  scopes_per_resource:
    '已达到<planName/>的{{count, number}}个 API 资源每个权限限制。立即升级以扩展。如需任何帮助，请<a>联系我们</a>。',
  scopes_per_resource_other:
    '已达到<planName/>的{{count, number}}个 API 资源每个权限限制。立即升级以扩展。如需任何帮助，请<a>联系我们</a>。',
  custom_domain:
    '升级至<strong>Hobby</strong>或<strong>Pro</strong>套餐，解锁自定义域功能。如有任何需要，不要犹豫<a>联系我们</a>。',
  social_connectors:
    '已达到<planName/>的{{count, number}}个社交连接器限制。为满足您团队的需求，请升级计划以获取额外的社交连接器，并可以使用 OIDC、OAuth 2.0 和 SAML 协议创建您自己的连接器。如需任何帮助，请<a>联系我们</a>。',
  social_connectors_other:
    '已达到<planName/>的{{count, number}}个社交连接器限制。为满足您团队的需求，请升级计划以获取额外的社交连接器，并可以使用 OIDC、OAuth 2.0 和 SAML 协议创建您自己的连接器。如需任何帮助，请<a>联系我们</a>。',
  standard_connectors_feature:
    '升级至<strong>Hobby</strong>或<strong>Pro</strong>套餐，创建自己的连接器，可使用OIDC、OAuth 2.0和SAML协议，还可以享受无限社交连接器和所有高级功能。需要任何帮助，请随时<a>联系我们</a>。',
  standard_connectors:
    '已达到<planName/>的{{count, number}}个社交连接器限制。为满足您团队的需求，请升级计划以获取额外的社交连接器，并可以使用 OIDC、OAuth 2.0 和 SAML 协议创建您自己的连接器。如需任何帮助，请<a>联系我们</a>。',
  standard_connectors_other:
    '已达到<planName/>的{{count, number}}个社交连接器限制。为满足您团队的需求，请升级计划以获取额外的社交连接器，并可以使用 OIDC、OAuth 2.0 和 SAML 协议创建您自己的连接器。如需任何帮助，请<a>联系我们</a>。',
  standard_connectors_pro:
    '已达到<planName/>的{{count, number}}个标准连接器限制。为满足您团队的需求，请升级至企业版计划以获取额外的社交连接器，并可以使用 OIDC、OAuth 2.0 和 SAML 协议创建您自己的连接器。如需任何帮助，请<a>联系我们</a>。',
  standard_connectors_pro_other:
    '已达到<planName/>的{{count, number}}个标准连接器限制。为满足您团队的需求，请升级至企业版计划以获取额外的社交连接器，并可以使用 OIDC、OAuth 2.0 和 SAML 协议创建您自己的连接器。如需任何帮助，请<a>联系我们</a>。',
  roles:
    '已达到<planName/>的{{count, number}}个角色限制。升级计划以添加额外的角色和权限。如需任何帮助，请<a>联系我们</a>。',
  roles_other:
    '已达到<planName/>的{{count, number}}个角色限制。升级计划以添加额外的角色和权限。如需任何帮助，请<a>联系我们</a>。',
  machine_to_machine_roles:
    '{{count, number}} machine-to-machine role of <planName/> limit reached. Upgrade plan to add additional roles and permissions. Feel free to <a>contact us</a> if you need any assistance.',
  machine_to_machine_roles_other:
    '{{count, number}} machine-to-machine roles of <planName/> limit reached. Upgrade plan to add additional roles and permissions. Feel free to <a>contact us</a> if you need any assistance.',
  scopes_per_role:
    '已达到<planName/>的{{count, number}}个角色每个权限限制。升级计划以添加额外的角色和权限。如需任何帮助，请<a>联系我们</a>。',
  scopes_per_role_other:
    '已达到<planName/>的{{count, number}}个角色每个权限限制。升级计划以添加额外的角色和权限。如需任何帮助，请<a>联系我们</a>。',
  hooks:
    '已达到<planName/>的{{count, number}}个 Webhook 限制。升级计划以创建更多 Webhook。如需任何帮助，请<a>联系我们</a>。',
  hooks_other:
    '已达到<planName/>的{{count, number}}个 Webhook 限制。升级计划以创建更多 Webhook。如需任何帮助，请<a>联系我们</a>。',
  mfa: '升级到付费计划以解锁MFA进行安全验证。如果需要任何帮助，请随时<a>联系我们</a>。',
  organizations: '升级到付费计划以解锁组织功能。如有任何需要，请不要犹豫<a>联系我们</a>。',
  /** UNTRANSLATED */
  third_party_apps:
    'Unlock Logto as IdP for third-party apps by upgrading to a paid plan. For any assistance, feel free to <a>contact us</a>.',
  /** UNTRANSLATED */
  sso_connectors:
    'Unlock enterprise sso by upgrading to a paid plan. For any assistance, feel free to <a>contact us</a>.',
  /** UNTRANSLATED */
  tenant_members:
    'Unlock collaboration feature by upgrading to a paid plan. For any assistance, feel free to <a>contact us</a>.',
  /** UNTRANSLATED */
  tenant_members_dev_plan:
    "You've reached your {{limit}}-member limit. Release a member or revoke a pending invitation to add someone new. Need more seats? Feel free to contact us.",
};

export default Object.freeze(paywall);
