const connectors = {
  page_title: '連接器',
  title: '連接器',
  subtitle: '設置連接器，啟動無密碼和社交登錄',
  create: '添加社交連接器',
  config_sie_notice: '你已經配置了社交連接器，記得在<a>{{link}}</a>上添加使之生效。',
  config_sie_link_text: '登錄體驗',
  tab_email_sms: '短信和郵件連接器',
  tab_social: '社交連接器',
  connector_name: '連接器名稱',
  demo_tip: '演示連接器僅用於演示且最多只能發送 100 條消息，不建議在生產環境中部署。',
  social_demo_tip: '演示連接器僅用於演示目的，不建議在生產璃廠中部署。',
  connector_type: '類型',
  placeholder_title: '社交連接器',
  placeholder_description:
    'Logto 提供了許多廣泛使用的社交登錄連接器，同時你還可以使用標準協議創建自己的連接器。',
  save_and_done: '保存並完成',
  type: {
    email: '郵件連接器',
    sms: '短信連接器',
    social: '社交連接器',
  },
  setup_title: {
    email: '設置郵件連接器',
    sms: '設置短信連接器',
    social: '添加社交連接器',
  },
  guide: {
    subtitle: '參考以下步驟完成你的連接器設置',
    general_setting: '通用設置',
    parameter_configuration: '參數配置',
    test_connection: '連接測試',
    name: '社交登錄按鈕的名稱',
    name_placeholder: '輸入社交登錄按鈕的名稱',
    name_tip: '按鈕上將展示「通過 {{name}} 繼續」。名字不宜過長而導致信息無法展示完整。',
    connector_logo: '連接器標誌',
    connector_logo_tip: '標誌將顯示在連接器登錄按鈕上。',
    target: '身份提供商名稱',
    target_placeholder: '輸入身份提供商的名稱',
    target_tip: '在“身份供應商名稱”字段中輸入唯一的標識符字符串，用於區分社交身份來源。',
    target_tip_standard:
      '在“身份供應商名稱”字段中輸入唯一的標識符字符串，用於區分社交身份來源。注意，在連接器創建成功後，無法再次修改此設置。',
    target_tooltip:
      'Logto 社交連接器的「target」指的是社交身份的「來源」。在 Logto 的設計裡，我們不允許某一平臺的連接器中有相同的「target」以避免身份的衝突。在添加連接器時，你需要格外小心，我們「不允許」用戶在創建之後更改「target」的值。<a>了解更多</a>',
    target_conflict:
      '此「身份供應商名稱」值與現有的 <span>name</span> 連接器相同。使用相同的身份提供商名稱會導致不符合預期的登錄行為，用戶可能通過兩個不同的連接器訪問同一個帳戶。',
    target_conflict_line2:
      '如果你想替換當前的連接器，並連接相同的身份提供商（IdP），以便先前的用戶可以直接登錄而無需重新註冊，請先刪除 <span>name</span> 連接器，再創建一個新的連接器並使用相同的「身份供應商名稱」值。',
    target_conflict_line3: '如果你想連接一個新的身份驗證提供程序，請修改「身份供應商名稱」並繼續。',
    config: '粘貼你的 JSON 代碼',
    sync_profile: '開啟用戶資料同步',
    sync_profile_only_at_sign_up: '首次註冊時同步',
    sync_profile_each_sign_in: '每次登錄時同步',
    sync_profile_tip: '同步用戶的用戶名、頭像等個人資料信息',
    enable_token_storage: {
      title: '存儲令牌以持續訪問 API',
      description:
        '在 Secret Vault 中存儲訪問和刷新令牌。允許自動 API 調用而無需用戶重複授權。例如：讓你的 AI Agent 在持續授權下向 Google 日曆添加事件。<a>了解如何調用第三方 API</a>',
    },
    callback_uri: '重新導向 URI（回調 URI）',
    callback_uri_description:
      'Redirect URI 是在社交授權後用戶被重新導向的位置。請將此 URI 加入 IdP 的設定中。',
    callback_uri_custom_domain_description:
      '如果你在 Logto 使用多個<a>自訂網域</a>，請務必把所有對應的回調 URI 加入 IdP，確保社交登入在每個網域都能運作。\n\n預設的 Logto 網域 (*.logto.app) 一直有效；只有在你也想支援該網域下的登入時才需要包含它。',
    acs_url: 'Assertion consumer service URL',
  },
  platform: {
    universal: '通用',
    web: '網頁',
    native: '原生',
  },
  add_multi_platform: '支持多平臺，選擇一個平臺繼續',
  drawer_title: '連接器配置指南',
  drawer_subtitle: '參考以下步驟完善或修改你的連接器設置',
  unknown: '未知連接器',
  standard_connectors: '標準連接器',
  create_form: {
    third_party_connectors:
      '集成第三方提供商以快速社交登錄、社交帳戶鏈接和 API 訪問。<a>了解更多</a>',
    standard_connectors: '或者，你可以通過標準協議自定義你的社交連接器。',
  },
};

export default Object.freeze(connectors);
