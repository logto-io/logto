import content from './content.js';
import custom_profile_fields from './custom-profile-fields.js';
import sign_up_and_sign_in from './sign-up-and-sign-in.js';

const sign_in_exp = {
  page_title: '登錄體驗',
  page_title_with_account: '登錄與帳戶',
  title: '登錄與帳戶',
  description: '自定義身份驗證流程和用戶界面，並實時預覽現成的體驗。',
  tabs: {
    branding: '品牌',
    sign_up_and_sign_in: '註冊與登錄',
    collect_user_profile: '收集用戶資料',
    account_center: '帳戶中心',
    content: '內容',
    password_policy: '密碼規則',
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
    with_dark: '{{value}} (dark)',
    app_logo_and_favicon: '應用圖標和 Favicon',
    company_logo_and_favicon: '公司圖標和 Favicon',
    organization_logo_and_favicon: '組織圖標和 Favicon',
    hide_logto_branding: '隱藏 Logto 品牌',
    hide_logto_branding_description:
      '移除「Powered by Logto」。以乾淨、專業的登入體驗讓你的品牌成為焦點。',
  },
  branding_uploads: {
    app_logo: {
      title: '應用圖標',
      url: '應用圖標 URL',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: '應用圖標: {{error}}',
    },
    company_logo: {
      title: '公司圖標',
      url: '公司圖標 URL',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: '公司圖標: {{error}}',
    },
    organization_logo: {
      title: '上傳圖片',
      url: '組織圖標 URL',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: '組織圖標: {{error}}',
    },
    connector_logo: {
      title: '上傳圖片',
      url: '連接器圖標 URL',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: '連接器圖標: {{error}}',
    },
    favicon: {
      title: 'Favicon',
      url: 'Favicon URL',
      url_placeholder: 'https://your.cdn.domain/favicon.ico',
      error: 'Favicon: {{error}}',
    },
  },
  custom_ui: {
    title: '自定義界面',
    css_code_editor_title: '自定義 CSS',
    css_code_editor_description1: '查看自定義 CSS 範例。',
    css_code_editor_description2: '<a>{{link}}</a>',
    css_code_editor_description_link_content: '了解更多',
    css_code_editor_content_placeholder:
      '輸入你的自定義 CSS，以完全符合你的規格定制樣式。展現你的創意，讓你的界面脫穎而出。',
    bring_your_ui_title: '帶上你的界面',
    bring_your_ui_description:
      '上傳壓縮包 (.zip) 來用你的代碼替換 Logto 的預構建界面。<a>了解更多</a>',
    preview_with_bring_your_ui_description:
      '你的自定義界面資源已成功上傳並正在服務。因此，內置預覽窗口已被禁用。\n若要測試你的個性化登錄界面，請點擊「實時預覽」按鈕在新瀏覽器標籤頁中打開。',
  },
  account_center: {
    title: '帳號中心',
    description: '使用 Logto API 自訂你的帳號中心流程。',
    enable_account_api: '啟用 Account API',
    enable_account_api_description:
      '啟用 Account API，打造自訂帳號中心，讓終端使用者無需使用 Logto 管理 API 也能直接存取 API。',
    field_options: {
      off: '關閉',
      edit: '可編輯',
      read_only: '唯讀',
      enabled: '已啟用',
      disabled: '已停用',
    },
    sections: {
      account_security: {
        title: '帳號安全',
        description:
          '管理 Account API 的存取權限，讓使用者在登入應用程式後可以檢視或編輯其身分資訊與驗證因素。進行這些與安全相關的變更前，使用者需先完成身分驗證並取得有效 10 分鐘的驗證紀錄 ID。',
        groups: {
          identifiers: {
            title: '身分識別',
          },
          authentication_factors: {
            title: '驗證因素',
          },
        },
      },
      user_profile: {
        title: '使用者檔案',
        description:
          '管理 Account API 的存取權限，讓使用者在登入後可以檢視或編輯基本或自訂的檔案資料。',
        groups: {
          profile_data: {
            title: '檔案資料',
          },
        },
      },
      secret_vault: {
        title: '密鑰保險庫',
        description:
          '適用於社群與企業連接器，安全儲存第三方存取權杖以呼叫其 API（例如新增事件至 Google 行事曆）。',
        third_party_token_storage: {
          title: '第三方權杖',
          third_party_access_token_retrieval: '第三方存取權杖擷取',
          third_party_token_tooltip: '若要儲存權杖，可在對應的社群或企業連接器設定中啟用此選項。',
          third_party_token_description: '啟用 Account API 後，第三方權杖擷取會自動啟動。',
        },
      },
    },
    fields: {
      email: '電子郵件地址',
      phone: '電話號碼',
      social: '社群身分',
      password: '密碼',
      mfa: '多重驗證',
      mfa_description: '讓使用者可以在帳號中心管理其多重驗證方式。',
      username: '使用者名稱',
      name: '姓名',
      avatar: '大頭貼',
      profile: '檔案',
      profile_description: '控制對結構化檔案屬性的存取。',
      custom_data: '自訂資料',
      custom_data_description: '控制對儲存在使用者上的自訂 JSON 資料的存取。',
    },
    webauthn_related_origins: 'WebAuthn 相關來源',
    webauthn_related_origins_description:
      '新增允許透過 Account API 註冊通行金鑰的前端應用程式網域。',
    webauthn_related_origins_error: '來源必須以 https:// 或 http:// 開頭',
    prebuilt_ui: {
      /** UNTRANSLATED */
      title: 'INTEGRATE PREBUILT UI',
      /** UNTRANSLATED */
      description:
        'Quickly integrate out-of-the-box verification and security setting flows with prebuilt UI.',
      /** UNTRANSLATED */
      flows_title: 'Integrate out-of-the-box security setting flows',
      /** UNTRANSLATED */
      flows_description:
        'Combine your domain with the route to form your account setting URL (e.g., https://auth.foo.com/account/email). Optionally add a `redirect=` URL parameter to return users to your app after successfully updating.',
      tooltips: {
        /** UNTRANSLATED */
        email: 'Update your primary email address',
        /** UNTRANSLATED */
        phone: 'Update your primary phone number',
        /** UNTRANSLATED */
        username: 'Update your username',
        /** UNTRANSLATED */
        password: 'Set a new password',
        /** UNTRANSLATED */
        authenticator_app: 'Set up a new authenticator app for multi-factor authentication',
        /** UNTRANSLATED */
        passkey_add: 'Register a new passkey',
        /** UNTRANSLATED */
        passkey_manage: 'Manage your existing passkeys or add new ones',
        /** UNTRANSLATED */
        backup_codes_generate: 'Generate a new set of 10 backup codes',
        /** UNTRANSLATED */
        backup_codes_manage: 'View your available backup codes or generate new ones',
      },
      /** UNTRANSLATED */
      customize_note: "Don't want the out-of-the-box experience? You can fully",
      /** UNTRANSLATED */
      customize_link: 'customize your flows with the Account API instead.',
    },
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
    no_connector_email_account_center:
      '尚未設置電子郵件連接器。請在<a>「郵件與短信連接器」</a>中設置。',
    no_connector_sms_account_center:
      '尚未設置 SMS 短信連接器。請在<a>「郵件與短信連接器」</a>中設置。',
    no_connector_social_account_center: '尚未設置社交連接器。請在<a>「社交連接器」</a>中設置。',
    no_mfa_factor: '尚未設置 MFA 因子。請在<a>{{link}}</a>中完成設定。',
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
    forgot_password_migration_notice:
      '我們已升級忘記密碼驗證以支援自訂方法。之前，這是由您的電子郵件和簡訊連接器自動確定的。點擊<strong>確認</strong>以完成升級。',
  },
  preview: {
    title: '登錄預覽',
    live_preview: '實時預覽',
    live_preview_tip: '保存以預覽更改',
    native: '移動原生',
    desktop_web: '桌面網頁',
    mobile_web: '移動網頁',
    desktop: '桌面網頁',
    mobile: '行動裝置',
  },
  custom_profile_fields,
};

export default Object.freeze(sign_in_exp);
