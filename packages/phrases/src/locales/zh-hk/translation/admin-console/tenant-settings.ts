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
      '使用标签区分租户使用环境。在每个标签中的服务是相同的，以确保一致性。',
    environment_tag_development: '开发',
    environment_tag_staging: '暂存',
    environment_tag_production: '生产',
  },
  deletion_card: {
    title: '刪除',
    tenant_deletion: '刪除租戶',
    tenant_deletion_description: '刪除您的帳戶將刪除所有個人信息、用戶數據和配置。此操作無法撤銷。',
    tenant_deletion_button: '刪除租戶',
  },
};

export default tenant_settings;
