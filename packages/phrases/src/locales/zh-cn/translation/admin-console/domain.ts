const domain = {
  status: {
    connecting: '连接中...',
    in_use: '使用中',
    failed_to_connect: '连接失败',
  },
  update_endpoint_notice:
    '如果你想使用自定义域名，请不要忘记在应用程序中更新社交连接器回调 URI 和 Logto 终结点的域名。 <a>{{link}}</a>',
  error_hint: '请确保更新你的 DNS 记录。我们将继续每 {{value}} 秒检查一次。',
  custom: {
    custom_domain: '自定义域名',
    custom_domain_description: '通过使用自定义域名来提高品牌形象。此域名将用于你的登录体验。',
    custom_domain_field: '自定义域名',
    custom_domain_placeholder: 'your.domain.com',
    add_domain: '添加域名',
    invalid_domain_format: '请提供一个有效的域名 URL，至少有三个部分，例如 "your.domain.com."',
    verify_domain: '验证域名',
    enable_ssl: '启用 SSL',
    checking_dns_tip:
      'DNS 记录已配置，请等待最长 24 小时，以使变更生效。在域名是否有效期间，你可以离开此界面。',
    enable_ssl_tip: '启用 SSL 将自动运行，可能需要最长 24 小时。在运行期间，你可以离开此界面。',
    generating_dns_records: '正在生成 DNS 记录...',
    add_dns_records: '请将以下 DNS 记录添加到你的 DNS 服务提供商。',
    dns_table: {
      type_field: '类型',
      name_field: '名称',
      value_field: '值',
    },
    deletion: {
      delete_domain: '删除域名',
      reminder: '删除自定义域名',
      description: '你确定要删除此自定义域名吗？',
      in_used_description: '你确定要删除此自定义域名 "<span>{{domain}}</span>" 吗？',
      in_used_tip:
        '如果你之前已在社交连接器提供商或应用程序终结点中设置了此自定义域名，则需要先将 URI 修改为 Logto 默认域名 "<span>{{domain}}</span>"。这对于社交登录按钮的正常工作是必要的。',
      deleted: '自定义域名删除成功！',
    },
  },
  default: {
    default_domain: '默认域名',
    default_domain_description:
      'Logto 提供了一个预配置的默认域名，无需任何其他设置即可使用。即使你启用了自定义域名，此默认域名也可作为备用选项。',
    default_domain_field: 'Logto 默认域名',
  },
  custom_endpoint_note: '你可以根据需要自定义这些端点的域名。选择 "{{custom}}" 或 "{{default}}"。',
  custom_social_callback_url_note:
    '你可以根据需要自定义此 URI 的域名，以匹配你的应用程序端点。选择 "{{custom}}" 或 "{{default}}"。',
  custom_acs_url_note:
    '您可以根据需要自定义此 URI 的域名，以匹配您的身份提供方断言使用者服务 URL。选择 "{{custom}}" 或 "{{default}}"。',
};

export default Object.freeze(domain);
