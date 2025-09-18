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
      title: '存储令牌以进行持久的 API 访问',
      description:
        '将访问令牌和刷新令牌存储在 Secret Vault 中。允许在不反复获得用户同意的情况下自动调用 API。例如：让你的 AI 代理在持久授权下添加事件到 Google 日历。<a>了解如何调用第三方 API</a>',
    },
    callback_uri: '重定向 URI（回调 URI）',
    callback_uri_description:
      'Redirect URI 是在社交授权后用户被重定向到的地址。请将此 URI 添加到 IdP 的配置中。',
    callback_uri_custom_domain_description:
      '如果你在 Logto 中使用多个<a>自定义域名</a>，务必将所有对应的回调 URI 都添加到 IdP 中，以确保社交登录在每个域名上都能正常工作。\n\n默认的 Logto 域名 (*.logto.app) 始终有效，只有在你也希望支持该域名下的登录时才需要包含它。',
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
  create_form: {
    third_party_connectors:
      '集成第三方提供商以实现快速社交登录、社交账户绑定和 API 访问。 <a>了解更多</a>',
    standard_connectors: '或者你可以通过标准协议定制你的社交连接器。',
  },
};

export default Object.freeze(connectors);
