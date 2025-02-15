const single_sign_on = {
  forbidden_domains: '不允许使用公共电子邮件域名。',
  duplicated_domains: '存在重复的域名。',
  invalid_domain_format: '无效的域名格式。',
  duplicate_connector_name: '连接器名称已存在。请选择不同的名称。',
  idp_initiated_authentication_not_supported: 'IdP 发起的身份验证仅支持 SAML 连接器。',
  idp_initiated_authentication_invalid_application_type:
    '无效的应用程序类型。仅允许 {{type}} 应用程序。',
  idp_initiated_authentication_redirect_uri_not_registered:
    'redirect_uri 未注册。请检查应用程序设置。',
  idp_initiated_authentication_client_callback_uri_not_found:
    '未找到客户端 IdP 发起的身份验证回调 URI。请检查连接器设置。',
};

export default Object.freeze(single_sign_on);
