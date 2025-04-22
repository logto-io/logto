import content from './content.js';
import sign_up_and_sign_in from './sign-up-and-sign-in.js';

const sign_in_exp = {
  page_title: '登錄體驗',
  title: '登錄體驗',
  description: '自定義身份驗證流程和 UI，並實時預覽開箱即用的體驗。',
  tabs: {
    branding: '品牌',
    sign_up_and_sign_in: '註冊與登錄',
    content: '內容',
    password_policy: '密碼政策',
  },
  welcome: {
    title: '自定義登錄體驗',
    description: '通過首次登錄設置快速入門。本指南將帶領你完成所有必要的設置。',
    get_started: '開始',
    apply_remind: '請注意，登錄體驗將會應用到當前帳戶下的所有應用。',
  },
  color: {
    title: '顏色',
    primary_color: '品牌顏色',
    dark_primary_color: '品牌顏色 (深色)',
    dark_mode: '開啟深色模式',
    dark_mode_description:
      '基於品牌顏色和 Logto 的算法，應用將會有一個自動生成的深色模式。當然，你可以自定義和修改。',
    dark_mode_reset_tip: '基於品牌顏色，重新生成深色模式顏色。',
    reset: '重新生成',
  },
  branding: {
    title: '品牌定制區',
    ui_style: '樣式',
    with_light: '{{value}}',
    with_dark: '{{value}} (深色)',
    app_logo_and_favicon: '應用程式標誌和圖標',
    company_logo_and_favicon: '公司標誌和圖標',
  },
  branding_uploads: {
    app_logo: {
      title: '應用程式標誌',
      url: '應用程式標誌 URL',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: '應用程式標誌：{{error}}',
    },
    company_logo: {
      title: '公司標誌',
      url: '公司標誌 URL',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: '公司標誌：{{error}}',
    },
    organization_logo: {
      title: '上傳圖片',
      url: '組織標誌 URL',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: '組織標誌：{{error}}',
    },
    connector_logo: {
      title: '上傳圖片',
      url: '連接器標誌 URL',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: '連接器標誌：{{error}}',
    },
    favicon: {
      title: '圖標',
      url: '圖標 URL',
      url_placeholder: 'https://your.cdn.domain/favicon.ico',
      error: '圖標：{{error}}',
    },
  },
  custom_ui: {
    title: '自定義 UI',
    css_code_editor_title: '自定義 CSS',
    css_code_editor_description1: '查看自定義 CSS 示例。',
    css_code_editor_description2: '<a>{{link}}</a>',
    css_code_editor_description_link_content: '了解更多',
    css_code_editor_content_placeholder:
      '輸入你的自定義 CSS 來精確調整任何東西的樣式。發揮你的創意，讓你的 UI 脫穎而出。',
    bring_your_ui_title: '帶上你的 UI',
    bring_your_ui_description:
      '上傳壓縮包 (.zip) 以用自己的代碼替換 Logto 預建的 UI。<a>了解更多</a>',
    preview_with_bring_your_ui_description:
      '你的自定義 UI 資源已成功上傳，現在正在提供服務。因此，內建預覽窗口已被禁用。\n要測試你的個性化登錄 UI，請點擊“實時預覽”按鈕在新瀏覽器標籤頁中打開。',
  },
  sign_up_and_sign_in,
  content,
  setup_warning: {
    no_connector_sms:
      '尚未設置 SMS 短信連接器。在完成該配置前，用戶將無法通過此登錄方式登錄。<a>{{link}}</a>連接器。',
    no_connector_email:
      '尚未設置電子郵件連接器。在完成該配置前，用戶將無法通過此登錄方式登錄。<a>{{link}}</a>連接器。',
    no_connector_social:
      '你還沒有設置任何社交連接器。首先添加連接器以應用社交登錄方法。<a>{{link}}</a>連接器。',
    setup_link: '立即設置',
  },
  save_alert: {
    description:
      '你正在進行登錄註冊設置的變更。當前你的所有用戶會受到新設置的影響。確認保存該設置嗎？',
    before: '設置前',
    after: '設置後',
    sign_up: '註冊',
    sign_in: '登錄',
    social: '社交',
  },
  preview: {
    title: '登錄預覽',
    live_preview: '實時預覽',
    live_preview_tip: '保存以預覽更改',
    native: '移動原生',
    desktop_web: '桌面網頁',
    mobile_web: '移動網頁',
    desktop: '桌面網頁',
    mobile: '移動設備',
  },
};

export default Object.freeze(sign_in_exp);
