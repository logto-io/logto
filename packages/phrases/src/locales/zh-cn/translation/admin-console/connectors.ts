const connectors = {
  title: '连接器',
  subtitle: '设置连接器，开启无密码和社交登录',
  create: '添加社交连接器',
  config_sie_notice: 'You’ve set up connectors. Make sure to configure it in <a>{{link}}</a>.', // UNTRANSLATED
  config_sie_link_text: 'sign in experience', // UNTRANSLATED
  tab_email_sms: '短信和邮件连接器',
  tab_social: '社交连接器',
  connector_name: '连接器名称',
  connector_type: '类型',
  connector_status: '登录体验',
  connector_status_in_use: '使用中',
  connector_status_not_in_use: '未使用',
  not_in_use_tip: {
    content:
      'Not in use means your sign in experience hasn’t used this sign in method. <a>{{link}}</a> to add this sign in method. ', // UNTRANSLATED
    go_to_sie: 'Go to sign in experience', // UNTRANSLATED
  },
  social_connector_eg: '如: 微信登录，支付宝登录',
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
  },
  platform: {
    universal: '通用',
    web: '网页',
    native: '原生',
  },
  add_multi_platform: '支持多平台，选择一个平台继续',
  drawer_title: '连接器配置指南',
  drawer_subtitle: '参考以下步骤完善或修改你的连接器设置',
};

export default connectors;
