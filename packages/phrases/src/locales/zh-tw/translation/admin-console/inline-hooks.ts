const inline_hooks = {
  page_title: '內聯掛鉤',
  title: '內聯掛鉤',
  subtitle: '在驗證流程的特定節點執行自訂程式碼，以擴充 Logto 的行為。',
  status: {
    not_configured: '未設定',
    configured: '已設定',
    enabled: '已啟用',
    disabled: '已停用',
  },
  hooks: {
    post_first_factor_verification: {
      name: '第一個驗證因素驗證後',
      description: '在第一個驗證因素通過驗證後、登入繼續前執行自訂邏輯。',
    },
    post_sign_in: {
      name: '登入後',
      description: '在使用者成功登入後執行自訂邏輯。',
    },
  },
};

export default Object.freeze(inline_hooks);
