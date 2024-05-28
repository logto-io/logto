const domain = {
  status: {
    connecting: '連線中...',
    in_use: '使用中',
    failed_to_connect: '連線失敗',
  },
  update_endpoint_notice:
    '不要忘記在應用程序中更新社交連接器回調 URI 和 Logto 端點的域，如果您想使用自定義域來使用這些功能。<a>{{link}}</a>',
  error_hint: '請確保您更新了您的 DNS 記錄。 我們將繼續每{{value}}秒檢查一次。',
  custom: {
    custom_domain: '自訂網域',
    custom_domain_description: '提高品牌形象，使用自訂網域。此網域將用於您的登錄體驗。',
    custom_domain_field: '自訂網域',
    custom_domain_placeholder: 'your.domain.com',
    add_domain: '新增網域',
    invalid_domain_format: '請提供一個有效的域名網址，至少包含三個部分，例如 "your.domain.com."',
    verify_domain: '驗證網域',
    enable_ssl: '啟用 SSL',
    checking_dns_tip:
      '當您配置 DNS 記錄後，這個過程將自動運行，它可能需要長達 24 小時。 您可以在運行期間離開這個介面。',
    enable_ssl_tip: '啟用 SSL 將自動運行，可能需要長達 24 小時。您可以在運行期間離開此介面。',
    generating_dns_records: '正在生成 DNS 記錄...',
    add_dns_records: '請將這些 DNS 記錄添加到您的 DNS 供應商。',
    dns_table: {
      type_field: '類型',
      name_field: '名稱',
      value_field: '值',
    },
    deletion: {
      delete_domain: '刪除網域',
      reminder: '刪除自定義網域',
      description: '您確定要刪除此自定義網域嗎？',
      in_used_description: '您確定要刪除此自定義網域 "<span>{{domain}}</span>" 嗎？',
      in_used_tip:
        '如果您以前在社交聯繫運營商或應用端點中設置了此自定義網域，則需要先將 URI 更改為 Logto 默認網域"<span>{{domain}}</span>"。 這是社交登錄按鈕正常工作所必需的。',
      deleted: '成功刪除自定義網域！',
    },
  },
  default: {
    default_domain: '預設網域',
    default_domain_description:
      'Logto 提供預先配置的預設網域，無需進行任何其他設置即可使用。即使啟用了自訂網域，此預設網域也可作為備用選項。',
    default_domain_field: 'Logto 默認網域',
  },
  custom_endpoint_note: '您可以根據需要自定義這些端點的域名。選擇“{{custom}}”或“{{default}}”。',
  custom_social_callback_url_note:
    '您可以自定義此 URI 的域名以匹配您的應用程序端點。選擇“{{custom}}”或“{{default}}”。',
  custom_acs_url_note:
    '您可以自訂此 URI 的域名以匹配您的身份提供者斷言使用者服務 URL。選擇“{{custom}}”或“{{default}}”。',
};

export default Object.freeze(domain);
