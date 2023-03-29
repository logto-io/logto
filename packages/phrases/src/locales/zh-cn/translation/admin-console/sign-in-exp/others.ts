const others = {
  terms_of_use: {
    title: '条款',
    terms_of_use: '使用条款 URL',
    terms_of_use_placeholder: 'https://your.terms.of.use/',
    privacy_policy: '隐私政策 URL',
    privacy_policy_placeholder: 'https://your.privacy.policy/',
  },
  languages: {
    title: '语言',
    enable_auto_detect: '开启语言自动适配',
    description:
      '基于用户自身的语言设定，产品将展示最符合用户使用习惯的语言。你可以为产品添加翻译内容、选择语言代码和设定自定义语言，来延展产品的本地化需求。',
    manage_language: '管理语言',
    default_language: '默认语言',
    default_language_description_auto:
      '语言自动适配已开启，当用户设定的语言无法匹配时，他们将看到默认语言。',
    default_language_description_fixed:
      '语言自动适配已关闭，你的应用将只展示默认语言。开启自动适配即可定制语言。',
  },
  manage_language: {
    title: '管理语言',
    subtitle: '你可以为产品添加翻译内容、选择语言代码和设定自定义语言，来延展产品的本地化需求。',
    add_language: '添加语言',
    logto_provided: 'Logto 提供',
    key: '键名',
    logto_source_values: 'Logto 源语言',
    custom_values: '翻译文本',
    clear_all_tip: '清空',
    unsaved_description: '离开页面前，记得保存你本次做的内容修改。',
    deletion_tip: '删除',
    deletion_title: '你确定你要删除新加的语言吗？',
    deletion_description: '删除后，你的用户将无法使用该语言查看内容。',
    default_language_deletion_title: '你无法删除默认语言',
    default_language_deletion_description:
      '你已设置{{language}}为你的默认语言，你无法删除默认语言。',
  },
  advanced_options: {
    title: '高级选项',
    enable_user_registration: '启用用户注册',
    enable_user_registration_description:
      '开启或关闭用户注册功能。一旦关闭，用户将无法通过登录界面自行注册账号，但管理员仍可通过管理控制台添加用户。',
  },
};
export default others;
