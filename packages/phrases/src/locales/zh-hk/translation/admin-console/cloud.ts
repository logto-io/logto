const cloud = {
  general: {
    onboarding: '入門',
  },
  welcome: {
    page_title: '歡迎',
    title: '歡迎來到 Logto Cloud！我們很想了解你的一些信息。',
    description: '通過更好地了解你，我們可以使你的 Logto 體驗更加個性化。你的信息是安全的。',
    project_field: '我使用 Logto 是為了',
    project_options: {
      personal: '個人專案',
      company: '公司專案',
    },
    company_name_field: '公司名稱',
    company_name_placeholder: 'Acme.co',
    /** UNTRANSLATED */
    stage_field: 'What stage is your product currently in?',
    stage_options: {
      /** UNTRANSLATED */
      new_product: 'Start a new project and looking for a quick, out-of-the-box solution',
      /** UNTRANSLATED */
      existing_product:
        'Migrate from current authentication (e.g., self-built, Auth0, Cognito, Microsoft)',
      /** UNTRANSLATED */
      target_enterprise_ready:
        'I just landed bigger clients and now make my product ready to sell to enterprises',
    },
    /** UNTRANSLATED */
    additional_features_field: 'Do you have anything else you want us to know?',
    additional_features_options: {
      /** UNTRANSLATED */
      customize_ui_and_flow:
        'Need the ability to bring my own UI, or customize my own flows via Logto API',
      /** UNTRANSLATED */
      compliance: 'SOC2 and GDPR are must-haves',
      /** UNTRANSLATED */
      export_user_data: 'Need the ability to export user data from Logto',
      /** UNTRANSLATED */
      budget_control: 'I have very tight budget control',
      /** UNTRANSLATED */
      bring_own_auth: 'Have my own auth services and just need some Logto features',
      /** UNTRANSLATED */
      others: 'None of these above',
    },
  },
  sie: {
    page_title: '定制登錄體驗',
    title: '讓我們輕鬆定制你的登錄體驗',
    inspire: {
      title: '創建引人入勝的示例',
      description: '對登錄體驗不確定嗎？只需點擊“啟發我”，讓魔法發生！',
      inspire_me: '來點靈感',
    },
    logo_field: '應用商標',
    color_field: '品牌顏色',
    identifier_field: '標識符',
    identifier_options: {
      email: '電子郵件',
      phone: '電話',
      user_name: '用戶名',
    },
    authn_field: '身份驗證',
    authn_options: {
      password: '密碼',
      verification_code: '驗證碼',
    },
    social_field: '社交登錄',
    finish_and_done: '完成並完成',
    preview: {
      mobile_tab: '移動端',
      web_tab: '網頁端',
    },
    connectors: {
      unlocked_later: '稍後解鎖',
      unlocked_later_tip: '完成入門流程並進入產品後，你將獲得訪問更多社交登錄方式的權限。',
      notice:
        '請勿將演示連接器用於生產目的。完成測試後，請刪除演示連接器並使用你的憑證設置自己的連接器。',
    },
  },
  socialCallback: {
    title: '你已成功登錄',
    description:
      '你已成功使用社交帳戶登錄。為確保與 Logto 的無縫集成並獲得所有功能的訪問權限，我們建議你繼續配置自己的社交連接器。',
  },
  tenant: {
    create_tenant: '創建租戶',
  },
};

export default Object.freeze(cloud);
