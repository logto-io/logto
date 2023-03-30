const connector_details = {
  page_title: '連接器詳情',
  back_to_connectors: '返回連接器',
  check_readme: '檢視 README',
  settings: '通用設定',
  settings_description:
    '連接器在 Logto 中扮演著至關重要的角色。借助它們的幫助，Logto 使終端用戶能夠使用無密碼註冊或登錄的功能以及使用社交帳戶登錄的功能。',
  parameter_configuration: '參數配置',
  test_connection: '連接測試',
  save_error_empty_config: '請輸入配置內容',
  send: '傳送',
  send_error_invalid_format: '無效輸入',
  edit_config_label: '請在此輸入您的 JSON 配置',
  test_email_sender: '測試您的郵件連接器',
  test_sms_sender: '測試您的短信連接器',
  test_email_placeholder: 'john.doe@example.com',
  test_sms_placeholder: '+86 131 1234 5678',
  test_message_sent: '測試訊息已傳送',
  test_sender_description:
    'Logto 使用 "Generic" 模板進行測試。如果您的連接器正確配置，您將收到一條訊息。',
  options_change_email: '更換郵件連接器',
  options_change_sms: '更換短信連接器',
  connector_deleted: '成功刪除連接器',
  type_email: '郵件連接器',
  type_sms: '短信連接器',
  type_social: '社交連接器',
  in_used_social_deletion_description:
    '您的登錄體驗正在使用這個連接器。刪除後，<name/> 登錄體驗將在登錄體驗設定中被刪除，再次添加需重新配置。',
  in_used_passwordless_deletion_description:
    '您的登錄體驗正在使用 {{name}} 連接器。刪除後，您的登錄體驗將無法正常工作，直到您解決衝突，再次添加需重新配置。',
  deletion_description: '您將刪除此連接器。此操作不可撤銷，再次添加需重新配置。',
};

export default connector_details;
