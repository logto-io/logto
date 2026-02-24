import content from './content.js';
import custom_profile_fields from './custom-profile-fields.js';
import sign_up_and_sign_in from './sign-up-and-sign-in.js';

const sign_in_exp = {
  page_title: '登錄體驗',
  page_title_with_account: '登錄與帳戶',
  title: '登錄與帳戶',
  description: '自定義身份驗證流程和 UI，並實時預覽開箱即用的體驗。',
  tabs: {
    branding: '品牌',
    sign_up_and_sign_in: '註冊與登錄',
    collect_user_profile: '收集用戶資料',
    account_center: '帳戶中心',
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
    organization_logo_and_favicon: '組織標誌和圖標',
    hide_logto_branding: '隱藏 Logto 品牌',
    hide_logto_branding_description:
      '移除「Powered by Logto」。以乾淨、專業的登入體驗突顯你的品牌。',
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
  account_center: {
    title: '帳戶中心',
    description: '使用 Logto API 自訂你的帳戶中心流程。',
    enable_account_api: '啟用 Account API',
    enable_account_api_description:
      '啟用 Account API，建立自訂帳戶中心，讓終端使用者毋須使用 Logto 管理 API 亦可直接存取 API。',
    field_options: {
      off: '關閉',
      edit: '可編輯',
      read_only: '唯讀',
      enabled: '已啟用',
      disabled: '已停用',
    },
    sections: {
      account_security: {
        title: '帳戶安全',
        description:
          '管理對 Account API 的存取權限，讓使用者在登入應用程式後，可以檢視或編輯身份資訊與驗證因素。',
        security_verification: {
          title: '安全驗證',
          description:
            '在變更安全設定之前，使用者必須驗證身份以取得有效期 10 分鐘的驗證紀錄 ID。要啟用驗證方式（電郵、手機、密碼），請將下方的 Account API 權限設定為<strong>唯讀</strong>（最低要求）或<strong>可編輯</strong>，以便系統偵測使用者是否已配置。<a>了解更多</a>',
        },
        groups: {
          identifiers: {
            title: '身份識別',
          },
          authentication_factors: {
            title: '驗證因素',
          },
          session_management: {
            title: '會話管理',
          },
        },
      },
      user_profile: {
        title: '使用者檔案',
        description:
          '管理對 Account API 的存取，讓使用者在登入後可以檢視或編輯基礎或自訂的檔案資料。',
        groups: {
          profile_data: {
            title: '檔案資料',
          },
        },
      },
      secret_vault: {
        title: '密鑰保險庫',
        description:
          '適用於社交及企業連接器，安全儲存第三方存取權杖以呼叫其 API（例如新增事件至 Google 日曆）。',
        third_party_token_storage: {
          title: '第三方權杖',
          third_party_access_token_retrieval: '第三方存取權杖擷取',
          third_party_token_tooltip: '如需儲存權杖，可在相應的社交或企業連接器設定中啟用此選項。',
          third_party_token_description: '啟用 Account API 後，第三方權杖擷取會自動啟用。',
        },
      },
    },
    fields: {
      email: '電郵地址',
      phone: '電話號碼',
      social: '社交身份',
      password: '密碼',
      mfa: '多重驗證',
      mfa_description: '允許使用者於帳戶中心管理其多重驗證方式。',
      username: '使用者名稱',
      name: '姓名',
      avatar: '頭像',
      profile: '檔案',
      profile_description: '控制對結構化檔案屬性的存取權。',
      custom_data: '自訂資料',
      custom_data_description: '控制對儲存在使用者上的自訂 JSON 資料的存取權。',
      sessions: '會話',
    },
    webauthn_related_origins: 'WebAuthn 關聯來源',
    webauthn_related_origins_description:
      '新增允許透過 Account API 註冊通行密鑰的前端應用程式網域。',
    webauthn_related_origins_error: '來源必須以 https:// 或 http:// 開頭',
    prebuilt_ui: {
      title: '整合預建 UI',
      description: '快速整合開箱即用的驗證和安全設置流程。',
      permission_notice:
        '要整合這些預建流程，請在下方設定中將相關的帳戶 API 權限設為<strong>編輯</strong>。',
      flows_title: '整合開箱即用的安全設置流程',
      flows_description:
        '結合你的域名與路徑形成你的帳戶設置 URL（例如，https://auth.foo.com/account/email）。可以選擇性地添加一個 `redirect=` URL 參數來在成功更新後返回用戶至你的應用程式。',
      tooltips: {
        email: '更新你的主電郵地址',
        phone: '更新你的主電話號碼',
        username: '更新你的使用者名稱',
        password: '設置新密碼',
        authenticator_app: '設置多因素驗證的新的身份驗證應用',
        passkey_add: '註冊新的通行密鑰',
        passkey_manage: '管理你現有的通行密鑰或添加新的',
        backup_codes_generate: '生成一組新的 10 個備份代碼',
        backup_codes_manage: '查看可用的備份代碼或生成新的',
      },
      customize_note: '不想要開箱即用的體驗？你可以完全',
      customize_link: '使用 Account API 自定義你的流程。',
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
      '我們已升級忘記密碼驗證以支援自訂方法。之前，這是由你的電子郵件和短信連接器自動確定的。點擊<strong>確認</strong>以完成升級。',
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
  custom_profile_fields,
};

export default Object.freeze(sign_in_exp);
