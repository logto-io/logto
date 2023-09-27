const application_details = {
  page_title: '應用詳細資料',
  back_to_applications: '返回全部應用',
  check_guide: '查看指南',
  settings: '設置',
  settings_description: '應用程式用於在 Logto OIDC、登錄體驗、審計日誌等方面識別你的應用程式。',
  /** UNTRANSLATED */
  advanced_settings: 'Advanced settings',
  advanced_settings_description:
    '高級設置包括 OIDC 相關術語。你可以查看 Token Endpoint 以獲取更多信息。',
  /** UNTRANSLATED */
  application_roles: 'Roles',
  /** UNTRANSLATED */
  machine_logs: 'Machine logs',
  application_name: '應用程式姓名',
  application_name_placeholder: '我的應用程式',
  description: '說明',
  description_placeholder: '請輸入應用程式說明',
  config_endpoint: 'OpenID Provider 配置端點',
  authorization_endpoint: '授權端點',
  authorization_endpoint_tip: '進行驗證與授權的端點。用於 OpenID Connect 中的 <a>驗證</a> 流程。',
  logto_endpoint: 'Logto endpoint',
  application_id: '應用程式 ID',
  application_id_tip:
    '應用程式的唯一標識，通常由 Logto 生成。相當於 OpenID Connect 中的 <a>client_id</a>。',
  application_secret: '應用程式秘鑰',
  redirect_uri: '重定向 URI',
  redirect_uris: '重定向 URIs',
  redirect_uri_placeholder: 'https://your.website.com/app',
  redirect_uri_placeholder_native: 'io.logto://callback',
  redirect_uri_tip:
    '在用戶登錄完成（不論成功與否）後，重新導向的目標 URI。參見 OpenID Connect <a>AuthRequest</a> 以了解更多。',
  post_sign_out_redirect_uri: '登出後重定向的 URI',
  post_sign_out_redirect_uris: '登出後重定向的 URIs',
  post_sign_out_redirect_uri_placeholder: 'https://your.website.com/home',
  post_sign_out_redirect_uri_tip:
    '在用戶登出後，重新導向的目標 URI（可選）。在某些應用程式類型中可能無實質作用。',
  cors_allowed_origins: 'CORS 允許的來源',
  cors_allowed_origins_placeholder: 'https://your.website.com',
  cors_allowed_origins_tip:
    '所有重新導向 URI 的來源都將默認被允許。通常不需要對此欄位進行操作。參見 <a>MDN 文件</a> 以了解更多。',
  token_endpoint: 'Token Endpoint',
  user_info_endpoint: '用戶信息端點',
  enable_admin_access: '啟用管理訪問',
  enable_admin_access_label:
    '啟用或禁用對管理 API 的訪問。啟用後，你可以使用訪問令牌代表該應用程式調用管理 API。',
  always_issue_refresh_token: '始終發放 Refresh Token',
  always_issue_refresh_token_label:
    '啟用此配置將使 Logto 無論在驗證請求中是否提供 prompt=consent，都能始終發放 Refresh Token。然而，除非必要，否則不鼓勵這種做法，因為它與 OpenID Connect 不相容並可能引起問題。',
  refresh_token_ttl: 'Refresh Token 有效期（天數）',
  refresh_token_ttl_tip:
    'Refresh Token 可用來獲取新的訪問令牌，失效日期之前可用。獲取訪問令牌時，該令牌的期限將被延長至此值。',
  rotate_refresh_token: '旋轉 Refresh Token',
  rotate_refresh_token_label:
    '啟用此配置將使 Logto 当 Refresh Token 的原始有效期剩下 70% 时或当满足某些条件时，授予新的 Refresh Token 以获取新的 Access Token。<a>了解更多</a>',
  delete_description:
    '本操作會永久性地刪除該應用程式，且不可撤銷。輸入 <span>{{name}}</span> 確認。',
  enter_your_application_name: '輸入你的應用程式姓名',
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
