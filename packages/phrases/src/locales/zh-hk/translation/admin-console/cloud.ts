const cloud = {
  console_sso: {
    back_to_list: '返回控制台 SSO',
    create: '新增連接器',
    title: '控制台 SSO',
    description: '設定你自己的身份提供者，透過單一登入存取 Logto Console。',
    domain_bound: '已綁定',
    domain_pending: '驗證中',
    domain_add_placeholder: '新增電郵網域',
    domain_membership_notice:
      '已驗證的網域用於 Logto Cloud Console SSO 搜尋，不會授予租戶成員資格。',
    domain_bound_description: '此網域已用於 Console SSO。TXT 驗證記錄已移除。',
    domain_dns_instructions: '請在 DNS 供應商新增此 TXT 記錄，以驗證網域擁有權。',
    domain_waiting_for_dns: '正在等待 TXT 記錄。我們每 10 秒檢查一次。',
    domain_proven_unbound: '網域擁有權已驗證，但綁定尚未完成。解決問題後請重試。',
    domain_remove_description:
      '要從 Console SSO 移除 {{domain}} 嗎？移除已綁定的網域後，其電郵地址將無法透過 SSO 搜尋連接器。',
    domain_invalid: '請輸入有效的電郵網域。',
    domain_conflict: '此網域已綁定至另一個 Console SSO 連接器。',
    domain_invalid_provider: '請先完成連線設定，再綁定此網域。',
    domain_dns_timeout: 'DNS 檢查失敗。我們會自動重試。',
    domain_recovery: '網域變更尚未完成。請重試驗證以完成操作。',
    start_over: '重新開始',
    start_over_confirmation: '重新開始可能會刪除尚未完成的 SSO 設定。是否繼續？',
    resume_creation: '發現未完成的建立操作。請使用相同的身分提供者繼續，以復原此連接器。',
  },
  general: {
    onboarding: '入門',
  },
  create_tenant: {
    page_title: '創建租戶',
    title: '創建你的第一個租戶',
    description: '租戶是一個獨立的環境，在這裡你可以管理用戶身份、應用程式和所有其他 Logto 資源。',
    invite_collaborators: '通過電子郵件邀請你的合作者',
    hear_about_us: {
      title: '你最初是從哪裡認識 Logto 的?',
      detail_placeholder: '告訴我們更多(可選)',
      options: {
        search_engine: '搜尋引擎(Google、Bing 等)',
        ai_assistant: 'AI 助手(ChatGPT、Claude、Gemini 等)',
        github_oss: 'GitHub 或開源目錄',
        friend_colleague: '朋友或同事推薦',
        powered_by: '某個使用 Logto 的應用程式的登入頁',
        content_social: '社交媒體、文章或影片(YouTube、X、Reddit 等)',
        other: '其他',
      },
    },
  },
  social_callback: {
    title: '你已成功登錄',
    description:
      '你已成功使用社交帳戶登錄。為確保與 Logto 的無縫集成並獲得所有功能的訪問權限，我們建議你繼續配置自己的社交連接器。',
    notice:
      '請避免將示範連接器用於生產目的。當你完成測試後，請刪除示範連接器並使用你的憑證設置自己的連接器。',
  },
  tenant: {
    create_tenant: '創建租戶',
  },
};

export default Object.freeze(cloud);
