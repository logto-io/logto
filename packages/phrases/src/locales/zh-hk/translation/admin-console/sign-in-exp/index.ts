import content from './content.js';
import password_policy from './password-policy.js';
import sign_up_and_sign_in from './sign-up-and-sign-in.js';

const sign_in_exp = {
  page_title: '登錄體驗',
  title: '登錄體驗',
  description: '自定義登錄界面，並實時預覽真實效果',
  tabs: {
    branding: '品牌',
    sign_up_and_sign_in: '註冊與登錄',
    content: '內容',
    password_policy: '密碼政策',
  },
  welcome: {
    title: '自定義登錄體驗',
    description: '通過首次登錄設置快速入門。本指南將帶領您完成所有必要的設置。',
    get_started: '開始',
    apply_remind: '請注意，登錄體驗將會應用到當前帳戶下的所有應用。',
  },
  color: {
    title: '顏色',
    primary_color: '品牌顏色',
    dark_primary_color: '品牌顏色 (深色)',
    dark_mode: '開啟深色模式',
    dark_mode_description:
      '基於品牌顏色和 Logto 的算法，應用將會有一個自動生成的深色模式。當然，您可以自定義和修改。',
    dark_mode_reset_tip: '基於品牌顏色，重新生成深色模式顏色。',
    reset: '重新生成',
  },
  branding: {
    title: '品牌定制區',
    ui_style: '樣式',
    favicon: '瀏覽器地址欄圖標',
    logo_image_url: 'Logo 圖片 URL',
    logo_image_url_placeholder: 'https://your.cdn.domain/logo.png',
    dark_logo_image_url: 'Logo 圖片 URL (深色)',
    dark_logo_image_url_placeholder: 'https://your.cdn.domain/logo-dark.png',
    logo_image: 'Logo 圖片',
    dark_logo_image: 'Logo 圖片(深色)',
    logo_image_error: '應用 Logo：{{error}}',
    favicon_error: 'Favicon：{{error}}',
  },
  custom_css: {
    title: '自定義 CSS',
    css_code_editor_title: '自定義 CSS 個性化您的用戶界面',
    css_code_editor_description1: '查看自定義 CSS 的例子。',
    css_code_editor_description2: '<a>{{link}}</a>',
    css_code_editor_description_link_content: '了解更多',
    css_code_editor_content_placeholder:
      '輸入 CSS 代碼，修改顏色、字體、組件樣式、佈局，定制您的登錄、註冊、忘記密碼等頁面。充分發揮創造力，讓您的用戶界面脫穎而出。',
  },
  sign_up_and_sign_in,
  content,
  password_policy,
  setup_warning: {
    no_connector_sms:
      '尚未設置 SMS 短信連接器。在完成該配置前，用戶將無法通過此登錄方式登錄。<a>{{link}}</a>連接器。',
    no_connector_email:
      '尚未設置電子郵件連接器。在完成該配置前，用戶將無法通過此登錄方式登錄。<a>{{link}}</a>連接器。',
    no_connector_social:
      '您還沒有設置任何社交連接器。首先添加連接器以應用社交登錄方法。<a>{{link}}</a>連接器。',
    setup_link: '立即設置',
  },
  save_alert: {
    description:
      '您正在進行登錄註冊設置的變更。當前您的所有用戶會受到新設置的影響。確認保存該設置嗎？',
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
