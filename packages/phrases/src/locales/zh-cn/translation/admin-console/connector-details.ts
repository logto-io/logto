const connector_details = {
  page_title: '连接器详情',
  back_to_connectors: '返回连接器',
  check_readme: '查看 README',
  settings: '通用设置',
  settings_description:
    '连接器在 Logto 中扮演着至关重要的角色。借助它们的帮助，Logto 使终端用户能够使用无密码注册或登录的功能以及使用社交帐户登录的功能。',
  parameter_configuration: '参数配置',
  test_connection: '测试',
  save_error_empty_config: '请输入配置内容',
  send: '发送',
  send_error_invalid_format: '无效输入',
  edit_config_label: '请在此输入你的 JSON 配置',
  test_email_sender: '测试你的邮件连接器',
  test_sms_sender: '测试你的短信连接器',
  test_email_placeholder: 'john.doe@example.com',
  test_sms_placeholder: '+86 131 1234 5678',
  test_message_sent: '测试信息已发送',
  test_sender_description:
    'Logto 使用 "Generic" 模板进行测试。如果你的连接器正确配置，你将收到一条消息。',
  options_change_email: '更换邮件连接器',
  options_change_sms: '更换短信连接器',
  connector_deleted: '成功删除连接器',
  type_email: '邮件连接器',
  type_sms: '短信连接器',
  type_social: '社交连接器',
  in_used_social_deletion_description:
    '你的登录体验正在使用这个连接器。删除后，<name/> 登录体验将在登录体验设置中被删除，再次添加需重新配置。',
  in_used_passwordless_deletion_description:
    '你的登录体验正在使用 {{name}} 连接器。删除后，你的登录体验将无法正常工作，直到你解决冲突，再次添加需重新配置。',
  deletion_description: '你将删除此连接器。此操作不可撤销，再次添加需重新配置。',
  logto_email: {
    total_email_sent: '已发送邮件总数: {{value, number}}',
    total_email_sent_tip:
      'Logto 使用 SendGrid 进行安全稳定的内置电子邮件功能。此功能完全免费使用。<a>了解更多</a>',
    email_template_title: '电子邮件模板',
    template_description:
      '内置电子邮件使用默认模板，无需配置即可无缝发送验证电子邮件。您可以自定义基本品牌信息。',
    template_description_link_text: '查看模板',
    description_action_text: '查看模板',
    from_email_field: '发件人电子邮件',
    sender_name_field: '发件人姓名',
    sender_name_tip: '自定义电子邮件的发件人姓名。如果留空，则默认使用「Verification」作为名称。',
    sender_name_placeholder: '发件人姓名',
    company_information_field: '公司信息',
    company_information_description: '在电子邮件底部显示您公司的名称、地址或邮编，以增强真实性。',
    company_information_placeholder: '你公司的基本信息',
    email_logo_field: '电子邮件标志',
    email_logo_tip: '在电子邮件顶部显示你的品牌标志。对浅色模式和深色模式使用相同的图像。',
    urls_not_allowed: '不允许使用 URL',
    test_notes: 'Logto 使用 "通用" 模板进行测试。',
  },
  google_one_tap: {
    title: 'Google 一键登录',
    description: 'Google 一键登录是一种安全且方便的方式，用户可以用它登录你的网站。',
    enable_google_one_tap: '启用 Google 一键登录',
    enable_google_one_tap_description:
      '在你的登录体验中启用 Google 一键登录：如果用户已经在设备上登录，可以让他们快速注册或登录。',
    configure_google_one_tap: '配置 Google 一键登录',
    auto_select: '如果可能，自动选择凭据',
    close_on_tap_outside: '如果用户点击/点击外部则取消提示',
    itp_support: '启用 <a>在 ITP 浏览器上升级的一键登录 UX</a>',
  },
};

export default Object.freeze(connector_details);
