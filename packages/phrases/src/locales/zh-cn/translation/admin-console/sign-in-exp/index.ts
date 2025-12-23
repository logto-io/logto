import content from './content.js';
import custom_profile_fields from './custom-profile-fields.js';
import sign_up_and_sign_in from './sign-up-and-sign-in.js';

const sign_in_exp = {
  page_title: '登录体验',
  page_title_with_account: '登录与账户',
  title: '登录与账户',
  description: '自定义身份验证流程和用户界面，并实时预览开箱即用的体验。',
  tabs: {
    branding: '品牌',
    sign_up_and_sign_in: '注册与登录',
    collect_user_profile: '收集用户资料',
    account_center: '账户中心',
    content: '内容',
    password_policy: '密码策略',
  },
  welcome: {
    title: '自定义登录体验',
    description: '通过首次登录设置快速入门。本指南将带领你完成所有必要的设置。',
    get_started: '开始',
    apply_remind: '请注意，登录体验将会应用到当前帐户下的所有应用。',
  },
  color: {
    title: '颜色',
    primary_color: '品牌颜色',
    dark_primary_color: '品牌颜色 (深色)',
    dark_mode: '开启深色模式',
    dark_mode_description:
      '基于品牌颜色和 Logto 的算法，应用将会有一个自动生成的深色模式。当然，你可以自定义和修改。',
    dark_mode_reset_tip: '基于品牌颜色，重新生成深色模式颜色。',
    reset: '重新生成',
  },
  branding: {
    title: '品牌定制区',
    ui_style: '样式',
    with_light: '{{value}}',
    with_dark: '{{value}} (深色)',
    app_logo_and_favicon: '应用 logo 和 favicon',
    company_logo_and_favicon: '公司 logo 和 favicon',
    organization_logo_and_favicon: '组织 logo 和 favicon',
    hide_logto_branding: '隐藏 Logto 品牌',
    hide_logto_branding_description:
      '移除“Powered by Logto”。以干净、专业的登录体验专属呈现你的品牌。',
  },
  branding_uploads: {
    app_logo: {
      title: '应用 logo',
      url: '应用 logo URL',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: '应用 logo: {{error}}',
    },
    company_logo: {
      title: '公司 logo',
      url: '公司 logo URL',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: '公司 logo: {{error}}',
    },
    organization_logo: {
      title: '上传 图片',
      url: '组织 logo URL',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: '组织 logo: {{error}}',
    },
    connector_logo: {
      title: '上传 图片',
      url: '连接器 logo URL',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: '连接器 logo: {{error}}',
    },
    favicon: {
      title: 'Favicon',
      url: 'Favicon URL',
      url_placeholder: 'https://your.cdn.domain/favicon.ico',
      error: 'Favicon: {{error}}',
    },
  },
  custom_ui: {
    title: '自定义 UI',
    css_code_editor_title: '自定义 CSS',
    css_code_editor_description1: '请查看自定义 CSS 的示例。',
    css_code_editor_description2: '<a>{{link}}</a>',
    css_code_editor_description_link_content: '了解更多',
    css_code_editor_content_placeholder:
      '输入你自定义的 CSS 以根据你的精确要求调整任何样式。展示你的创造力，让你的 UI 脱颖而出。',
    bring_your_ui_title: '带上你的 UI',
    bring_your_ui_description:
      '上传一个压缩包 (.zip) 以使用你自己的代码替换 Logto 预构建的 UI。<a>了解更多</a>',
    preview_with_bring_your_ui_description:
      '你自定义的 UI 资源已经成功上传，现在正在提供服务。因此，内置预览窗口已被禁用。\n要测试你个性化的登录 UI，请单击“实时预览”按钮在新的浏览器标签中打开它。',
  },
  account_center: {
    title: '账户中心',
    description: '为终端用户实现账户中心，以管理账户安全和个人资料信息。',
    enable_account_api: '启用账户中心',
    enable_account_api_description:
      '启用面向用户的 Account API，具有可配置的权限，让你可以选择使用 Logto 的开箱即用账户中心或完全自定义的解决方案。',
    field_options: {
      off: '关闭',
      edit: '可编辑',
      read_only: '只读',
      enabled: '已启用',
      disabled: '已禁用',
    },
    sections: {
      account_security: {
        title: '账户安全',
        description:
          '管理对 Account API 的访问，允许用户在登录应用后查看或编辑其身份信息和认证要素。用户必须先完成身份验证并获取有效期 10 分钟的验证记录 ID，才能进行这些与安全相关的更改。',
        groups: {
          identifiers: {
            title: '身份标识',
          },
          authentication_factors: {
            title: '认证要素',
          },
        },
      },
      user_profile: {
        title: '用户资料',
        description:
          '管理对 Account API 的访问，允许用户在登录应用后查看或编辑基础或自定义的资料数据。',
        groups: {
          profile_data: {
            title: '资料数据',
          },
        },
      },
      secret_vault: {
        title: '密钥保险库',
        description:
          '用于社交与企业连接器，安全地存储第三方访问令牌，以调用其 API（例如向 Google 日历添加事件）。',
        third_party_token_storage: {
          title: '第三方令牌',
          third_party_access_token_retrieval: '第三方访问令牌获取',
          third_party_token_tooltip: '若要存储令牌，可在相应社交或企业连接器的设置中启用该选项。',
          third_party_token_description: '启用 Account API 后，将会自动开启第三方令牌获取。',
        },
      },
    },
    fields: {
      email: '电子邮件地址',
      phone: '手机号码',
      social: '社交身份',
      password: '密码',
      mfa: '多因素认证',
      mfa_description: '允许用户在账户中心管理其多因素认证方式。',
      username: '用户名',
      name: '姓名',
      avatar: '头像',
      profile: '资料',
      profile_description: '控制对结构化资料属性的访问。',
      custom_data: '自定义数据',
      custom_data_description: '控制对存储在用户上的自定义 JSON 数据的访问。',
    },
    webauthn_related_origins: 'WebAuthn 关联来源',
    webauthn_related_origins_description: '添加允许通过 Account API 注册通行密钥的前端应用域名。',
    webauthn_related_origins_error: '来源必须以 https:// 或 http:// 开头',
    prebuilt_ui: {
      title: '集成预构建 UI',
      description: '使用预构建 UI 快速集成开箱即用的验证和安全设置流程。',
      flows_title: '集成开箱即用的安全设置流程',
      flows_description:
        '将你的域名与路由组合以形成账户设置 URL（例如 https://auth.foo.com/account/email）。可选择添加 `redirect=` URL 参数，以在成功更新后将用户返回到你的应用。',
      tooltips: {
        email: '更新你的主要电子邮件地址',
        phone: '更新你的主要手机号码',
        username: '更新你的用户名',
        password: '设置新密码',
        authenticator_app: '设置新的身份验证器应用以进行多因素认证',
        passkey_add: '注册新的通行密钥',
        passkey_manage: '管理你现有的通行密钥或添加新的',
        backup_codes_generate: '生成一组新的 10 个备用码',
        backup_codes_manage: '查看你可用的备用码或生成新的',
      },
      customize_note: '不想要开箱即用的体验？你可以完全',
      customize_link: '使用 Account API 自定义你的流程。',
    },
  },
  sign_up_and_sign_in,
  content,
  setup_warning: {
    no_connector_sms:
      '尚未设置 SMS 短信连接器。在完成该配置前，用户将无法通过此登录方式登录。<a>{{link}}</a>连接器。',
    no_connector_email:
      '尚未设置电子邮件连接器。在完成该配置前，用户将无法通过此登录方式登录。<a>{{link}}</a>连接器。',
    no_connector_social:
      '你还没有设置任何社交连接器。首先添加连接器以应用社交登录方法。<a>{{link}}</a>连接器。',
    no_connector_email_account_center:
      '尚未设置电子邮件连接器。请在<a>"邮件与短信连接器"</a>中设置。',
    no_connector_sms_account_center:
      '尚未设置 SMS 短信连接器。请在<a>"邮件与短信连接器"</a>中设置。',
    no_connector_social_account_center: '尚未设置社交连接器。请在<a>"社交连接器"</a>中设置。',
    no_mfa_factor: '尚未设置 MFA 因子。请在<a>{{link}}</a>中完成设置。',
    setup_link: '立即设置',
  },
  save_alert: {
    description:
      '你正在进行登录注册设置的变更。当前你的所有用户会受到新设置的影响。确认保存该设置吗？',
    before: '设置前',
    after: '设置后',
    sign_up: '注册',
    sign_in: '登录',
    social: '社交',
    forgot_password_migration_notice:
      '我们已升级忘记密码验证以支持自定义方法。以前，这是由你的电子邮件和短信连接器自动确定的。点击<strong>确认</strong>以完成升级。',
  },
  preview: {
    title: '登录预览',
    live_preview: '实时预览',
    live_preview_tip: '保存以预览更改',
    native: '移动原生',
    desktop_web: '桌面网页',
    mobile_web: '移动网页',
    desktop: '桌面网页',
    mobile: '移动设备',
  },
  custom_profile_fields,
};

export default Object.freeze(sign_in_exp);
