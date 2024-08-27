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
};

export default Object.freeze(application);
