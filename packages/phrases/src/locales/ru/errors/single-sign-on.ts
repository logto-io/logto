const single_sign_on = {
  forbidden_domains: 'Недопустимы публичные домены электронной почты.',
  duplicated_domains: 'Есть дублирующиеся домены.',
  invalid_domain_format: 'Недопустимый формат домена.',
  duplicate_connector_name: 'Имя коннектора уже существует. Пожалуйста, выберите другое имя.',
  idp_initiated_authentication_not_supported:
    'Аутентификация, инициированная IdP, поддерживается исключительно для SAML-коннекторов.',
  idp_initiated_authentication_invalid_application_type:
    'Недопустимый тип приложения. Разрешены только приложения {{type}}.',
  idp_initiated_authentication_redirect_uri_not_registered:
    'redirect_uri не зарегистрирован. Пожалуйста, проверьте настройки приложения.',
  idp_initiated_authentication_client_callback_uri_not_found:
    'URI обратного вызова для аутентификации, инициированной клиентом IdP, не найден. Пожалуйста, проверьте настройки коннектора.',
};

export default Object.freeze(single_sign_on);
