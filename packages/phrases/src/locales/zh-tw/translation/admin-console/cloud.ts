const cloud = {
  welcome: {
    page_title: '歡迎',
    title: '歡迎來到 Logto Cloud（預覽版），讓我們一起創建獨屬於你的體驗',
    description:
      '無論你是開源用戶還是雲用戶，都可以在展示中了解 Logto 的全部價值。Cloud 預覽版也是 Logto Cloud 的初步版本。',
    project_field: '我使用 Logto 是為了',
    project_options: {
      personal: '個人專案',
      company: '公司專案',
    },
    deployment_type_field: '你偏愛開源還是雲？',
    deployment_type_options: {
      open_source: '開源',
      cloud: '雲',
    },
  },
  about: {
    page_title: '關於你',
    title: '關於你的一些信息',
    description: '通過更好地了解你，我們可以使你的 Logto 體驗更加個性化。你的信息是安全的。',
    title_field: '你的頭銜',
    title_options: {
      developer: '開發人員',
      team_lead: '團隊負責人',
      ceo: 'CEO',
      cto: 'CTO',
      product: '產品',
      others: '其他',
    },
    company_name_field: '公司名稱',
    company_name_placeholder: 'Acme.co',
    company_size_field: '你的公司規模如何？',
    company_options: {
      size_1: '1',
      size_2_49: '2-49',
      size_50_199: '50-199',
      size_200_999: '200-999',
      size_1000_plus: '1000+',
    },
    reason_field: '我註冊的原因是',
    reason_options: {
      passwordless: '尋找無需密碼身份驗證和 UI 工具包',
      efficiency: '尋找即插即用的身份基礎架構',
      access_control: '基於角色和責任控制用戶訪問',
      multi_tenancy: '尋求面向多租戶產品的策略',
      enterprise: '為產品更方便企業使用尋找 SSO 解決方案',
      others: '其他',
    },
  },
  congrats: {
    page_title: '獲得早鳥驚喜',
    title: '好消息！你有資格獲得 Logto Cloud 的早鳥驚喜。',
    description:
      '別錯過：立即聯繫 Logto 團隊，了解更多信息，獲得 Logto Cloud 正式版 <strong>60 天</strong> 的免費試用機會！',
    check_out_button: '查看實時預覽',
    reserve_title: '與 Logto 團隊預定時間',
    reserve_description: '驗證後僅有一次領取資格。',
    book_button: '現在預定',
    join_description: '加入我們的公開 <a>{{link}}</a>，與其他開發人員連接和聊天。',
    discord_link: 'Discord 頻道',
    enter_admin_console: '進入 Logto Cloud 預覽',
  },
  gift: {
    title: '免費使用 Logto Cloud 60 天，立即成為尝鮮會員！',
    description: '預定與我們團隊的一對一會話，以獲取早鳥驚喜。',
    reserve_title: '與 Logto 團隊預定時間',
    reserve_description: '評估後僅有一次領取資格。',
    book_button: '預定',
  },
  sie: {
    page_title: '定制登錄體驗',
    title: '讓我們輕鬆定制你的登錄體驗',
    inspire: {
      title: '創建引人入勝的示例',
      description: '對登錄體驗不確定嗎？只需點擊“啓發我”，讓魔法發生！',
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
  broadcast: '📣 你正在使用 Logto Cloud（預覽版）',
  socialCallback: {
    title: '你已成功登錄',
    description:
      '你已成功使用社交帳戶登錄。為確保與 Logto 的無縫集成並獲得所有功能的訪問權限，我們建議你繼續配置自己的社交連接器。',
  },
};

export default cloud;
