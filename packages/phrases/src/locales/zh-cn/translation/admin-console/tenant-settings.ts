const tenant_settings = {
  title: '设置',
  description: '高效管理租户设置并自定义您的域名。',
  tabs: {
    settings: '设置',
    domains: '域名管理',
  },
  settings: {
    title: '设置',
    tenant_id: '租户 ID',
    tenant_name: '租户名称',
    environment_tag: '环境标签',
    environment_tag_description: '标签不会改变服务。它们只是指导您区分不同的环境。',
    environment_tag_development: 'Dev',
    environment_tag_staging: 'Staging',
    environment_tag_production: 'Prod',
    tenant_info_saved: '租户信息成功保存。',
  },
  deletion_card: {
    title: '删除',
    tenant_deletion: '删除租户',
    tenant_deletion_description: '删除租户将导致永久删除所有相关的用户数据和配置。请谨慎操作。',
    tenant_deletion_button: '删除租户',
  },
};

export default tenant_settings;
