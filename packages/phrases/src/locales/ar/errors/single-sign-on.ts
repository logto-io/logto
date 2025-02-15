const single_sign_on = {
  forbidden_domains: 'لا يُسمح بنطاقات البريد الإلكتروني العامة.',
  duplicated_domains: 'هناك نطاقات مكررة.',
  invalid_domain_format: 'تنسيق النطاق غير صالح.',
  duplicate_connector_name: 'اسم الموصل مكرر. يرجى اختيار اسم مختلف.',
  idp_initiated_authentication_not_supported:
    'المصادقة التي يبدأها IdP مدعومة حصريًا لموصلات SAML.',
  idp_initiated_authentication_invalid_application_type:
    'نوع التطبيق غير صالح. يُسمح فقط بتطبيقات {{type}}.',
  idp_initiated_authentication_redirect_uri_not_registered:
    'لم يتم تسجيل redirect_uri. يرجى التحقق من إعدادات التطبيق.',
  idp_initiated_authentication_client_callback_uri_not_found:
    'لم يتم العثور على URI لاستدعاء المصادقة الذي بدأه العميل IdP. يرجى التحقق من إعدادات الموصل.',
};

export default Object.freeze(single_sign_on);
