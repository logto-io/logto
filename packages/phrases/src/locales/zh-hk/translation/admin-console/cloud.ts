const cloud = {
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
