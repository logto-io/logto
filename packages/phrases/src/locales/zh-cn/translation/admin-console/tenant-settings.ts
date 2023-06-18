const tenant_settings = {
  title: '设置',
  description: '在这里更改您的帐户设置和管理个人信息，以确保帐户安全。',
  tabs: {
    settings: '设置',
    domains: '域名管理',
  },
  profile: {
    title: '配置文件设置',
    tenant_id: '租户 ID',
    tenant_name: '租户名称',
    environment_tag: '环境标签',
    environment_tag_description:
      '携带不同标签的服务完全相同。它充当后缀的作用,以帮助您的团队区分不同的环境。',
    environment_tag_development: 'Dev',
    environment_tag_staging: 'Staging',
    environment_tag_production: 'Prod',
    tenant_info_saved: '租户信息成功保存。',
  },
  deletion_card: {
    title: '删除',
    tenant_deletion: '删除租户',
    tenant_deletion_description: '删除帐户将删除所有个人信息，用户数据和配置。此操作无法撤消。',
    tenant_deletion_button: '删除租户',
  },
};

export default tenant_settings;
