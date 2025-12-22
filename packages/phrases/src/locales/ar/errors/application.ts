const application = {
  invalid_type: 'يمكن أن تحتوي التطبيقات الآلية فقط على أدوار مرتبطة.',
  role_exists: 'تمت إضافة معرف الدور {{roleId}} بالفعل إلى هذا التطبيق.',
  invalid_role_type: 'لا يمكن تعيين دور نوع المستخدم لتطبيق آلي إلى آلة.',
  invalid_third_party_application_type:
    'يمكن تحديد تطبيقات الويب التقليدية والتطبيقات أحادية الصفحة والتطبيقات الأصلية فقط كتطبيقات طرف ثالث.',
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
    use_saml_app_api:
      'استخدم واجهة برمجة التطبيقات `[METHOD] /saml-applications(/.*)?` لتشغيل تطبيق SAML.',
    saml_application_only: 'واجهة برمجة التطبيقات متاحة فقط لتطبيقات SAML.',
    reach_oss_limit:
      'لا يمكنك إنشاء المزيد من تطبيقات SAML لأن الحد الأقصى {{limit}} تم الوصول إليه.',
    acs_url_binding_not_supported: 'يدعم فقط التوزيع HTTP-POST لاستقبال إقرارات SAML.',
    can_not_delete_active_secret: 'لا يمكن حذف السر النشط.',
    no_active_secret: 'لم يتم العثور على سر نشط.',
    entity_id_required: 'معرف الكيان مطلوب لإنشاء بيانات وصفية.',
    name_id_format_required: 'مطلوب تنسيق معرف الاسم.',
    unsupported_name_id_format: 'تنسيق معرف الاسم غير مدعوم.',
    missing_email_address: 'المستخدم لا يمتلك عنوان بريد إلكتروني.',
    email_address_unverified: 'لم يتم التحقق من عنوان البريد الإلكتروني للمستخدم.',
    invalid_certificate_pem_format: 'تنسيق شهادة PEM غير صالح.',
    acs_url_required: 'عنوان URL لخدمة مستهلك الإقرارات مطلوب.',
    private_key_required: 'المفتاح الخاص مطلوب.',
    certificate_required: 'الشهادة مطلوبة.',
    invalid_saml_request: 'طلب مصادقة SAML غير صالح.',
    auth_request_issuer_not_match: 'المرسل لطلب مصادقة SAML لا يتطابق مع معرف خدمة الكيان.',
    sp_initiated_saml_sso_session_not_found_in_cookies:
      'لم يتم العثور على معرف جلسة SAML SSO التي بدأت من قبل مزود الخدمة في ملفات تعريف الارتباط.',
    sp_initiated_saml_sso_session_not_found:
      'لم يتم العثور على جلسة SAML SSO التي بدأت من قبل مزود الخدمة.',
    state_mismatch: 'عدم تطابق `state`.',
  },
};

export default Object.freeze(application);
