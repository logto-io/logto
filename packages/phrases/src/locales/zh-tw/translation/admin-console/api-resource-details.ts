const api_resource_details = {
  page_title: 'API 資源詳情',
  back_to_api_resources: '返回 API 資源',
  general_tab: '常規',
  permissions_tab: '權限',
  settings: '設定',
  settings_description:
    'API 資源，又稱資源指標，表示要請求的目標服務或資源，通常是表示資源身份的 URI 格式變數。',
  management_api_settings_description:
    'Logto 管理 API 是一個全面的 API 集合，使管理員能夠管理各種與身份有關的任務，執行安全策略，並遵守法規和標準。',
  management_api_notice:
    '這個 API 代表 Logto 實體，不能被修改或刪除。你可以使用管理 API 來執行多種與身份相關的任務。 <a>了解更多</a>',
  token_expiration_time_in_seconds: 'Token 過期時間（秒）',
  token_expiration_time_in_seconds_placeholder: '請輸入你的 token 過期時間',
  delete_description:
    '本操作會永久性地刪除該 API 資源，且不可撤銷。輸入 API 資源名稱 <span>{{name}}</span> 確認。',
  enter_your_api_resource_name: '輸入 API 資源名稱',
  api_resource_deleted: ' API 資源 {{name}} 已刪除.',
  permission: {
    create_button: '建立權限',
    create_title: '建立權限',
    create_subtitle: '定義此 API 所需的權限 (scope)。',
    confirm_create: '建立權限',
    edit_title: '編輯 API 權限',
    edit_subtitle: '定義 {{resourceName}} API 所需的權限 (scopes)。',
    name: '權限名稱',
    name_placeholder: 'read:resource',
    forbidden_space_in_name: '權限名稱不能包含空格。',
    description: '描述',
    description_placeholder: '能夠讀取資源',
    permission_created: '權限 "{{name}}" 已成功建立',
    delete_description: '如果刪除此權限，擁有該權限的使用者將失去由此權限授予的存取權限。',
    deleted: '成功刪除權限 "{{name}}"。',
  },
};

export default Object.freeze(api_resource_details);
