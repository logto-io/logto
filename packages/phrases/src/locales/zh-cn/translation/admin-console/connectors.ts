const connectors = {
  page_title: '连接器',
  title: '连接器',
  subtitle: '设置连接器，开启无密码和社交登录',
  create: '添加社交连接器',
  config_sie_notice: '你已经配置了社交连接器，记得在<a>{{link}}</a>上添加使之生效。',
  config_sie_link_text: '登录体验',
  tab_email_sms: '短信和邮件连接器',
  tab_social: '社交连接器',
  connector_name: '连接器名称',
  demo_tip: '演示连接器仅用于演示且最多只能发送 100 条消息，不建议在生产环境中部署。',
  social_demo_tip: '演示连接器仅用于演示目的，不建议在生产环境中部署。',
  connector_type: '类型',
  connector_status: '登录体验',
  connector_status_in_use: '使用中',
  connector_status_not_in_use: '未使用',
  not_in_use_tip: {
    content: '未使用意味着你的登录体验并没有使用这个登录方式。<a>{{link}}</a>去添加。',
    go_to_sie: '前往登录体验',
  },
  placeholder_title: '社交连接器',
  placeholder_description:
    'Logto 提供了许多广泛使用的社交登录连接器，同时你还可以使用标准协议创建自己的连接器。',
  save_and_done: '保存并完成',
  type: {
    email: '邮件连接器',
    sms: '短信连接器',
    social: '社交连接器',
  },
  setup_title: {
    email: '设置邮件连接器',
    sms: '设置短信连接器',
    social: '添加社交连接器',
  },
  guide: {
    subtitle: '参考以下步骤完成你的连接器设置',
    general_setting: '通用设置',
    parameter_configuration: '参数配置',
    test_connection: '连接测试',
    name: '社交登录按钮的名称',
    name_placeholder: '输入社交登录按钮的名称',
    name_tip: '按钮上将展示「通过 {{name}} 继续」。名字不宜过长而导致信息无法展示完整。',
    connector_logo: '连接器 logo',
    connector_logo_tip: '该 logo 将显示在连接器登录按钮上。',
    target: '身份提供商名称',
    target_placeholder: '输入身份提供商的名称',
    target_tip: '在“身份供应商名称”字段中输入唯一的标识符字符串，用于区分社交身份来源。',
    target_tip_standard:
      '在“身份供应商名称”字段中输入唯一的标识符字符串，用于区分社交身份来源。注意，在连接器创建成功后，无法再次修改此设置。',
    target_tooltip:
      'Logto 社交连接器的「target」指的是社交身份的「来源」。在 Logto 的设计里，我们不允许某一平台的连接器中有相同的「target」以避免身份的冲突。在添加连接器时，你需要格外小心，我们「不允许」用户在创建之后更改「target」的值。<a>了解更多</a>',
    target_conflict:
      '此「身份供应商名称」值与现有的 <span>name</span> 连接器相同。使用相同的身份供应商名称会导致不符合预期的登录行为，用户可能通过两个不同的连接器访问同一个帐户。',
    target_conflict_line2:
      '如果你想替换当前的连接器，并连接相同的身份提供商（IdP），以便先前的用户可以直接登录而无需重新注册，请先删除 <span>name</span> 连接器，再创建一个新的连接器并使用相同的「身份供应商名称」值。',
    target_conflict_line3: '如果你想连接一个新的身份验证提供程序，请修改「身份供应商名称」并继续。',
    config: '粘贴你的 JSON 代码',
    sync_profile: '开启用户资料同步',
    sync_profile_only_at_sign_up: '首次注册时同步',
    sync_profile_each_sign_in: '每次登录时同步',
    sync_profile_tip: '同步用户的用户名、头像等个人资料信息',
    enable_token_storage: {
      /** UNTRANSLATED */
      title: 'Store tokens for persistent API access',
      /** UNTRANSLATED */
      description:
        'Store access and refresh tokens in the Secret Vault. Allows automated API calls without repeated user consent. Example: let your AI Agent add events to Google Calendar with persistent authorization. <a>Learn how to call third-party APIs</a>',
      /** UNTRANSLATED */
      tip: 'Tips: For standard OAuth/OIDC identity provider, the `offline_access` scope must be included to obtain a refresh token, preventing repeated user consent prompts. ',
    },
    callback_uri: 'Callback URI',
    callback_uri_description:
      '也称为重定向 URI，在社交授权后，用户将被发送回 Logto 的 URI，复制并粘贴到社交提供者的配置页面中。',
    acs_url: '断言消费服务 URL',
  },
  platform: {
    universal: '通用',
    web: '网页',
    native: '原生',
  },
  add_multi_platform: '支持多平台，选择一个平台继续',
  drawer_title: '连接器配置指南',
  drawer_subtitle: '参考以下步骤完善或修改你的连接器设置',
  unknown: '未知连接器',
  standard_connectors: '标准连接器',
};

export default Object.freeze(connectors);
