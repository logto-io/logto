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
    hide_logto_branding_oss_note: '此功能原生支援於 <a>Logto Cloud</a>。',
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
    cloud_tag: 'Cloud',
    css_code_editor_title: '自定義 CSS',
    css_code_editor_description1: '查看自定義 CSS 範例。',
    css_code_editor_description2: '<a>{{link}}</a>',
    css_code_editor_description_link_content: '了解更多',
    css_code_editor_content_placeholder:
      '輸入你的自定義 CSS，以完全符合你的規格定制樣式。展現你的創意，讓你的界面脫穎而出。',
    bring_your_ui_title: '帶上你的界面',
    bring_your_ui_description:
      '上傳壓縮包 (.zip) 來用你的代碼替換 Logto 的預構建界面。<a>了解更多</a>',
    bring_your_ui_oss_description: '用你的程式碼自訂登入介面。',
    bring_your_ui_oss_card_description:
      '將你的自訂登入介面直接上傳到 <a>Logto Cloud</a>。無需 fork 和重新部署。',
    bring_your_ui_oss_try_cloud: '試用 Cloud',
    preview_with_bring_your_ui_description:
      '你的自定義界面資源已成功上傳並正在服務。因此，內置預覽窗口已被禁用。\n若要測試你的個性化登錄界面，請點擊「實時預覽」按鈕在新瀏覽器標籤頁中打開。',
    csp_description: '為你的自訂登入介面允許額外的來源表達式。這些值只會在提供自訂 UI 資源時套用。',
    csp_script_src: 'script-src 來源',
    csp_script_src_tip:
      '允許你的自訂 UI 載入腳本時使用的 HTTPS 來源表達式，例如 https://scripts.example.com 或 https://*.example.com。',
    csp_connect_src: 'connect-src 來源',
    csp_connect_src_tip:
      '允許你的自訂 UI 發出網路請求時使用的 HTTPS 或 WSS 來源表達式，例如 https://api.example.com 或 wss://events.example.com。',
    csp_source_invalid_error:
      '請輸入有效的來源表達式。請使用 https:// URL；connect-src 也支援 wss://。不支援 CSP 關鍵字和分號。',
    csp_source_duplicate_error: '此來源表達式已在清單中。',
  },
  account_center: {
    title: '帳號中心',
    description: '使用 Logto API 自訂你的帳號中心流程。',
    enable_account_api: '啟用帳號中心和 Account API',
    enable_account_api_description:
      '同時啟用面向使用者的 Account API 和 Logto 的開箱即用帳號中心。關閉後，這兩項功能都將不可用。',
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
          '管理 Account API 的存取權限，讓使用者在登入應用程式後可以檢視或編輯其身分資訊與驗證因素。',
        security_verification: {
          title: '安全驗證',
          description:
            '在變更安全設定之前，使用者必須驗證身分以取得有效期 10 分鐘的驗證紀錄 ID。要啟用驗證方式（電子郵件、手機、密碼），請將下方的 Account API 權限設定為<strong>唯讀</strong>（最低要求）或<strong>可編輯</strong>，以便系統偵測使用者是否已設定。<a>了解更多</a>',
        },
        groups: {
          identifiers: {
            title: '身分識別',
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
      sessions: '會話',
    },
    profile_fields: {
      title: '預建帳戶中心的檔案欄位',
      add_profile_fields: '新增檔案欄位',
      hint: {
        not_in_list: '沒有你想要的？',
        set_up: '立即設定',
        go_to: '其他檔案欄位。',
      },
      disabled_hint: {
        name: '若要新增此欄位，請先在上方檔案資料中將「姓名」權限設為「可編輯/唯讀」。',
        avatar: '若要新增此欄位，請先在上方檔案資料中將「大頭貼」權限設為「可編輯/唯讀」。',
        profile: '若要新增此欄位，請先在上方檔案資料中將「檔案」權限設為「可編輯/唯讀」。',
        custom_data: '若要新增此欄位，請先在上方檔案資料中將「自訂資料」權限設為「可編輯/唯讀」。',
      },
    },
    webauthn_related_origins: 'WebAuthn 相關來源',
    webauthn_related_origins_description:
      '新增允許透過 Account API 註冊通行金鑰的前端應用程式網域。',
    webauthn_related_origins_error: '來源必須以 https:// 或 http:// 開頭',
    delete_account_url: '刪除帳號',
    delete_account_url_description: '提供你自己的端點 URL，以使用自訂邏輯處理帳號刪除。',
    prebuilt_ui: {
      title: '集成預構建界面',
      description: '快速整合帳戶中心、安全驗證或單一資料更新流程等現成的流程。',
      permission_notice:
        '要整合這些預建流程，請在下方設定中將相關的帳戶 API 權限設為<strong>編輯</strong>。',
      account_center_title: '整合現成的帳戶中心',
      account_center_description:
        '將用戶路由到帳戶中心，以管理電子郵件、電話號碼、使用者名稱、密碼、MFA 和關聯帳號等安全設定。',
      flows_title: '整合預構建安全設置流程',
      single_task_flows_title: '整合現成的單一資料更新流程',
      flows_description:
        '結合你的域名與路徑形成你的帳戶設置 URL（例如：https://auth.foo.com/account/email）。你可以選擇添加 `redirect=` 在成功更新後將用戶返回到你的應用，添加 `show_success=true` 以保持成功頁面可見，添加 `ui_locales=` 以覆蓋預設語言，或添加 `identifier=` 以預填識別碼輸入欄位。',
      single_task_flows_description:
        '結合你的域名與路徑形成你的個人資料更新 URL（例如：https://auth.foo.com/account/profile）。你可以選擇添加 `redirect=` 在成功更新後將用戶返回到你的應用，或添加 `ui_locales=` 以覆蓋預設語言。',
      tooltips: {
        email: '更新你的主要電子郵件地址',
        phone: '更新你的主要電話號碼',
        username: '更新你的使用者名稱',
        password: '設置新密碼',
        social: '連結社交帳號以供登入',
        social_remove: '移除已連結的社交帳號',
        authenticator_app: '為多重驗證設置新的身份驗證器應用',
        authenticator_app_replace: '用新的身份驗證器應用替換你現有的身份驗證器應用',
        passkey_add: '註冊新的通行金鑰',
        passkey_manage: '管理你現有的通行金鑰或添加新的',
        backup_codes_generate: '生成一組新的 10 個備用代碼',
        backup_codes_manage: '查看你的可用備用代碼或生成新的',
        account_center:
          '訪問帳戶中心以管理電子郵件、電話號碼、使用者名稱、密碼、MFA 和關聯帳號等安全設定',
        profile: '管理個人資訊（如姓名、頭像）的中心樞紐',
      },
      customize_note: '不想要使用預構建體驗？你可以完全',
      customize_link: '使用帳戶 API 來自定義你的流程。',
    },
    custom_css: {
      title: '自定義 CSS',
      description: '使用自定義 CSS 自定義帳戶中心的外觀。',
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
