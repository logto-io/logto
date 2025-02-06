const application = {
  invalid_type: 'يمكن أن تحتوي التطبيقات الآلية فقط على أدوار مرتبطة.',
  role_exists: 'تمت إضافة معرف الدور {{roleId}} بالفعل إلى هذا التطبيق.',
  invalid_role_type: 'لا يمكن تعيين دور نوع المستخدم لتطبيق آلي إلى آلة.',
  invalid_third_party_application_type:
    'يمكن تحديد التطبيقات الويب التقليدية فقط كتطبيقات طرف ثالث.',
  third_party_application_only: 'الميزة متاحة فقط لتطبيقات الطرف الثالث.',
  user_consent_scopes_not_found: 'نطاقات موافقة المستخدم غير صالحة.',
  consent_management_api_scopes_not_allowed:
    'لا يُسمح باستخدام نطاقات واجهة برمجة التطبيقات لإدارة الموافقة.',
  protected_app_metadata_is_required: 'مطلوب بيانات التطبيق المحمي.',
  protected_app_not_configured:
    'مزود التطبيق المحمي غير مكون. هذه الميزة غير متاحة في النسخة المفتوحة المصدر.',
  cloudflare_unknown_error: 'حدث خطأ غير معروف عند طلب واجهة برمجة التطبيقات من Cloudflare',
  protected_application_only: 'الميزة متاحة فقط للتطبيقات المحمية.',
  protected_application_misconfigured: 'تم تكوين التطبيق المحمي بشكل غير صحيح.',
  protected_application_subdomain_exists: 'تم استخدام نطاق فرعي للتطبيق المحمي بالفعل.',
  invalid_subdomain: 'نطاق فرعي غير صالح.',
  custom_domain_not_found: 'لم يتم العثور على نطاق مخصص.',
  should_delete_custom_domains_first: 'يجب حذف النطاقات المخصصة أولاً.',
  no_legacy_secret_found: 'لا يحتوي التطبيق على سر تراثي.',
  secret_name_exists: 'اسم السر موجود بالفعل.',
  saml: {
    /** UNTRANSLATED */
    use_saml_app_api: 'Use `[METHOD] /saml-applications(/.*)?` API to operate SAML app.',
    /** UNTRANSLATED */
    saml_application_only: 'The API is only available for SAML applications.',
    /** UNTRANSLATED */
    reach_oss_limit: 'You CAN NOT create more SAML apps since the limit of {{limit}} is hit.',
    /** UNTRANSLATED */
    acs_url_binding_not_supported:
      'Only HTTP-POST binding is supported for receiving SAML assertions.',
    /** UNTRANSLATED */
    can_not_delete_active_secret: 'Can not delete the active secret.',
    /** UNTRANSLATED */
    no_active_secret: 'No active secret found.',
    /** UNTRANSLATED */
    entity_id_required: 'Entity ID is required to generate metadata.',
    /** UNTRANSLATED */
    name_id_format_required: 'Name ID format is required.',
    /** UNTRANSLATED */
    unsupported_name_id_format: 'Unsupported name ID format.',
    /** UNTRANSLATED */
    missing_email_address: 'User does not have an email address.',
    /** UNTRANSLATED */
    email_address_unverified: 'User email address is not verified.',
    /** UNTRANSLATED */
    invalid_certificate_pem_format: 'Invalid PEM certificate format',
    /** UNTRANSLATED */
    acs_url_required: 'Assertion Consumer Service URL is required.',
    /** UNTRANSLATED */
    private_key_required: 'Private key is required.',
    /** UNTRANSLATED */
    certificate_required: 'Certificate is required.',
    /** UNTRANSLATED */
    invalid_saml_request: 'Invalid SAML authentication request.',
    /** UNTRANSLATED */
    auth_request_issuer_not_match:
      'The issuer of the SAML authentication request mismatch with service provider entity ID.',
    /** UNTRANSLATED */
    sp_initiated_saml_sso_session_not_found_in_cookies:
      'Service provider initiated SAML SSO session ID not found in cookies.',
    /** UNTRANSLATED */
    sp_initiated_saml_sso_session_not_found:
      'Service provider initiated SAML SSO session not found.',
    /** UNTRANSLATED */
    state_mismatch: '`state` mismatch.',
  },
};

export default Object.freeze(application);
