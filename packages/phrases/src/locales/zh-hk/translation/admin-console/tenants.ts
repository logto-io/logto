const tenants = {
  title: '设置',
  description: '高效管理租戶設置並自訂您的域名。',
  tabs: {
    settings: '设置',
    domains: '網域',
  },
  settings: {
    title: '設定',
    tenant_id: '租户ID',
    tenant_name: '租户名称',
    environment_tag: '环境标识',
    environment_tag_description: '標籤不會改變服務。它們只是協助您區分不同的環境。',
    environment_tag_development: '開發',
    environment_tag_staging: '預備',
    environment_tag_production: '產品',
    tenant_info_saved: '租戶信息成功保存。',
  },
  deletion_card: {
    title: '刪除',
    tenant_deletion: '刪除租戶',
    tenant_deletion_description: '刪除租戶將導致永久刪除所有相關的用戶數據和配置。請謹慎操作。',
    tenant_deletion_button: '刪除租戶',
  },
  create_modal: {
    title: '創建租戶',
    subtitle: '創建新租戶來區分資源及使用者。',
    create_button: '創建租戶',
    tenant_name_placeholder: '我的租戶',
  },
  delete_modal: {
    title: '刪除租戶',
    description_line1:
      '您確定要刪除帶有環境標記 "<span>{{tag}}</span>" 的 "<span>{{name}}</span>" 租戶嗎？此操作無法撤銷，且會永久刪除您的所有數據和帳戶信息。',
    description_line2:
      '在刪除帳戶之前，也許我們可以為您提供幫助。<span><a>通過電子郵件與我們聯繫</a></span>',
    description_line3: '如果您確定要繼續，請輸入租戶名稱 "<span>{{name}}</span>" 以進行確認。',
    delete_button: '永久刪除',
  },
  tenant_landing_page: {
    title: '您尚未建立租戶',
    description:
      '要開始使用 Logto 配置您的項目，請創建一個新的租戶。如果您需要退出或刪除您的帳戶，只需單擊右上角的頭像按鈕。',
    create_tenant_button: '創建租戶',
  },
};

export default tenants;
