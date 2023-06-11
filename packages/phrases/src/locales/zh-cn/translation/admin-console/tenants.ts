const tenants = {
  create_modal: {
    title: '创建租户',
    subtitle: '创建新的租户以分隔资源和用户。',
    create_button: '创建租户',
    tenant_name: '租户名称',
    tenant_name_placeholder: '我的租户',
    environment_tag: '环境标签',
    environment_tag_description: '使用标签区分租户使用环境。每个标签内的服务相同，确保一致性。',
    environment_tag_development: '开发环境',
    environment_tag_staging: '暂存环境',
    environment_tag_production: '生产环境',
  },
  delete_modal: {
    title: '删除租户',
    description_line1:
      '您确定要删除 "<span>{{name}}</span>" 的环境标识符为"<span>{{tag}}</span>"的租户吗？ 此操作无法撤消，并将导致永久删除所有数据和帐户信息。',
    description_line2:
      '在删除帐户之前，也许我们可以帮助您。 <span><a>通过电子邮件联系我们</a></span>',
    description_line3: '如果你想继续，请输入租户名 "<span>{{name}}</span>" 确认。',
    delete_button: '永久删除',
  },
  tenant_created: "租户'{{name}}'创建成功。",
};

export default tenants;
