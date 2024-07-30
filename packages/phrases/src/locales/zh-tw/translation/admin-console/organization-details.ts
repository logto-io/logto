const organization_details = {
  page_title: '組織詳情',
  delete_confirmation: '刪除後，所有成員將失去在這個組織中的成員資格和角色。此操作無法撤銷。',
  organization_id: '組織編號',
  settings_description: '組織代表可以訪問您的應用程序的團隊、業務客戶和合作夥伴公司。',
  name_placeholder: '組織名稱，不需要是唯一的。',
  description_placeholder: '組織的描述。',
  member: '成員',
  member_other: '成員',
  add_members_to_organization: '將成員添加到 {{name}} 組織',
  add_members_to_organization_description:
    '通過搜索名稱、電子郵件、電話或用戶 ID 來查找適合的用戶。現有成員不會顯示在搜索結果中。',
  add_with_organization_role: '添加組織角色',
  user: '用戶',
  application: '應用程式',
  application_other: '應用程式',
  add_applications_to_organization: '將應用程式添加到組織 {{name}}',
  add_applications_to_organization_description:
    '通過搜索應用程式 ID、名稱或描述來查找適合的應用程式。現有的應用程式不會顯示在搜索結果中。',
  at_least_one_application: '至少需要一個應用程式。',
  remove_application_from_organization: '從組織中移除應用程式',
  remove_application_from_organization_description:
    '移除後，應用程式將失去在此組織中的關聯和角色。此操作無法撤銷。',
  search_application_placeholder: '按應用程式 ID、名稱或描述搜尋',
  roles: '組織角色',
  authorize_to_roles: '授權 {{name}} 訪問以下角色：',
  edit_organization_roles: '編輯組織角色',
  edit_organization_roles_title: '編輯 {{name}} 的組織角色',
  remove_user_from_organization: '從組織中刪除用戶',
  remove_user_from_organization_description:
    '刪除後，用戶將失去在這個組織中的成員資格和角色。此操作無法撤銷。',
  search_user_placeholder: '按名稱、電子郵件、電話或用戶 ID 搜尋',
  at_least_one_user: '至少需要一個用戶。',
  organization_roles_tooltip: '分配給此組織中的 {{type}} 的角色。',
  custom_data: '自訂數據',
  custom_data_tip: '自訂數據是一個可用於存儲與組織相關的附加數據的 JSON 對象。',
  invalid_json_object: '無效的 JSON 對象。',
  branding: {
    logo: '組織標誌',
    logo_tooltip:
      '你可以通過組織 ID 顯示此標誌在登錄體驗中；如果啟用了暗黑模式，則需要使用標誌的暗色版本。<a>了解更多</a>',
  },
  jit: {
    title: '即時配置',
    description:
      '通過某些身份驗證方法，用户首次登錄時將自動加入組織並分配角色。你可以設定即時配置的要求。',
    email_domain: '電子郵件域配置',
    email_domain_description:
      '新用户使用驗證的電子郵件地址註冊或通過社交登錄時，將自動加入組織。<a>了解更多</a>',
    email_domain_placeholder: '輸入電子郵件域以進行即時配置',
    invalid_domain: '無效的域名',
    domain_already_added: '域名已添加',
    sso_enabled_domain_warning:
      '你已輸入一個或多個與企業 SSO 相關的電子郵件域。擁有這些電子郵件的用戶將遵循標準 SSO 流程，除非配置了企業 SSO 配置，否則不會配置到此組織。',
    enterprise_sso: '企業 SSO 配置',
    no_enterprise_connector_set:
      '您尚未設置任何企業 SSO 連接器。請先添加連接器以啟用企業 SSO 配置。<a>設置</a>',
    add_enterprise_connector: '添加企業連接器',
    enterprise_sso_description:
      '首次通過企業 SSO 登錄的新用户或現有用户將自動加入組織。<a>了解更多</a>',
    organization_roles: '默認組織角色',
    organization_roles_description: '通過即時配置加入組織的用戶分配角色。',
  },
  mfa: {
    title: '多因素身份驗證 (MFA)',
    tip: '當需要 MFA 時，未設置 MFA 的用戶在嘗試交換組織令牌時將會被拒絕。此設置不影響用戶身份驗證。',
    description: '要求用戶設置多因素身份驗證才能訪問此組織。',
    no_mfa_warning:
      '你的租戶未啟用任何多因素身份驗證方法。除非啟用了至少一種<a>多因素身份驗證方法</a>，否則用戶將無法訪問此組織。',
  },
};

export default Object.freeze(organization_details);
