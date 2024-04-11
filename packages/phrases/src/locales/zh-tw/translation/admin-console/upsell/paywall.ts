const paywall = {
  applications:
    '已達到 <planName/> 的{{count, number}}個應用程式限制。升級計劃以滿足團隊需求。如需任何協助，歡迎<a>聯絡我們</a>。',
  applications_other:
    '已達到 <planName/> 的{{count, number}}個應用程式限制。升級計劃以滿足團隊需求。如需任何協助，歡迎<a>聯絡我們</a>。',
  machine_to_machine_feature:
    '升級至 <strong>Pro</strong> 計劃以獲得額外的機器對機器應用程式並享受所有高級功能。如有任何問題，請<a>聯絡我們</a>。',
  machine_to_machine:
    '已達到 <planName/> 的{{count, number}}個機器對機器應用程式限制。升級計劃以滿足團隊需求。如需任何協助，歡迎<a>聯絡我們</a>。',
  machine_to_machine_other:
    '已達到 <planName/> 的{{count, number}}個機器對機器應用程式限制。升級計劃以滿足團隊需求。如需任何協助，歡迎<a>聯絡我們</a>。',
  resources:
    '已達到<planName/>的{{count, number}}個 API 資源限制。升級計劃以滿足您團隊的需求。<a>聯繫我們</a>尋求幫助。',
  resources_other:
    '已達到<planName/>的{{count, number}}個 API 資源限制。升級計劃以滿足您團隊的需求。<a>聯繫我們</a>尋求幫助。',
  scopes_per_resource:
    '已達到<planName/>的{{count, number}}個 API 資源每個權限限制。立即升級以擴展。如需任何幫助，請<a>聯繫我們</a>。',
  scopes_per_resource_other:
    '已達到<planName/>的{{count, number}}個 API 資源每個權限限制。立即升級以擴展。如需任何幫助，請<a>聯繫我們</a>。',
  custom_domain:
    '升級至 <strong>Hobby</strong> 或 <strong>Pro</strong> 計劃以解鎖自訂網域功能。如有任何需要協助，請隨時<a>聯繫我們</a>。',
  social_connectors:
    '已達到<planName/>的{{count, number}}個社交連接器限制。為滿足您團隊的需求，請升級計劃以獲取額外的社交連接器，並可以使用 OIDC、OAuth 2.0 和 SAML 協議創建您自己的連接器。如需任何幫助，請<a>聯繫我們</a>。',
  social_connectors_other:
    '已達到<planName/>的{{count, number}}個社交連接器限制。為滿足您團隊的需求，請升級計劃以獲取額外的社交連接器，並可以使用 OIDC、OAuth 2.0 和 SAML 協議創建您自己的連接器。如需任何幫助，請<a>聯繫我們</a>。',
  standard_connectors_feature:
    '升級至 <strong>Hobby</strong> 或 <strong>Pro</strong> 計劃以使用 OIDC、OAuth 2.0 和 SAML 協議創建您自己的連接器，享有無限社交連接器和所有高級功能。如需任何協助，歡迎<a>聯繫我們</a>。',
  standard_connectors:
    '已達到<planName/>的{{count, number}}個社交連接器限制。為滿足您團隊的需求，請升級計劃以獲取額外的社交連接器，並可以使用 OIDC、OAuth 2.0 和 SAML 協議創建您自己的連接器。如需任何幫助，請<a>聯繫我們</a>。',
  standard_connectors_other:
    '已達到<planName/>的{{count, number}}個社交連接器限制。為滿足您團隊的需求，請升級計劃以獲取額外的社交連接器，並可以使用 OIDC、OAuth 2.0 和 SAML 協議創建您自己的連接器。如需任何幫助，請<a>聯繫我們</a>。',
  standard_connectors_pro:
    '已達到<planName/>的{{count, number}}個標準連接器限制。為滿足您團隊的需求，請升級至企業版計劃以獲取額外的社交連接器，並可以使用 OIDC、OAuth 2.0 和 SAML 協議創建您自己的連接器。如需任何幫助，請<a>聯繫我們</a>。',
  standard_connectors_pro_other:
    '已達到<planName/>的{{count, number}}個標準連接器限制。為滿足您團隊的需求，請升級至企業版計劃以獲取額外的社交連接器，並可以使用 OIDC、OAuth 2.0 和 SAML 協議創建您自己的連接器。如需任何幫助，請<a>聯繫我們</a>。',
  roles:
    '已達到<planName/>的{{count, number}}個角色限制。升級計劃以添加額外的角色和權限。如需任何幫助，請<a>聯繫我們</a>。',
  roles_other:
    '已達到<planName/>的{{count, number}}個角色限制。升級計劃以添加額外的角色和權限。如需任何幫助，請<a>聯繫我們</a>。',
  machine_to_machine_roles:
    '{{count, number}} machine-to-machine角色已達到<planName/>的限制。升級計劃以添加額外的角色和權限。如果需要任何幫助，請隨時<a>聯繫我們</a>。',
  machine_to_machine_roles_other:
    '{{count, number}} machine-to-machine角色已達到<planName/>的限制。升級計劃以添加額外的角色和權限。如果需要任何幫助，請隨時<a>聯繫我們</a>。',
  scopes_per_role:
    '已達到<planName/>的{{count, number}}個角色每個權限限制。升級計劃以添加額外的角色和權限。如需任何幫助，請<a>聯繫我們</a>。',
  scopes_per_role_other:
    '已達到<planName/>的{{count, number}}個角色每個權限限制。升級計劃以添加額外的角色和權限。如需任何幫助，請<a>聯繫我們</a>。',
  hooks:
    '已達到<planName/>的{{count, number}}個 Webhook 限制。升級計劃以創建更多 Webhook。如需任何幫助，請<a>聯繫我們</a>。',
  hooks_other:
    '已達到<planName/>的{{count, number}}個 Webhook 限制。升級計劃以創建更多 Webhook。如需任何幫助，請<a>聯繫我們</a>。',
  mfa: '升級到付費計劃以解鎖MFA以提高安全性。如果需要任何協助，請隨時<a>聯繫我們</a>。',
  organizations: '升級到付費計劃以解鎖組織。如果需要任何協助，請隨時<a>聯繫我們</a>。',
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
