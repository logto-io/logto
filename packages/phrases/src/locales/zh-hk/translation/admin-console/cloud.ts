const cloud = {
  general: {
    onboarding: '入門',
  },
  create_tenant: {
    page_title: '創建租戶',
    title: '創建你的第一個租戶',
    description: '租戶是一個獨立的環境，在這裡你可以管理用戶身份、應用程式和所有其他 Logto 資源。',
    invite_collaborators: '通過電子郵件邀請你的合作者',
  },
  social_callback: {
    title: '你已成功登錄',
    description:
      '你已成功使用社交帳戶登錄。為確保與 Logto 的無縫集成並獲得所有功能的訪問權限，我們建議你繼續配置自己的社交連接器。',
    /** UNTRANSLATED */
    notice:
      "Please avoid using the demo connector for production purposes. Once you've completed testing, kindly delete the demo connector and set up your own connector with your credentials.",
  },
  tenant: {
    create_tenant: '創建租戶',
  },
};

export default Object.freeze(cloud);
