const tenant_settings = {
  title: '设置',
  description: '在此更改账户设置并管理个人信息，以确保账户的安全性。',
  tabs: {
    settings: '设置',
    domains: '網域',
  },
  profile: {
    title: '配置设置',
    tenant_id: '租户ID',
    tenant_name: '租户名称',
    environment_tag: '环境标识',
    environment_tag_description:
      '攜帶不同標籤的服務完全相同。它充當後綴的作用,以幫助您的團隊區分不同的環境。',
    environment_tag_development: 'Dev',
    environment_tag_staging: 'Staging',
    environment_tag_production: 'Prod',
    tenant_info_saved: '租戶信息成功保存。',
  },
  deletion_card: {
    title: '刪除',
    tenant_deletion: '刪除租戶',
    tenant_deletion_description: '刪除您的帳戶將刪除所有個人信息、用戶數據和配置。此操作無法撤銷。',
    tenant_deletion_button: '刪除租戶',
  },
};

export default tenant_settings;
