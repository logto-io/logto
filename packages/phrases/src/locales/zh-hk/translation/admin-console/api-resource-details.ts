const api_resource_details = {
  page_title: 'API 資源詳情',
  back_to_api_resources: '返回 API 資源',
  settings_tab: '設置',
  permissions_tab: '權限',
  settings: '設置',
  settings_description:
    'API 資源，又稱資源指示器，表示要請求的目標服務或資源，通常是表示資源身份的 URI 格式變數。',
  token_expiration_time_in_seconds: 'Token 過期時間（秒）',
  token_expiration_time_in_seconds_placeholder: '請輸入你的 token 過期時間',
  delete_description:
    '本操作會永久性地刪除該 API 資源，且不可撤銷。輸入 API 資源名稱 <span>{{name}}</span> 確認。',
  enter_your_api_resource_name: '輸入 API 資源名稱',
  api_resource_deleted: ' API 資源 {{name}} 已刪除.',
  permission: {
    create_button: '創建權限',
    create_title: '創建權限',
    create_subtitle: '定義此 API 所需的權限 (scope)。',
    confirm_create: '創建權限',
    name: '權限名稱',
    name_placeholder: 'read:resource',
    forbidden_space_in_name: '權限名稱不能包含空格。',
    description: '描述',
    description_placeholder: '能夠讀取資源',
    permission_created: '權限 "{{name}}" 已成功創建',
    delete_description: '如果刪除此權限，擁有該權限的用戶將失去由此權限授予的訪問權限。',
    deleted: '成功刪除權限 "{{name}}"！',
  },
};

export default api_resource_details;
