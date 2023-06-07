const domain = {
  status: {
    connecting: '连接中',
    in_used: '使用中',
    failed_to_connect: '连接失败',
  },
  update_endpoint_notice: {
    content:
      '您的自定义域名已成功设置。请记得更新 <social-link>{{socialLink}}</social-link> 和 <app-link>{{appLink}}</app-link> 中的域名，如果您之前已经配置了资源。',
    connector_callback_uri_text: '社交连接器回调 URI',
    application_text: '您的应用程序终结点的 Logto',
  },
  error_hint: '请确保更新您的 DNS 记录。我们将继续每 {{value}} 秒检查一次。',
  custom: {
    custom_domain: '自定义域名',
    custom_domain_description:
      '使用您自己的域名替换默认域名，以保持一致的品牌形象，并为用户提供个性化的登录体验。',
    custom_domain_field: '自定义域名',
    custom_domain_placeholder: '您的域名.com',
    add_domain: '添加域名',
    invalid_domain_format: '无效的子域名格式，请至少输入三个部分的子域名。',
    verify_domain: '验证域名',
    enable_ssl: '启用 SSL',
    checking_dns_tip:
      'DNS 记录已配置，请等待最长 24 小时，以使变更生效。在域名是否有效期间，您可以离开此界面。',
    generating_dns_records: '正在生成 DNS 记录…',
    add_dns_records: '请将以下 DNS 记录添加到您的 DNS 服务提供商。',
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
        '如果您之前已在社交连接器提供商或应用程序终结点中设置了此自定义域名，则需要先将 URI 修改为 Logto 默认域名 "<span>{{domain}}</span>"。 这对于社交登录按钮的正常工作是必要的。',
      deleted: '自定义域名删除成功！',
    },
  },
  default: {
    default_domain: '默认域名',
    default_domain_description:
      '我们提供了一个默认域名，可以直接在线使用。它始终可用，确保您的应用程序始终可以被访问，即使您使用自定义域名。',
    default_domain_field: 'Logto 默认域名',
  },
};

export default domain;
