const cloud = {
  general: {
    onboarding: '入门',
  },
  create_tenant: {
    page_title: '创建租户',
    title: '创建你的第一个租户',
    description: '租户是一个隔离的环境，你可以在其中管理用户身份、应用程序和所有其他 Logto 资源。',
    invite_collaborators: '通过电子邮件邀请你的合作者',
    hear_about_us: {
      title: '你最初是从哪里了解到 Logto 的?',
      detail_placeholder: '告诉我们更多(可选)',
      options: {
        search_engine: '搜索引擎(Google、Bing 等)',
        ai_assistant: 'AI 助手(ChatGPT、Claude、Gemini 等)',
        github_oss: 'GitHub 或开源目录',
        friend_colleague: '朋友或同事推荐',
        powered_by: '某个使用 Logto 的应用的登录页',
        content_social: '社交媒体、文章或视频(YouTube、X、Reddit 等)',
        other: '其他',
      },
    },
  },
  social_callback: {
    title: '你已成功登录',
    description:
      '你已成功使用社交账户登录。为确保与 Logto 的无缝集成并获得所有功能的访问权限，我们建议你继续配置自己的社交连接器。',
    notice:
      '请避免将演示连接器用于生产目的。一旦你完成测试，请删除演示连接器，并使用你的凭证设置你自己的连接器。',
  },
  tenant: {
    create_tenant: '创建租户',
  },
};

export default Object.freeze(cloud);
