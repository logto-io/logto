const protected_app = {
  name: '受保護應用程式',
  title: '建立一個受保護的應用程式: 透過簡潔和極速添加身分驗證',
  description:
    '受保護的應用程式安全地維護使用者會話並代理您的應用程式請求。由 Cloudflare Workers 提供支援，享受全球頂尖性能和 0 毫秒的全球啟動速度。 <a>了解更多</a>',
  fast_create: '快速建立',
  modal_title: '建立受保護的應用程式',
  modal_subtitle: '透過點擊啟用安全和快速保護。輕鬆為您現有的網絡應用程式添加身分驗證功能。',
  form: {
    url_field_label: '您的原始網址',
    url_field_placeholder: 'https://domain.com/',
    url_field_description: '提供需要身分驗證保護的應用程式地址。',
    url_field_modification_notice: '對原始網址的修訂可能需要 1-2 分鐘才能在全球網絡位置上生效。',
    url_field_tooltip:
      "提供您應用程式的地址，不包括任何 '/pathname'。創建後，您可以自定義路由身分驗證規則。\n\n注意: 原始網址本身並不需要身分驗證; 受保護僅適用於通過指定應用程式域訪問的情況。",
    domain_field_label: '應用程式域名',
    domain_field_placeholder: 'your-domain',
    domain_field_description: '此 URL 將作為原始 URL 的身分驗證保護代理。創建後可以應用自訂域名。',
    domain_field_description_short: '此 URL 將作為原始 URL 的身分驗證保護代理。',
    domain_field_tooltip:
      "受 Logto 保護的應用程式將默認托管在 'your-domain.{{domain}}' 上。創建後可以應用自訂域名。",
    create_application: '創建應用程式',
    create_protected_app: '快速建立',
    errors: {
      domain_required: '您的域名是必填的。',
      domain_in_use: '這個子域名已經被使用。',
      invalid_domain_format: "無效的子域名格式: 只能使用小寫字母、數字和連字符 '-'。",
      url_required: '原始 URL 是必填的。',
      invalid_url:
        "無效的原始 URL 格式: 僅支援 http:// 或 https://。注意: 目前不支援 '/pathname'。",
      localhost: '請先將本地伺服器暴露到互聯網。了解更多關於 <a>本地開發</a>。',
    },
  },
  success_message: '🎉 應用程式身分驗證成功啟用！探索您的網站的全新體驗。',
};

export default Object.freeze(protected_app);
