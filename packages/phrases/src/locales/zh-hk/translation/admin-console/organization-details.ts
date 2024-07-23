const organization_details = {
  page_title: '組織詳細資料',
  delete_confirmation: '刪除後，所有成員將失去他們在此組織的成員資格和角色。此操作無法撤銷。',
  organization_id: '組織 ID',
  settings_description: '組織代表可以訪問您的應用程式的團隊、商業客戶和合作夥伴公司。',
  name_placeholder: '組織的名稱，不需要是唯一的。',
  description_placeholder: '組織的描述。',
  member: '成員',
  member_other: '成員',
  add_members_to_organization: '將成員新增至組織 {{name}}',
  add_members_to_organization_description:
    '通過搜索姓名、電子郵件、電話或使用者 ID 尋找合適的使用者。現有成員不會顯示在搜尋結果中。',
  add_with_organization_role: '以組織角色添加',
  user: '使用者',
  application: '應用程式',
  application_other: '應用程式',
  add_applications_to_organization: '將應用程式新增至組織 {{name}}',
  add_applications_to_organization_description:
    '通過搜索應用程式 ID、名稱或描述尋找合適的應用程式。現有應用程式不會顯示在搜尋結果中。',
  at_least_one_application: '至少需要一個應用程式。',
  remove_application_from_organization: '從組織中移除應用程式',
  remove_application_from_organization_description:
    '移除後，應用程式將失去它在此組織中的關聯和角色。此操作無法撤銷。',
  search_application_placeholder: '按應用程式 ID、名稱或描述搜索',
  roles: '組織角色',
  authorize_to_roles: '授權 {{name}} 存取以下角色：',
  edit_organization_roles: '編輯組織角色',
  edit_organization_roles_title: '編輯 {{name}} 的組織角色',
  remove_user_from_organization: '從組織中移除使用者',
  remove_user_from_organization_description:
    '移除後，使用者將失去他們在此組織的成員資格和角色。此操作無法撤銷。',
  search_user_placeholder: '按姓名、電子郵件、電話或使用者 ID 搜尋',
  at_least_one_user: '至少需要一名使用者。',
  organization_roles_tooltip: '{{type}} 在此組織中分配的角色。',
  custom_data: '自訂資料',
  custom_data_tip: '自訂資料是一個 JSON 物件，可用於存儲與組織相關的附加資料。',
  invalid_json_object: '無效的 JSON 物件。',
  branding: {
    logo: '組織標誌',
    logo_tooltip:
      '你可以傳遞組織 ID 以在登錄體驗中顯示此標誌；如果在 Omni 登錄體驗設置中啟用了深色模式，則需要使用深色版本的標誌。<a>了解更多</a>',
  },
  jit: {
    title: '即時供應',
    description:
      '使用者可以通過某些身份驗證方法在首次登錄時自動加入組織並被分配角色。你可以設置即時供應的要求。',
    email_domain: '電子郵件域名供應',
    email_domain_description:
      '使用已驗證電子郵件地址或通過已驗證電子郵件地址社交登錄的新使用者將自動加入組織。<a>了解更多</a>',
    email_domain_placeholder: '輸入即時供應的電子郵件域名',
    invalid_domain: '無效的域名',
    domain_already_added: '域名已添加',
    sso_enabled_domain_warning:
      '你輸入了一個或多個與企業 SSO 聯繫的電子郵件域名。使用這些電子郵件的使用者將遵循標準 SSO 流程，除非配置了企業 SSO 供應，否則不會被供應到此組織。',
    enterprise_sso: '企業 SSO 供應',
    no_enterprise_connector_set:
      '你尚未設置任何企業 SSO 連接器。首先添加連接器以啟用企業 SSO 供應。<a>設置</a>',
    add_enterprise_connector: '添加企業連接器',
    enterprise_sso_description:
      '首次通過企業 SSO 登錄的新使用者或現有使用者將自動加入組織。<a>了解更多</a>',
    organization_roles: '默認組織角色',
    organization_roles_description: '通過即時供應加入組織時分配角色給使用者。',
  },
  mfa: {
    title: '多因素身份驗證（MFA）',
    tip: '當需要 MFA 時，未配置 MFA 的使用者在嘗試交換組織令牌時將被拒絕。此設置不影響使用者身份驗證。',
    description: '要求使用者配置多因素身份驗證以訪問此組織。',
    no_mfa_warning:
      '你的租戶未啟用任何多因素身份驗證方法。使用者在啟用至少一種 <a>多因素身份驗證方法</a> 之前將無法訪問此組織。',
  },
};

export default Object.freeze(organization_details);
