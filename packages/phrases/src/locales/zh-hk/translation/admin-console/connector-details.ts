const connector_details = {
  page_title: '連接器詳情',
  back_to_connectors: '返回連接器',
  check_readme: '查看 README',
  settings: '通用設置',
  settings_description:
    '連接器在 Logto 中扮演著至關重要的角色。借助它們的幫助，Logto 使終端用戶能夠使用無密碼註冊或登錄的功能以及使用社交帳戶登錄的功能。',
  parameter_configuration: '參數配置',
  test_connection: '測試',
  save_error_empty_config: '請輸入配置內容',
  send: '發送',
  send_error_invalid_format: '無效輸入',
  edit_config_label: '請在此輸入你的 JSON 配置',
  test_email_sender: '測試你的郵件連接器',
  test_sms_sender: '測試你的短信連接器',
  test_email_placeholder: 'john.doe@example.com',
  test_sms_placeholder: '+86 131 1234 5678',
  test_message_sent: '測試信息已發送',
  test_sender_description:
    'Logto 使用 "Generic" 模板進行測試。如果你的連接器正確配置，你將收到一條消息。',
  options_change_email: '更換郵件連接器',
  options_change_sms: '更換短信連接器',
  connector_deleted: '成功刪除連接器',
  type_email: '郵件連接器',
  type_sms: '短信連接器',
  type_social: '社交連接器',
  in_used_social_deletion_description:
    '你的登錄體驗正在使用這個連接器。刪除後，<name/> 登錄體驗將在登錄體驗設置中被刪除，再次添加需重新配置。',
  in_used_passwordless_deletion_description:
    '你的登錄體驗正在使用 {{name}} 連接器。刪除後，你的登錄體驗將無法正常工作，直到你解決衝突，再次添加需重新配置。',
  deletion_description: '你將刪除此連接器。此操作不可撤銷，再次添加需重新配置。',
  logto_email: {
    total_email_sent: '總發送郵件數：{{value, number}}',
    total_email_sent_tip:
      'Logto 使用 SendGrid 進行安全穩定的內建電子郵件。完全免費使用。<a>了解更多</a>',
    email_template_title: '郵件模板',
    template_description:
      '內建郵件使用默認模板實現無縫交付驗證郵件。無需配置，您可以自定義基本品牌信息。',
    template_description_link_text: '查看模板',
    description_action_text: '查看模板',
    from_email_field: '發件人郵箱',
    sender_name_field: '發件人姓名',
    sender_name_tip: '自定義郵件發件人姓名。如果未填寫，將使用「Verification」作為默認姓名。',
    sender_name_placeholder: '您的發送人姓名',
    company_information_field: '公司信息',
    company_information_description: '在郵件底部顯示您的公司名稱、地址或郵政編碼，以增強真實性。',
    company_information_placeholder: '您公司的基本信息',
    app_logo_field: '應用程序標誌',
    app_logo_tip: '在郵件頂部顯示您的品牌標誌。在淺色模式和深色模式下使用相同的圖像。',
    urls_not_allowed: '不允許使用 URL',
    test_notes: 'Logto 使用 "通用" 模板進行測試。',
  },
};

export default Object.freeze(connector_details);
