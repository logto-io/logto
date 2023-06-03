const domain = {
  status: {
    connecting: '连接中',
    in_used: '使用中',
    failed_to_connect: '连接失败',
  },
  update_endpoint_alert: {
    description:
      '已成功配置自定义域名。如果您之前已经配置过以下资源，请不要忘记更新您使用的域名 <span>{{domain}}</span>。',
    endpoint_url: '<a>{{link}}</a> 的终结点 URL',
    application_settings_link_text: '应用设置',
    callback_url: '<a>{{link}}</a> 的回调 URL',
    social_connector_link_text: '社交连接器',
    api_identifier: '<a>{{link}}</a> 的 API 标识符',
    uri_management_api_link_text: 'URI 管理 API',
    tip: '更改设置后，您可以在我们的登录体验 <a>{{link}}</a> 中进行测试。',
  },
  custom: {
    custom_domain: '自定义域名',
    custom_domain_description:
      '使用自己的域名替换默认域名，以保持品牌的一致性并为用户个性化登录体验。',
    custom_domain_field: '自定义域名',
    custom_domain_placeholder: 'your.domain.com',
    add_domain: '添加域名',
    invalid_domain_format: '无效的子域名格式，请输入至少三个部分的子域名。',
    verify_domain: '验证域名',
    enable_ssl: '启用 SSL',
    checking_dns_tip:
      '配置 DNS 记录后，该进程将自动运行，可能需要长达 24 小时。在运行时，您可以离开此界面。',
    generating_dns_records: '正在生成 DNS 记录…',
    add_dns_records: '请将这些 DNS 记录添加到您的 DNS 供应商。',
    dns_table: {
      type_field: '类型',
      name_field: '名称',
      value_field: '值',
    },
    deletion: {
      delete_domain: '删除域名',
      reminder: '删除自定义域名',
      description: '您确定要删除此自定义域名吗？',
      in_used_description: '您确定要删除此自定义域名 "<span>{{domain}}</span>" 吗？',
      in_used_tip:
        '如果您之前已在社交连接器提供商或应用程序终结点中设置了此自定义域名，则需要先将 URI 修改为 Logto 默认域名“<span>{{domain}}</span>”。 这对于社交登录按钮的正常工作是必要的。',
      deleted: '自定义域名删除成功！',
    },
  },
  default: {
    default_domain: '默认域名',
    default_domain_description:
      '我们提供了一个可直接在线使用的默认域名。它始终可用，确保您的应用程序始终可以访问以进行登录，即使您切换到自定义域名。',
    default_domain_field: 'Logto 默认域名',
  },
};

export default domain;
