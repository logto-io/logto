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
    description: '使用 Logto API 自定义你的账户中心流程。',
    enable_account_api: '启用 Account API',
    enable_account_api_description:
      '启用 Account API，构建自定义账户中心，让终端用户无需使用 Logto 管理 API 即可直接访问 API。',
    field_options: {
      off: 'Off',
      edit: 'Edit',
      read_only: 'Read only',
      enabled: '已启用',
      disabled: '已禁用',
    },
    sections: {
      account_security: {
        title: 'ACCOUNT SECURITY',
        description:
          'Manage access to the Account API, enabling users to view or edit their identity information and authentication factors after signing into the application. Users must verify their identity to get a valid 10-minute verification record ID before making these security-related changes.',
        groups: {
          identifiers: {
            title: 'Identifiers',
          },
          authentication_factors: {
            title: 'Authentication factors',
          },
        },
      },
      user_profile: {
        title: 'USER PROFILE',
        description:
          'Manage access to the Account API, enabling users to view or edit basic or custom profile data after signing into the application.',
        groups: {
          profile_data: {
            title: 'Profile data',
          },
        },
      },
      secret_vault: {
        title: '密钥保险库',
        description:
          '对于社交和企业连接器，安全存储第三方访问令牌以调用其 API（例如，向 Google 日历添加事件）。',
        third_party_token_storage: {
          title: '第三方令牌',
          third_party_access_token_retrieval: '第三方访问令牌检索',
          third_party_token_tooltip:
            '要存储令牌，您可以在相应的社交或企业连接器的设置中启用此功能。',
          third_party_token_description: '启用 Account API 后，第三方令牌检索会自动激活。',
        },
      },
    },
    fields: {
      email: 'Email address',
      phone: 'Phone number',
      social: 'Social identities',
      password: 'Password',
      mfa: 'Multi-factor authentication',
      mfa_description: 'Let users manage their MFA methods from the account center.',
      username: 'Username',
      name: 'Name',
      avatar: 'Avatar',
      profile: 'Profile',
      profile_description: 'Control access to structured profile attributes.',
      custom_data: 'Custom data',
      custom_data_description: 'Control access to custom JSON data stored on the user.',
    },
    webauthn_related_origins: 'WebAuthn 关联域名',
    webauthn_related_origins_description: '添加允许通过账户 API 注册通行密钥的前端应用域名。',
    webauthn_related_origins_error: '域名必须以 https:// 或 http:// 开头',
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
    no_mfa_factor: '尚未设置 MFA 因子。请先在"多因素认证"中<a>{{link}}</a>。',
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
