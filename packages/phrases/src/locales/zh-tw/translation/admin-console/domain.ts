const domain = {
  status: {
    connecting: '連線中',
    in_used: '使用中',
    failed_to_connect: '連線失敗',
  },
  update_endpoint_notice:
    '您的自訂網域已成功設置。如果您之前已配置了Social connector回撥URI和Logto端點的資源，請記得更新它們使用的網域。<a>{{link}}</a>',
  error_hint: '請確保您更新了您的 DNS 記錄。 我們將繼續每{{value}}秒檢查一次。',
  custom: {
    custom_domain: '自定義網域',
    custom_domain_description:
      '將預設的網域名稱替換為您自己的網域名稱，以保持品牌一致性並為用戶提供個性化的登錄體驗。',
    custom_domain_field: '自訂網域',
    custom_domain_placeholder: 'your.domain.com',
    add_domain: '新增網域',
    invalid_domain_format: '子網域格式無效，請輸入至少三個部分的子網域。',
    verify_domain: '驗證網域',
    enable_ssl: '啟用 SSL',
    checking_dns_tip:
      '當您配置 DNS 記錄後，這個過程將自動運行，它可能需要長達 24 小時。 您可以在運行期間離開這個介面。',
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
      '我們提供了一個可即時使用的默認網域名稱。 它始終可用，可確保您的應用程序總是可用於登錄，即使您切換到自訂網域。',
    default_domain_field: 'Logto 默認網域',
  },
};

export default domain;
