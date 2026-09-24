const cloud = {
  console_sso: {
    back_to_list: '返回控制台 SSO',
    create: '添加连接器',
    title: '控制台 SSO',
    description: '配置你自己的身份提供商，通过单点登录访问 Logto Console。',
    domain_bound: '已绑定',
    domain_pending: '验证中',
    domain_verify_step: '验证你的域名',
    domain_bind_step: '绑定邮箱域名',
    domain_add_placeholder: '添加邮箱域名',
    domain_bound_description: '此域名已用于 Console SSO。TXT 验证记录已被移除。',
    domain_dns_instructions: '在 DNS 服务商处添加此 TXT 记录以验证域名所有权。',
    domain_waiting_for_dns: '等待 TXT 记录生效。我们每 10 秒检查一次。',
    domain_proven_unbound: '域名所有权已验证，但绑定尚未完成。',
    domain_verified: '域名所有权已验证。',
    domain_binding_pending: '验证完成后将自动开始绑定。',
    domain_remove_description:
      '从 Console SSO 中移除 {{domain}}？移除已绑定的域名后，该域名的邮箱地址将无法通过 SSO 发现连接器。',
    domain_invalid: '请输入有效的邮箱域名。',
    domain_conflict: '此域名已绑定到另一个 Console SSO 连接器。',
    domain_invalid_provider: '请先完成连接设置，再绑定此域名。',
    domain_dns_timeout: 'DNS 检查失败。我们会自动重试。',
    domain_recovery: '域名变更尚未完成。',
    start_over: '重新开始',
    start_over_confirmation: '重新开始可能会删除尚未完成的 SSO 配置。是否继续？',
    resume_creation: '发现未完成的创建操作。请使用同一身份提供商继续，以恢复此连接器。',
  },
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
