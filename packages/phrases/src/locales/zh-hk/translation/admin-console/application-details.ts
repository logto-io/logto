const application_details = {
  page_title: '應用程式詳情',
  back_to_applications: '返回全部應用程式',
  check_guide: '查看指南',
  settings: '設定',
  settings_description: '應用程式用於在 Logto OIDC、登入體驗、審計日誌等方面識別你的應用程式。',
  /** UNTRANSLATED */
  advanced_settings: 'Advanced settings',
  advanced_settings_description:
    '高級設定包括 OIDC 相關術語。你可以查看 Token Endpoint 以獲取更多資訊。',
  /** UNTRANSLATED */
  application_roles: 'Roles',
  /** UNTRANSLATED */
  machine_logs: 'Machine logs',
  application_name: '應用程式名稱',
  application_name_placeholder: '我的應用程式',
  description: '描述',
  description_placeholder: '請輸入應用程式描述',
  config_endpoint: 'OpenID Provider 配置端點',
  authorization_endpoint: '授權端點',
  authorization_endpoint_tip: '進行驗證和授權的端點。用於 OpenID Connect 中的<a> 驗證 </a> 流程。',
  logto_endpoint: 'Logto endpoint',
  application_id: '應用程式 ID',
  application_id_tip:
    '應用程式的唯一標識，通常由 Logto 生成。等價於 OpenID Connect 中的<a> client_id </a>。',
  application_secret: '應用程式密鑰',
  redirect_uri: '重定向 URI',
  redirect_uris: '重定向 URIs',
  redirect_uri_placeholder: 'https://your.website.com/app',
  redirect_uri_placeholder_native: 'io.logto://callback',
  redirect_uri_tip:
    '在使用者登入完成（不論成功與否）後重定向的目標 URI。參見 OpenID Connect <a> AuthRequest </a> 以瞭解更多。',
  post_sign_out_redirect_uri: '登出後重定向 URI',
  post_sign_out_redirect_uris: '登出後重定向 URIs',
  post_sign_out_redirect_uri_placeholder: 'https://your.website.com/home',
  post_sign_out_redirect_uri_tip:
    '在使用者登出後重定向的目標 URI（可選）。在某些應用程式類型中可能無實質作用。',
  cors_allowed_origins: 'CORS 允許的來源',
  cors_allowed_origins_placeholder: 'https://your.website.com',
  cors_allowed_origins_tip:
    '所有重定向 URI 的來源將預設被允許。通常不需要對此欄位進行操作。參見 <a>MDN 文檔</a> 以瞭解更多。',
  token_endpoint: 'Token Endpoint',
  user_info_endpoint: '用戶信息端點',
  enable_admin_access: '啟用管理訪問',
  enable_admin_access_label:
    '啟用或禁用對管理 API 的訪問。啟用後，你可以使用訪問權杖代表該應用程式調用管理 API。',
  always_issue_refresh_token: '始終發放 Refresh Token',
  always_issue_refresh_token_label:
    '啟用此配置將允許 Logto 發行 Refresh Token，無論是否在驗證請求中呈現 `prompt=consent`。但是，除非必要，否則不建議這樣做，因為它不兼容 OpenID Connect，可能會引起問題。',
  refresh_token_ttl: 'Refresh Token 的有效期（天）',
  refresh_token_ttl_tip:
    'Refresh Token 可用來在其過期之前請求新的訪問權杖的持續時間。訪問令牌將將缺省的 TTL 延長到此值。',
  rotate_refresh_token: '旋轉 Refresh Token',
  rotate_refresh_token_label:
    '啟用後，當原始 TTL 達到 70% 或滿足某些條件時就可以在令牌請求中為 Refresh Token 發行新的 Refresh Token。 <a>瞭解更多。</a>',
  delete_description: '本操作會永久性地刪除該應用，且不可撤銷。輸入 <span>{{name}}</span> 確認。',
  enter_your_application_name: '輸入你的應用程式名稱',
  application_deleted: '應用 {{name}} 成功刪除。',
  redirect_uri_required: '至少需要輸入一個重定向 URL。',
  roles: {
    /** UNTRANSLATED */
    name_column: 'Role',
    /** UNTRANSLATED */
    description_column: 'Description',
    /** UNTRANSLATED */
    assign_button: 'Assign Roles',
    /** UNTRANSLATED */
    delete_description:
      'This action will remove this role from this machine-to-machine app. The role itself will still exist, but it will no longer be associated with this machine-to-machine app.',
    /** UNTRANSLATED */
    deleted: '{{name}} was successfully removed from this user.',
    /** UNTRANSLATED */
    assign_title: 'Assign roles to {{name}}',
    /** UNTRANSLATED */
    assign_subtitle: 'Authorize {{name}} one or more roles',
    /** UNTRANSLATED */
    assign_role_field: 'Assign roles',
    /** UNTRANSLATED */
    role_search_placeholder: 'Search by role name',
    /** UNTRANSLATED */
    added_text: '{{value, number}} added',
    /** UNTRANSLATED */
    assigned_user_count: '{{value, number}} users',
    /** UNTRANSLATED */
    confirm_assign: 'Assign roles',
    /** UNTRANSLATED */
    role_assigned: 'Successfully assigned role(s)',
    /** UNTRANSLATED */
    search: 'Search by role name, description or ID',
    /** UNTRANSLATED */
    empty: 'No role available',
  },
};

export default Object.freeze(application_details);
