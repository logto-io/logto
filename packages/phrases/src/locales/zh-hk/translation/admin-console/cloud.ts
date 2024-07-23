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
    stage_field: '你的產品目前處於哪個階段？',
    stage_options: {
      new_product: '啟動新項目並尋找快速、開箱即用的解決方案',
      existing_product: '從當前身份驗證 (例如自建、Auth0、Cognito、Microsoft) 遷移',
      target_enterprise_ready: '我剛剛贏得了更大的客戶，現在要讓我的產品準備面向企業銷售',
    },
    additional_features_field: '你還有其他事情要告訴我們嗎？',
    additional_features_options: {
      customize_ui_and_flow: '構建並管理自己的 UI，而不僅僅使用 Logto 預先構建和可定製的解決方案',
      compliance: 'SOC2 和 GDPR 是必不可少的',
      export_user_data: '需要從 Logto 導出用戶數據的能力',
      budget_control: '我有非常嚴格的預算控制',
      bring_own_auth: '有自己的身份驗證服務，只需要一些 Logto 功能',
      others: '以上都不是',
    },
  },
  create_tenant: {
    page_title: '創建租戶',
    title: '創建你的第一個租戶',
    description: '租戶是一個獨立的環境，在這裡你可以管理用戶身份、應用程式和所有其他 Logto 資源。',
    invite_collaborators: '通過電子郵件邀請你的合作者',
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
