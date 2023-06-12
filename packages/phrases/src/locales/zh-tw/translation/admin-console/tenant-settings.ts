const tenant_settings = {
  title: '設置',
  description: '在此處更改帳戶設置和管理個人信息，以確保您的帳戶安全。',
  tabs: {
    settings: '設置',
    domains: '網域',
  },
  profile: {
    title: '配置設置',
    tenant_id: '租戶 ID',
    tenant_name: '租戶名稱',
    environment_tag: '環境標籤',
    environment_tag_description:
      '帶有不同標籤的服務完全相同。它充當後綴的作用,以幫助您的團隊區分不同的環境。',
    environment_tag_development: 'Dev',
    environment_tag_staging: 'Staging',
    environment_tag_production: 'Prod',
    tenant_info_saved: '租戶資訊成功儲存。',
  },
  deletion_card: {
    title: '刪除',
    tenant_deletion: '刪除租戶',
    tenant_deletion_description:
      '刪除您的帳戶將刪除所有個人資訊、使用者資料和配置。這個動作是無法撤銷的。',
    tenant_deletion_button: '刪除租戶',
  },
};

export default tenant_settings;
