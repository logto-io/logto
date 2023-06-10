const domain = {
  status: {
    connecting: '正在連接',
    in_used: '使用中',
    failed_to_connect: '連接失敗',
  },
  update_endpoint_notice:
    '您的自定義域名已成功設置。如果您之前配置過社交連接組件回調URI和Logto終端點中使用的域名，請務必更新這些用於應用程式的域名記錄。 <a>{{link}}</a>',
  error_hint: '確保更新您的 DNS 記錄。我們將繼續每 {{value}} 秒檢查。',
  custom: {
    custom_domain: '自定義域名',
    custom_domain_description:
      'Improve your branding by utilizing a custom domain. This domain will be used in your sign-in experience.', // UNTRANSLATED
    custom_domain_field: '自定義域名',
    custom_domain_placeholder: 'your.domain.com',
    add_domain: '添加域名',
    invalid_domain_format: '子域名格式無效，請輸入至少三個子域名部分。',
    verify_domain: '驗證域名',
    enable_ssl: '啟用 SSL',
    checking_dns_tip:
      '配置 DNS 記錄後，此程序將自動運行，可能需要長達 24 個小時。不影響執行，可離開此界面。',
    generating_dns_records: '正在生成 DNS 記錄...',
    add_dns_records: '請把以下 DNS 記錄添加到 DNS 提供者。',
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
        '如果在之前的社交記錄或應用程式終端點中配置此自定義域名,您需要先使用Logto默認域名"<span>{{domain}}</span>"修改URI，使社交組件可以正常使用。',
      deleted: '成功刪除自定義域名！',
    },
  },
  default: {
    default_domain: '默認域名',
    default_domain_description:
      '我們提供一個可直接線上使用的預設域名。它始終可用，確保您的應用程式始終可以訪問',
    default_domain_field: 'Logto 默認域名',
  },
};

export default domain;
