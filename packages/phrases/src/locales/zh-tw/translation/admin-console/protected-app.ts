const protected_app = {
  name: '受保護應用程式',
  title: '建立受保護應用程式：使用簡單和極速添加身份驗證',
  description:
    '受保護應用程式安全地維護使用者會話並代理您的應用程式請求。由 Cloudflare Workers 提供支持，享受全球頂尖性能和 0ms 全球即開啟速度。<a>了解更多</a>',
  fast_create: '快速創建',
  modal_title: '建立受保護應用程式',
  modal_subtitle: '點擊啟用安全且高速的保護。輕鬆地為現有的 Web 應用程式添加身份驗證。',
  form: {
    url_field_label: '您的原始 URL',
    url_field_placeholder: 'https://domain.com/',
    url_field_description: '提供需要身份驗證保護的應用程式地址。',
    url_field_modification_notice: '對原始 URL 的修改可能需要 1-2 分鐘在全球網絡位置生效。',
    url_field_tooltip:
      "提供應用程式的地址，不包括任何 '/pathname'。創建後，您可以自定義路由身份驗證規則。\n\n注意：原始 URL 本身不需要身份驗證；保護僅應用於通過指定應用程式域訪問的操作。",
    domain_field_label: '應用程式域',
    domain_field_placeholder: 'your-domain',
    domain_field_description: '此 URL 用作原始 URL 的身份驗證保護代理。創建後可以應用自定義域。',
    domain_field_description_short: '此 URL 用作原始 URL 的身份驗證保護代理。',
    domain_field_tooltip:
      "由 Logto 保護的應用程式將默認托管在 'your-domain.{{domain}}'。創建後可以應用自定義域。",
    create_application: '創建應用程式',
    create_protected_app: '快速創建',
    errors: {
      domain_required: '需要您的域。',
      domain_in_use: '此子域名已在使用中。',
      invalid_domain_format: "無效的子域名格式：僅使用小寫字母、數字和破折號 '-'。",
      url_required: '需要原始 URL。',
      invalid_url: "無效的原始 URL 格式：使用 http:// 或 https://。注意：目前不支持 '/pathname'。",
      localhost: '請先將您的本地服務器暴露到互聯網上。了解有關<a>本地開發</a>的更多信息。',
    },
  },
  success_message: '🎉 應用程式身份驗證已成功啟用！探索您的網站的新體驗。',
};

export default Object.freeze(protected_app);
