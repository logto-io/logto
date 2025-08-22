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
    '已達到 <planName/> 的{{count, number}}個 API 資源限制。升級計劃以滿足您團隊的需求。<a>聯繫我們</a>尋求幫助。',
  resources_other:
    '已達到 <planName/> 的{{count, number}}個 API 資源限制。升級計劃以滿足您團隊的需求。<a>聯繫我們</a>尋求幫助。',
  scopes_per_resource:
    '已達到 <planName/> 的{{count, number}}個 API 資源每個權限限制。立即升級以擴展。如需任何幫助，請<a>聯繫我們</a>。',
  scopes_per_resource_other:
    '已達到 <planName/> 的{{count, number}}個 API 資源每個權限限制。立即升級以擴展。如需任何幫助，請<a>聯繫我們</a>。',
  custom_domain:
    '升級至 <strong>Hobby</strong> 或 <strong>Pro</strong> 計劃以解鎖自訂網域功能。如有任何需要協助，請隨時<a>聯繫我們</a>。',
  social_connectors:
    '已達到 <planName/> 的{{count, number}}個社交連接器限制。為滿足您團隊的需求，請升級計劃以獲取額外的社交連接器，並可以使用 OIDC、OAuth 2.0 和 SAML 協議創建您自己的連接器。如需任何幫助，請<a>聯繫我們</a>。',
  social_connectors_other:
    '已達到 <planName/> 的{{count, number}}個社交連接器限制。為滿足您團隊的需求，請升級計劃以獲取額外的社交連接器，並可以使用 OIDC、OAuth 2.0 和 SAML 協議創建您自己的連接器。如需任何幫助，請<a>聯繫我們</a>。',
  standard_connectors_feature:
    '升級至 <strong>Hobby</strong> 或 <strong>Pro</strong> 計劃以使用 OIDC、OAuth 2.0 和 SAML 協議創建您自己的連接器，享有無限社交連接器和所有高級功能。如需任何協助，歡迎<a>聯繫我們</a>。',
  standard_connectors:
    '已達到 <planName/> 的{{count, number}}個社交連接器限制。為滿足您團隊的需求，請升級計劃以獲取額外的社交連接器，並可以使用 OIDC、OAuth 2.0 和 SAML 協議創建您自己的連接器。如需任何幫助，請<a>聯繫我們</a>。',
  standard_connectors_other:
    '已達到 <planName/> 的{{count, number}}個社交連接器限制。為滿足您團隊的需求，請升級計劃以獲取額外的社交連接器，並可以使用 OIDC、OAuth 2.0 和 SAML 協議創建您自己的連接器。如需任何幫助，請<a>聯繫我們</a>。',
  standard_connectors_pro:
    '已達到 <planName/> 的{{count, number}}個標準連接器限制。為滿足您團隊的需求，請升級至企業版計劃以獲取額外的社交連接器，並可以使用 OIDC、OAuth 2.0 和 SAML 協議創建您自己的連接器。如需任何幫助，請<a>聯絡我們</a>。',
  standard_connectors_pro_other:
    '已達到 <planName/> 的{{count, number}}個標準連接器限制。為滿足您團隊的需求，請升級至企業版計劃以獲取額外的社交連接器，並可以使用 OIDC、OAuth 2.0 和 SAML 協議創建您自己的連接器。如需任何幫助，請<a>聯繫我們</a>。',
  roles: '升級計劃以增加額外的角色和權限。如需任何協助，歡迎<a>聯絡我們</a>。',
  scopes_per_role:
    '已達到 <planName/> 的{{count, number}}個角色每個權限限制。升級計劃以添加額外的角色和權限。如需任何幫助，請<a>聯繫我們</a>。',
  scopes_per_role_other:
    '已達到 <planName/> 的{{count, number}}個角色每個權限限制。升級計劃以添加額外的角色和權限。如需任何幫助，請<a>聯繫我們</a>。',
  saml_applications_oss:
    '額外的 SAML 應用程式可在 Logto 企業版計劃中使用。如需協助，請與我們聯絡。',
  logto_pricing_button_text: 'Logto 雲端定價',
  saml_applications: '額外的 SAML 應用程式可在 Logto 企業版計劃中使用。如需協助，請聯絡我們。',
  saml_applications_add_on:
    '透過升級到付費計劃解鎖 SAML 應用功能。如需任何協助，歡迎<a>聯絡我們</a>。',
  hooks:
    '已達到 <planName/> 的{{count, number}}個 Webhook 限制。升級計劃以創建更多 Webhook。如需任何幫助，請<a>聯繫我們</a>。',
  hooks_other:
    '已達到 <planName/> 的{{count, number}}個 Webhook 限制。升級計劃以創建更多 Webhook。如需任何幫助，請<a>聯繫我們</a>。',
  mfa: '升級到付費計劃以解鎖 MFA 以提高安全性。如果需要任何協助，請隨時<a>聯絡我們</a>。',
  organizations: '升級到付費計劃以解鎖組織。如果需要任何協助，請隨時<a>聯繫我們</a>。',
  third_party_apps:
    '透過升級到付費計劃將 Logto 解鎖為第三方應用程式的 IdP。如需任何協助，歡迎<a>聯繫我們</a>。',
  sso_connectors: '通過升級到付費計劃來解鎖企業 SSO。如需任何協助，歡迎<a>聯繫我們</a>。',
  tenant_members: '通過升級到付費計劃來解鎖合作功能。如需任何協助，歡迎<a>聯繫我們</a>。',
  tenant_members_dev_plan:
    '您已達到{{limit}}成員限制。釋放一個成員，或撤銷一個待處理的邀請以添加新成員。需要更多名額？歡迎隨時聯繫我們。',
  custom_jwt: {
    title: '新增自訂 claim',
    description:
      '升級至付費計劃以解鎖自訂 JWT 功能和高級福利。如果有任何問題，請隨時<a>聯繫我們</a>。',
  },
  bring_your_ui: '升級到付費計劃以獲得自訂 UI 功能和高級福利。',
  security_features:
    '通過升級到 Pro 計劃解鎖高級安全功能。如果你有任何問題，請隨時<a>聯繫我們</a>。',
  collect_user_profile:
    '升級到付費計劃以解鎖在新用戶註冊期間收集更多用戶資料資訊的功能。如有任何問題，請不要猶豫 <a>聯繫我們</a>。',
};

export default Object.freeze(paywall);
