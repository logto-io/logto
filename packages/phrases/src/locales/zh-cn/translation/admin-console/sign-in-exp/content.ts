const content = {
  terms_of_use: {
    title: 'TERMS',
    description: '添加条款和隐私以满足合规要求。',
    terms_of_use: '使用条款 URL',
    terms_of_use_placeholder: 'https://your.terms.of.use/',
    privacy_policy: '隐私政策 URL',
    privacy_policy_placeholder: 'https://your.privacy.policy/',
    agree_to_terms: '同意条款',
    agree_policies: {
      automatic: '继续自动同意条款',
      manual_registration_only: '仅在注册时需要勾选同意',
      manual: '在注册和登录时都需要勾选同意',
    },
  },
  languages: {
    title: '语言',
    enable_auto_detect: '启用自动检测',
    description:
      '你的软件会检测用户的语言设置并切换为当地语言。你可以通过将界面从英语翻译成其他语言来添加新的语言。',
    manage_language: '管理语言',
    default_language: '默认语言',
    default_language_description_auto: '当检测到的用户语言不在当前语言库中时，将使用默认语言。',
    default_language_description_fixed:
      '关闭自动检测时，默认语言是你的软件唯一显示的语言。开启自动检测以扩展语言。',
  },
  support: {
    title: '支持',
    subtitle: '在错误页面上显示你的支持渠道，以便快速用户协助。',
    support_email: '支持电子邮箱',
    support_email_placeholder: 'support@email.com',
    support_website: '支持网站',
    support_website_placeholder: 'https://your.website/support',
  },
  manage_language: {
    title: '管理语言',
    subtitle: '通过添加语言和翻译来本地化产品体验。你的贡献可以设置为默认语言。',
    add_language: '添加语言',
    logto_provided: 'Logto 提供',
    key: '键',
    logto_source_values: 'Logto 源值',
    custom_values: '自定义值',
    clear_all_tip: '清除全部值',
    unsaved_description: '如果离开此页面而不保存，更改将不会保存。',
    deletion_tip: '删除该语言',
    deletion_title: '确定要删除已添加的语言吗？',
    deletion_description: '删除后，用户将无法再使用该语言浏览。',
    default_language_deletion_title: '默认语言无法删除。',
    default_language_deletion_description: '{{language}} 已设置为你的默认语言，无法删除。',
  },
};

export default Object.freeze(content);
