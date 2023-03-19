const connector_details = {
  back_to_connectors: '返回连接器',
  check_readme: '查看 README',
  settings: '通用设置',
  settings_description:
    '连接器在 Logto 中扮演着至关重要的角色。借助它们的帮助，Logto 使终端用户能够使用无密码注册或登录的功能以及使用社交帐户登录的功能。',
  parameter_configuration: '参数配置',
  test_connection: '连接测试',
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
    '你的登录体验正在使用这个连接器。删除后，<name/> 登录体验将在登录体验设置中被删除。',
  in_used_passwordless_deletion_description:
    '你的登录体验正在使用 {{name}} 连接器。删除后，你的登录体验将无法正常工作，直到你解决冲突。',
};

export default connector_details;
