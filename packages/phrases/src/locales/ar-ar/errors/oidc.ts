const oidc = {
  aborted: 'أنهى المستخدم التفاعل.',
  invalid_scope: 'نطاق غير صالح: {{error_description}}.',
  invalid_token: 'الرمز غير صالح.',
  invalid_client_metadata: 'بيانات العميل غير صالحة.',
  insufficient_scope: 'الرمز ناقص في النطاق `{{scope}}`.',
  invalid_request: 'الطلب غير صالح.',
  invalid_grant: 'طلب المنحة غير صالح.',
  invalid_redirect_uri: '`redirect_uri` لا يتطابق مع أي من `redirect_uris` المسجلة للعميل.',
  access_denied: 'تم رفض الوصول.',
  invalid_target: 'مؤشر المورد غير صالح.',
  unsupported_grant_type: 'نوع `grant_type` المطلوب غير مدعوم.',
  unsupported_response_mode: 'طريقة الاستجابة `response_mode` المطلوبة غير مدعومة.',
  unsupported_response_type: 'نوع الاستجابة `response_type` المطلوب غير مدعوم.',
  provider_error: 'خطأ داخلي في OIDC: {{message}}.',
  server_error: 'حدث خطأ OIDC غير معروف. يرجى المحاولة مرة أخرى لاحقًا.',
  provider_error_fallback: 'حدث خطأ OIDC: {{code}}.',
  key_required: 'مطلوب مفتاح واحد على الأقل.',
  key_not_found: 'لم يتم العثور على المفتاح بالمعرف {{id}}.',
};

export default Object.freeze(oidc);
