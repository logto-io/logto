const upsell = {
  pro_tag: 'PRO',
  upgrade_plan: '升級計劃',
  compare_plans: '比較計劃',
  contact_us: '聯繫我們',
  get_started: {
    title: '開始您無縫的身份管理之旅，選擇<planName/>！',
    description:
      '<planName/>非常適合您的個人項目或試用。要充分利用 Logto 團隊的功能，請升級並獲得無限制訪問高級功能：無限 MAU 使用、機器對機器集成、無縫 RBAC 管理、長期審計日誌等等。',
    view_plans: '查看計劃',
  },
  create_tenant: {
    title: '選擇您的租戶計劃',
    description:
      'Logto 提供創新且經濟實惠的定價計劃，旨在為不斷發展的公司提供競爭優勢。 <a>了解更多</a>',
    base_price: '基礎價格',
    monthly_price: '每月 {{value, number}}',
    mau_unit_price: 'MAU 單價',
    view_all_features: '查看所有功能',
    select_plan: '選擇<name/>',
    upgrade_to: '升級至<name/>',
    free_tenants_limit: '最多{{count, number}}個免費租戶',
    free_tenants_limit_other: '最多{{count, number}}個免費租戶',
    most_popular: '最受歡迎',
    upgrade_success: '成功升級至<name/>',
  },
  paywall: {
    applications:
      '已達到<planName/>的{{count, number}}個應用程式限制。為滿足您團隊的需求，請升級到付費計劃。如需任何幫助，請隨時<a>聯繫我們</a>。',
    applications_other:
      '已達到<planName/>的{{count, number}}個應用程式限制。為滿足您團隊的需求，請升級到付費計劃。如需任何幫助，請隨時<a>聯繫我們</a>。',
    machine_to_machine_feature:
      '升級到付費計劃以創建機器對機器應用程式，同時獲得所有高級功能。如需任何幫助，請隨時<a>聯繫我們</a>。',
    machine_to_machine:
      '已達到<planName/>的{{count, number}}個機器對機器應用程式限制。為滿足您團隊的需求，請升級到付費計劃。如需任何幫助，請隨時<a>聯繫我們</a>。',
    machine_to_machine_other:
      '已達到<planName/>的{{count, number}}個機器對機器應用程式限制。為滿足您團隊的需求，請升級到付費計劃。如需任何幫助，請隨時<a>聯繫我們</a>。',
    resources:
      '已達到<planName/>的{{count, number}}個 API 資源限制。升級計劃以滿足您團隊的需求。<a>聯繫我們</a>尋求幫助。',
    resources_other:
      '已達到<planName/>的{{count, number}}個 API 資源限制。升級計劃以滿足您團隊的需求。<a>聯繫我們</a>尋求幫助。',
    scopes_per_resource:
      '已達到<planName/>的{{count, number}}個 API 資源每個權限限制。立即升級以擴展。如需任何幫助，請<a>聯繫我們</a>。',
    scopes_per_resource_other:
      '已達到<planName/>的{{count, number}}個 API 資源每個權限限制。立即升級以擴展。如需任何幫助，請<a>聯繫我們</a>。',
    custom_domain:
      '通過升級到付費計劃解鎖自定義域功能和一系列高級福利。如需任何幫助，請<a>聯繫我們</a>。',
    social_connectors:
      '已達到<planName/>的{{count, number}}個社交連接器限制。為滿足您團隊的需求，請升級計劃以獲取額外的社交連接器，並可以使用 OIDC、OAuth 2.0 和 SAML 協議創建您自己的連接器。如需任何幫助，請<a>聯繫我們</a>。',
    social_connectors_other:
      '已達到<planName/>的{{count, number}}個社交連接器限制。為滿足您團隊的需求，請升級計劃以獲取額外的社交連接器，並可以使用 OIDC、OAuth 2.0 和 SAML 協議創建您自己的連接器。如需任何幫助，請<a>聯繫我們</a>。',
    standard_connectors_feature:
      '升級到付費計劃以使用 OIDC、OAuth 2.0 和 SAML 協議創建您自己的連接器，並獲得無限社交連接器和所有高級功能。如需任何幫助，請<a>聯繫我們</a>。',
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
    scopes_per_role:
      '已達到<planName/>的{{count, number}}個角色每個權限限制。升級計劃以添加額外的角色和權限。如需任何幫助，請<a>聯繫我們</a>。',
    scopes_per_role_other:
      '已達到<planName/>的{{count, number}}個角色每個權限限制。升級計劃以添加額外的角色和權限。如需任何幫助，請<a>聯繫我們</a>。',
    hooks:
      '已達到<planName/>的{{count, number}}個 Webhook 限制。升級計劃以創建更多 Webhook。如需任何幫助，請<a>聯繫我們</a>。',
    hooks_other:
      '已達到<planName/>的{{count, number}}個 Webhook 限制。升級計劃以創建更多 Webhook。如需任何幫助，請<a>聯繫我們</a>。',
  },
  mau_exceeded_modal: {
    title: 'MAU 超過限制，請升級您的計劃。',
    notification:
      '您當前的 MAU 已超過<planName/>的限制。請立即升級到高級計劃，以避免 Logto 服務的暫停。',
    update_plan: '更新計劃',
  },
  payment_overdue_modal: {
    title: '賬單逾期未付',
    notification:
      '糟糕！上一周期租戶 {{name}} 的賬單支付失敗。請立即支付賬單，以避免 Logto 服務的暫停。',
    unpaid_bills_last_cycle: '上一周期未支付賬單',
    update_payment: '更新支付',
  },
};

export default upsell;
