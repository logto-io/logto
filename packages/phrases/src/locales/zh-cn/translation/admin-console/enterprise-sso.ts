const enterprise_sso = {
  page_title: '企业单点登录',
  title: '企业单点登录',
  subtitle: '连接企业身份提供者并启用SP启动的单点登录。',
  create: '添加企业连接器',
  col_connector_name: '连接器名称',
  col_type: '类型',
  col_email_domain: '电子邮件域',
  col_status: '状态',
  col_status_in_use: '正在使用',
  col_status_invalid: '无效',
  placeholder_title: '企业连接器',
  placeholder_description:
    'Logto已提供许多内置的企业身份提供者来连接，同时您可以使用标准协议创建您自己的提供者。',
  create_modal: {
    title: '添加企业连接器',
    text_divider: '或者您可以通过标准协议自定义您的连接器。',
    connector_name_field_title: '连接器名称',
    connector_name_field_placeholder: '企业身份提供者的名称',
    create_button_text: '创建连接器',
  },
};

export default Object.freeze(enterprise_sso);
