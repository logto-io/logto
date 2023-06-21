const tenant_settings = {
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
};

export default tenant_settings;
