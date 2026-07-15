const inline_hooks = {
  page_title: '內聯鉤子',
  title: '內聯鉤子',
  subtitle: '在身份驗證流程的特定節點運行自定義代碼，以擴展 Logto 的行為。',
  status: {
    not_configured: '未配置',
    configured: '已配置',
    enabled: '已啟用',
    disabled: '已停用',
  },
  hooks: {
    post_first_factor_verification: {
      name: '首個身份驗證因素驗證後',
      description: '在首個身份驗證因素通過驗證後、登錄繼續前運行自定義邏輯。',
    },
    post_sign_in: {
      name: '登錄後',
      description: '在用戶成功登錄後運行自定義邏輯。',
    },
  },
};

export default Object.freeze(inline_hooks);
