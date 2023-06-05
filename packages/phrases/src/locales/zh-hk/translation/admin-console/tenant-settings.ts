const tenant_settings = {
  title: '租户设置',
  description: '在此更改账户设置并管理个人信息，以确保账户的安全性。',
  tabs: {
    settings: '设置',
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
};

export default tenant_settings;
