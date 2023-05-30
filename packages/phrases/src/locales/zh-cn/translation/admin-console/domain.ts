const domain = {
  status: {
    connecting: '连接中',
    in_used: '使用中',
    failed_to_connect: '连接失败',
  },
  update_endpoint_alert: {
    description:
      '已成功配置自定义域名。如果您之前已经配置过以下资源，请不要忘记更新您使用的域名 {{domain}}。',
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
    custom_domain_placeholder: 'yourdomain.com',
    add_domain: '添加域名',
    invalid_domain_format: '域名格式不正确',
    steps: {
      add_records: {
        title: '在 DNS 服务商添加以下 DNS 记录',
        generating_dns_records: '正在生成 DNS 记录……',
        table: {
          type_field: '类型',
          name_field: '名称',
          value_field: '值',
        },
        finish_and_continue: '完成并继续',
      },
      verify_domain: {
        title: '自动验证 DNS 记录的连接状态',
        description:
          '该过程将在后台自动进行，可能需要几分钟（长达 24 小时）。您可以在运行时退出此界面。',
        error_message: '验证失败。请检查您的域名或 DNS 记录。',
      },
      generate_ssl_cert: {
        title: '自动生成 SSL 证书',
        description:
          '该过程将在后台自动进行，可能需要几分钟（长达 24 小时）。您可以在运行时退出此界面。',
        error_message: '生成 SSL 证书失败。',
      },
      enable_domain: '自动启用域名',
    },
    deletion: {
      delete_domain: '删除域名',
      reminder: '删除自定义域名',
      description: '您确定要删除此自定义域名吗？',
      in_used_description: '您确定要删除此自定义域名 "{{domain}}" 吗？',
      in_used_tip:
        '如果您之前已经将此自定义域名设置在社交连接器提供商或应用程序终端点中，则需要先修改 URI 以便正确工作。必须将其更改为 Logto 自定义域名 "{{domain}}"。',
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
