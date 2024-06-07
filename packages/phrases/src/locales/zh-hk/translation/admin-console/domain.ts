const domain = {
  status: {
    connecting: '正在連接...',
    in_use: '使用中',
    failed_to_connect: '連接失敗',
  },
  update_endpoint_notice:
    '不要忘記在應用程序中更新社交連接器回調URI和Logto端點的域名，如果你想使用自定義域名進行功能。 <a>{{link}}</a>',
  error_hint: '確保更新您的 DNS 記錄。我們將繼續每 {{value}} 秒檢查。',
  custom: {
    custom_domain: '自定義域名',
    custom_domain_description: '提高品牌形象，使用自定義域名。此域名將用於您的登錄體驗。',
    custom_domain_field: '自定義域名',
    custom_domain_placeholder: 'your.domain.com',
    add_domain: '添加域名',
    invalid_domain_format: '請提供有效的域名 URL，至少有三部分，例如 "your.domain.com."',
    verify_domain: '驗證域名',
    enable_ssl: '啟用 SSL',
    checking_dns_tip:
      '配置 DNS 記錄後，此程序將自動運行，可能需要長達 24 個小時。不影響執行，可離開此界面。',
    enable_ssl_tip: '啟用 SSL 將自動運行，可能需要長達 24 個小時。您可以在運行期間離開此界面。',
    generating_dns_records: '正在生成 DNS 記錄...',
    add_dns_records: '請將以下 DNS 記錄添加到 DNS 提供者。',
    dns_table: {
      type_field: '類型',
      name_field: '名稱',
      value_field: '內容',
    },
    deletion: {
      delete_domain: '刪除域名',
      reminder: '刪除自定義域名',
      description: '確定刪除此自定義域名嗎？',
      in_used_description: '確定刪除此自定義域名"<span>{{domain}}</span>"嗎？',
      in_used_tip:
        '如果在之前的社交記錄或應用程式終端點中配置了此自定義域名，您需要先使用 Logto 默認域名"<span>{{domain}}</span>" 修改 URI，使社交組件可以正常使用。',
      deleted: '成功刪除自定義域名！',
    },
  },
  default: {
    default_domain: '默認域名',
    default_domain_description:
      'Logto 提供預配置的默認域名，無需進行任何其他設置即可使用。即使啟用了自定義域名，此默認域名也可作為備用選項。',
    default_domain_field: 'Logto 默認域名',
  },
  custom_endpoint_note: '您可以根據需要自定義這些端點的域名。選擇“{{custom}}”或“{{default}}”。',
  custom_social_callback_url_note:
    '您可以自定義此 URI 的域名以匹配您的應用程序端點。選擇“{{custom}}”或“{{default}}”。',
  custom_acs_url_note:
    '您可以自定義這個 URI 的域名以匹配您的身份提供者斷言使用者服務 URL。選擇“{{custom}}”或“{{default}}”。',
};

export default Object.freeze(domain);
