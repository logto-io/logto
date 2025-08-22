const paywall = {
  applications:
    '已达到 <planName/> 的{{count, number}}个应用限制。升级计划以满足团队需求。如需帮助，请随时 <a>联系我们</a>。',
  applications_other:
    '已达到 <planName/> 的{{count, number}}个应用限制。升级计划以满足团队需求。如需帮助，请随时 <a>联系我们</a>。',
  machine_to_machine_feature:
    '升级至 <strong>Pro</strong> 套餐，解锁额外机器对机器应用，享受所有高级功能。 <a>如果有疑问，请联系我们</a>。',
  machine_to_machine:
    '已达到 <planName/> 的{{count, number}}个机器对机器应用限制。升级计划以满足团队需求。如需帮助，请随时 <a>联系我们</a>。',
  machine_to_machine_other:
    '已达到 <planName/> 的{{count, number}}个机器对机器应用限制。升级计划以满足团队需求。如需帮助，请随时 <a>联系我们</a>。',
  resources:
    '已达到 <planName/> 的{{count, number}}个 API 资源限制。升级计划以满足您团队的需求。 <a>联系我们</a> 寻求帮助。',
  resources_other:
    '已达到 <planName/> 的{{count, number}}个 API 资源限制。升级计划以满足您团队的需求。 <a>联系我们</a> 寻求帮助。',
  scopes_per_resource:
    '已达到 <planName/> 的{{count, number}}个 API 资源每个权限限制。立即升级以扩展。如需任何帮助，请 <a>联系我们</a>。',
  scopes_per_resource_other:
    '已达到 <planName/> 的{{count, number}}个 API 资源每个权限限制。立即升级以扩展。如需任何帮助，请 <a>联系我们</a>。',
  custom_domain:
    '升级至 <strong>Hobby</strong> 或 <strong>Pro</strong> 套餐，解锁自定义域功能。如有任何需要，请不要犹豫 <a>联系我们</a>。',
  social_connectors:
    '已达到 <planName/> 的{{count, number}}个社交连接器限制。为满足您团队的需求，请升级计划以获取额外的社交连接器，并可以使用 OIDC、OAuth 2.0 和 SAML 协议创建您自己的连接器。如需任何帮助，请 <a>联系我们</a>。',
  social_connectors_other:
    '已达到 <planName/> 的{{count, number}}个社交连接器限制。为满足您团队的需求，请升级计划以获取额外的社交连接器，并可以使用 OIDC、OAuth 2.0 和 SAML 协议创建您自己的连接器。如需任何帮助，请 <a>联系我们</a>。',
  standard_connectors_feature:
    '升级至 <strong>Hobby</strong> 或 <strong>Pro</strong> 套餐，创建自己的连接器，可使用 OIDC、OAuth 2.0 和 SAML 协议，还可以享受无限社交连接器和所有高级功能。需要任何帮助，请随时 <a>联系我们</a>。',
  standard_connectors:
    '已达到 <planName/> 的{{count, number}}个社交连接器限制。为满足您团队的需求，请升级计划以获取额外的社交连接器，并可以使用 OIDC、OAuth 2.0 和 SAML 协议创建您自己的连接器。如需任何帮助，请 <a>联系我们</a>。',
  standard_connectors_other:
    '已达到 <planName/> 的{{count, number}}个社交连接器限制。为满足您团队的需求，请升级计划以获取额外的社交连接器，并可以使用 OIDC、OAuth 2.0 和 SAML 协议创建您自己的连接器。如需任何帮助，请 <a>联系我们</a>。',
  standard_connectors_pro:
    '已达到 <planName/> 的{{count, number}}个标准连接器限制。为满足您团队的需求，请升级至企业版计划以获取额外的社交连接器，并可以使用 OIDC、OAuth 2.0 和 SAML 协议创建您自己的连接器。如需任何帮助，请 <a>联系我们</a>。',
  standard_connectors_pro_other:
    '已达到 <planName/> 的{{count, number}}个标准连接器限制。为满足您团队的需求，请升级至企业版计划以获取额外的社交连接器，并可以使用 OIDC、OAuth 2.0 和 SAML 协议创建您自己的连接器。如需任何帮助，请 <a>联系我们</a>。',
  roles: '升级计划以添加额外的角色和权限。如需任何帮助，请随时 <a>联系我们</a>。',
  scopes_per_role:
    '已达到 <planName/> 的{{count, number}}个角色每个权限限制。升级计划以添加额外的角色和权限。如需任何帮助，请 <a>联系我们</a>。',
  scopes_per_role_other:
    '已达到 <planName/> 的{{count, number}}个角色每个权限限制。升级计划以添加额外的角色和权限。如需任何帮助，请 <a>联系我们</a>。',
  saml_applications_oss: '额外的 SAML 应用可用于 Logto Enterprise 计划。如需帮助，请联系我们。',
  logto_pricing_button_text: 'Logto 云定价',
  saml_applications: '额外的 SAML 应用可在 Logto Enterprise 计划中使用。如果需要帮助，请联系我们。',
  saml_applications_add_on:
    '通过升级到付费计划解锁 SAML 应用功能。如需任何帮助，请随时 <a>联系我们</a>。',
  hooks:
    '已达到 <planName/> 的{{count, number}}个 Webhook 限制。升级计划以创建更多 Webhook。如需任何帮助，请 <a>联系我们</a>。',
  hooks_other:
    '已达到 <planName/> 的{{count, number}}个 Webhook 限制。升级计划以创建更多 Webhook。如需任何帮助，请 <a>联系我们</a>。',
  mfa: '升级到付费计划以解锁 MFA 进行安全验证。如果需要任何帮助，请随时 <a>联系我们</a>。',
  organizations: '升级到付费计划以解锁组织功能。如有任何需要，请不要犹豫 <a>联系我们</a>。',
  third_party_apps:
    '通过升级到付费计划，可将 Logto 解锁为第三方应用的 IdP。如需任何帮助，请随时 <a>联系我们</a>。',
  sso_connectors: '通过升级到付费计划，可解锁企业 SSO 功能。如需任何帮助，请随时 <a>联系我们</a>。',
  tenant_members: '通过升级到付费计划，可解锁协作功能。如需任何帮助，请随时 <a>联系我们</a>。',
  tenant_members_dev_plan:
    '已达到 {{limit}}-成员限制。释放一个成员或撤销待定邀请以添加新成员。需要更多名额？请随时联系我们。',
  custom_jwt: {
    title: '添加自定义声明',
    description:
      '升级到付费计划以获取自定义 JWT 功能和高级福利。如有任何问题，请不要犹豫 <a>联系我们</a>。',
  },
  bring_your_ui: '升级到付费计划，可带上自定义界面功能和高级福利。',
  security_features:
    '通过升级到 Pro 计划解锁高级安全功能。如有任何问题，请不要犹豫 <a>联系我们</a>。',
  collect_user_profile:
    '升级到付费计划以解锁在新用户注册期间收集更多用户资料信息的功能。如有任何问题，请不要犹豫 <a>联系我们</a>。',
};

export default Object.freeze(paywall);
