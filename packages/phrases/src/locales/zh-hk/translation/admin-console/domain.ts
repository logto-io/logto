const domain = {
  status: {
    connecting: '正在連接',
    in_used: '使用中',
    failed_to_connect: '連接失敗',
  },
  update_endpoint_alert: {
    description:
      '已成功配置自定義域名。如果您之前配置了以下資源，請務必將使用的域名更新為 <span>{{domain}}</span>。',
    endpoint_url: '<a>{{link}}</a> 的終端節點 URL',
    application_settings_link_text: '應用程式設定',
    callback_url: '<a>{{link}}</a> 的回調 URL',
    social_connector_link_text: '社交連接器',
    api_identifier: '<a>{{link}}</a> 的 API 識別碼',
    uri_management_api_link_text: 'URI 管理 API',
    tip: '更改設定後，您可以在我們的登錄體驗中進行測試，請參閱<a>{{link}}</a>。',
  },
  custom: {
    custom_domain: '自定義域名',
    custom_domain_description:
      '使用自己的域名替換默認域名，以保持品牌的一致性和為您的用戶個性化的登錄體驗。',
    custom_domain_field: '自定義域名',
    custom_domain_placeholder: 'your.domain.com',
    add_domain: '添加域名',
    invalid_domain_format: '子域名格式無效，請輸入至少三個部分的子域名。',
    verify_domain: '驗證域名',
    enable_ssl: '啟用 SSL',
    checking_dns_tip:
      '配置 DNS 記錄後，將自動運行此程序，並可能需要長達 24 小時。您可以離開此界面而不影響執行。',
    generating_dns_records: '正在生成 DNS 記錄...',
    add_dns_records: '請將以下 DNS 記錄添加到 DNS 提供者。',
    dns_table: {
      type_field: '類型',
      name_field: '名稱',
      value_field: '值',
    },
    deletion: {
      delete_domain: '刪除域名',
      reminder: '刪除自定義域名',
      description: '您確定要刪除此自定義域名嗎？',
      in_used_description: '您確定要刪除此自定義域名"<span>{{domain}}</span>"嗎？',
      in_used_tip:
        '如果您先前在社交互聯提供商或應用程式終端點中設置了此自定義域名, 您需要先將 URI 修改為 Logto 默認域名"<span>{{domain}}</span>", 以便社交組件能正常工作。',
      deleted: '成功刪除自定義域名！',
    },
  },
  default: {
    default_domain: '默認域名',
    default_domain_description:
      '我們提供一個可直接線上使用的預設域名。它始終可用，確保您的應用程序始終可以訪問',
    default_domain_field: 'Logto 默認域名',
  },
};

export default domain;
