const domain = {
  status: {
    connecting: '正在連接',
    in_used: '使用中',
    failed_to_connect: '連接失敗',
  },
  update_endpoint_alert: {
    description:
      '已成功配置自定義域名。如果您之前配置了以下資源，請務必將使用的域名更新為 {{domain}}。',
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
    custom_domain_placeholder: 'yourdomain.com',
    add_domain: '添加域名',
    invalid_domain_format: '無效的域名格式',
    steps: {
      add_records: {
        title: '將以下 DNS 記錄添加到您的 DNS 提供程序',
        generating_dns_records: '正在生成 DNS 記錄…',
        table: {
          type_field: '類型',
          name_field: '名稱',
          value_field: '值',
        },
        finish_and_continue: '完成並繼續',
      },
      verify_domain: {
        title: '自動驗證 DNS 記錄的連接',
        description: '該過程將自動進行，可能需要幾分鐘（長達 24 小時）。您可以在運行時退出此界面。',
        error_message: '驗證失敗。請檢查您的域名或 DNS 記錄。',
      },
      generate_ssl_cert: {
        title: '自動生成 SSL 證書',
        description: '該過程將自動進行，可能需要幾分鐘（長達 24 小時）。您可以在運行時退出此界面。',
        error_message: '生成 SSL 證書失敗。',
      },
      enable_domain: '自動啟用自定義域名',
    },
    deletion: {
      delete_domain: '刪除域名',
      reminder: '删除自定義域名',
      description: '您確定要刪除此自定義域名嗎？',
      in_used_description: '您確定要删除此自定義域名 "{{domain}}" 嗎？',
      in_used_tip:
        '如果您之前在您的社交連接器提供程序或應用程式端點中設置了此自定義域名，您需要先修改 URI 為 Logto 自定義域名 "{{domain}}"。這對於社交登錄按鈕的正常工作是必要的。',
      deleted: '成功删除自定義域名！',
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
