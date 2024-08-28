import content from './content.js';
import password_policy from './password-policy.js';
import sign_up_and_sign_in from './sign-up-and-sign-in.js';

const sign_in_exp = {
  page_title: '登录体验',
  title: '登录体验',
  description: '自定义登录界面，并实时预览真实效果',
  tabs: {
    branding: '品牌',
    sign_up_and_sign_in: '注册与登录',
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
    favicon: '浏览器地址栏图标',
    logo_image_url: 'Logo 图片 URL',
    logo_image_url_placeholder: 'https://your.cdn.domain/logo.png',
    dark_logo_image_url: 'Logo 图片 URL (深色)',
    dark_logo_image_url_placeholder: 'https://your.cdn.domain/logo-dark.png',
    logo_image: 'Logo 图片',
    dark_logo_image: 'Logo 图片(深色)',
    logo_image_error: '应用 Logo：{{error}}',
    favicon_error: 'Favicon：{{error}}',
  },
  custom_css: {
    title: '自定义 CSS',
    css_code_editor_title: '自定义 CSS 个性化你的用户界面',
    css_code_editor_description1: '查看自定义 CSS 的例子。',
    css_code_editor_description2: '<a>{{link}}</a>',
    css_code_editor_description_link_content: '了解更多',
    css_code_editor_content_placeholder:
      '输入 CSS 代码，修改颜色、字体、组件样式、布局，定制你的登录、注册、忘记密码等页面。充分发挥创造力，让你的用户界面脱颖而出。',
  },
  sign_up_and_sign_in,
  content,
  password_policy,
  setup_warning: {
    no_connector_sms:
      '尚未设置 SMS 短信连接器。在完成该配置前，用户将无法通过此登录方式登录。<a>{{link}}</a>连接器。',
    no_connector_email:
      '尚未设置电子邮件连接器。在完成该配置前，用户将无法通过此登录方式登录。<a>{{link}}</a>连接器。',
    no_connector_social:
      '您还没有设置任何社交连接器。首先添加连接器以应用社交登录方法。<a>{{link}}</a>连接器。',
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
};

export default Object.freeze(sign_in_exp);
