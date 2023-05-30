const domain = {
  status: {
    connecting: '連線中',
    in_used: '使用中',
    failed_to_connect: '連線失敗',
  },
  update_endpoint_alert: {
    description:
      '您的自定義網域已成功配置。 如果您之前配置過以下資源，請務必更新您用於 {{domain}} 的網域。',
    endpoint_url: '<a>{{link}}</a> 的端點 URL',
    application_settings_link_text: '應用程式設定',
    callback_url: '<a>{{link}}</a> 的回撥 URL',
    social_connector_link_text: '社交連結器',
    api_identifier: '<a>{{link}}</a> 的 API 識別碼',
    uri_management_api_link_text: 'URI 管理 API',
    tip: '更改設定後，您可以在我們的登錄體驗 <a>{{link}}</a> 中進行測試。',
  },
  custom: {
    custom_domain: '自定義網域',
    custom_domain_description:
      '將默認網域替換為您自己的網域，以保持品牌一致性並為用戶個性化登錄體驗。',
    custom_domain_field: '自定義網域',
    custom_domain_placeholder: 'yourdomain.com',
    add_domain: '新增網域',
    invalid_domain_format: '無效的網域格式',
    steps: {
      add_records: {
        title: '將以下 DNS 記錄添加到您的 DNS 提供商',
        generating_dns_records: '生成 DNS 記錄中...',
        table: {
          type_field: '類型',
          name_field: '名稱',
          value_field: '值',
        },
        finish_and_continue: '完成並繼續',
      },
      verify_domain: {
        title: '自動驗證 DNS 記錄的連線性',
        description:
          '該過程將在自動進行，可能需要幾分鐘 (最多 24 小時)。 它正在運行時，您可以退出此介面。',
        error_message: '驗證失敗。 請檢查您的域名或 DNS 記錄。',
      },
      generate_ssl_cert: {
        title: '自動生成 SSL 證書',
        description:
          '該過程將在自動進行，可能需要幾分鐘 (最多 24 小時)。 它正在運行時，您可以退出此介面。',
        error_message: '生成 SSL 證書失敗。',
      },
      enable_domain: '自動啟用自訂網域',
    },
    deletion: {
      delete_domain: '刪除網域',
      reminder: '刪除自定義網域',
      description: '您確定要刪除此自定義網域嗎？',
      in_used_description: '您確定要刪除此自定義網域 "{{domain}}" 嗎？',
      in_used_tip:
        '如果您之前在社交連結器供應商或應用端點中設置了此自定義網域，您需要首先將 URI 修改為 Logto 自定義網域 "{{domain}}"。 這對於社交登錄按鈕正常工作是必要的。',
      deleted: '成功刪除自定義網域！',
    },
  },
  default: {
    default_domain: '默認網域',
    default_domain_description:
      '我們提供了一個可直接在線使用的默認網域名稱。 它一直可用，可確保您的應用程式始終可用於登錄，即使您切換到自定義網域。',
    default_domain_field: 'Logto 默認網域',
  },
};

export default domain;
