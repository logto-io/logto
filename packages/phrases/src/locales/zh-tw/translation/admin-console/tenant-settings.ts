const tenant_settings = {
  title: '設置',
  description: '高效管理租戶設定並自訂您的網域。',
  tabs: {
    settings: '設置',
    domains: '網域',
  },
  settings: {
    title: '設定',
    tenant_id: '租戶 ID',
    tenant_name: '租戶名稱',
    environment_tag: '環境標籤',
    environment_tag_description: '標籤不會改變服務。它們只是指導您區分各種環境。',
    environment_tag_development: '開發',
    environment_tag_staging: '預置',
    environment_tag_production: '產品',
    tenant_info_saved: '租戶資訊成功儲存。',
  },
  deletion_card: {
    title: '刪除',
    tenant_deletion: '刪除租戶',
    tenant_deletion_description: '刪除租戶將導致所有相關的使用者資料和設定永久移除。請謹慎進行。',
    tenant_deletion_button: '刪除租戶',
  },
};

export default tenant_settings;
