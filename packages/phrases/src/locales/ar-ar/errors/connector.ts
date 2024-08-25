const connector = {
  general: 'حدث خطأ في الموصل: {{errorDescription}}',
  not_found: 'تعذر العثور على أي موصل متاح للنوع: {{type}}.',
  not_enabled: 'الموصل غير ممكّن.',
  invalid_metadata: 'بيانات الموصل غير صالحة.',
  invalid_config_guard: 'حارس تكوين الموصل غير صالح.',
  unexpected_type: 'نوع الموصل غير متوقع.',
  invalid_request_parameters: 'الطلب يحتوي على معلمة(معلمات) إدخال غير صحيحة.',
  insufficient_request_parameters: 'قد يفتقر الطلب إلى بعض المعلمات الإدخال.',
  invalid_config: 'تكوين الموصل غير صالح.',
  invalid_certificate: 'شهادة الموصل غير صالحة، يرجى التأكد من أن الشهادة مشفرة بترميز PEM.',
  invalid_response: 'استجابة الموصل غير صالحة.',
  template_not_found: 'تعذر العثور على القالب الصحيح في تكوين الموصل.',
  template_not_supported: 'الموصل لا يدعم نوع القالب هذا.',
  rate_limit_exceeded: 'تم تجاوز حد معدل التشغيل. يرجى المحاولة مرة أخرى لاحقًا.',
  not_implemented: '{{method}}: لم يتم تنفيذه بعد.',
  social_invalid_access_token: 'رمز الوصول للموصل غير صالح.',
  invalid_auth_code: 'رمز المصادقة للموصل غير صالح.',
  social_invalid_id_token: 'رمز الهوية للموصل غير صالح.',
  authorization_failed: 'فشلت عملية ترخيص المستخدم.',
  social_auth_code_invalid: 'تعذر الحصول على رمز الوصول، يرجى التحقق من رمز الترخيص.',
  more_than_one_sms: 'عدد موصلات الرسائل القصيرة أكبر من 1.',
  more_than_one_email: 'عدد موصلات البريد الإلكتروني أكبر من 1.',
  more_than_one_connector_factory:
    'تم العثور على مصانع موصل متعددة (بالمعرف {{connectorIds}})، قد تقوم بإلغاء تثبيت تلك غير الضرورية.',
  db_connector_type_mismatch: 'هناك موصل في قاعدة البيانات لا يتطابق مع النوع.',
  not_found_with_connector_id: 'تعذر العثور على الموصل بالمعرف القياسي المحدد.',
  multiple_instances_not_supported: 'لا يمكن إنشاء عدة مثيلات باستخدام الموصل القياسي المحدد.',
  invalid_type_for_syncing_profile:
    'يمكنك مزامنة ملف تعريف المستخدم فقط مع موصلات التواصل الاجتماعي.',
  can_not_modify_target: 'لا يمكن تعديل موصل الهدف.',
  should_specify_target: 'يجب تحديد الهدف.',
  multiple_target_with_same_platform:
    'لا يمكن أن يكون لديك موصلات اجتماعية متعددة لها نفس الهدف والمنصة.',
  cannot_overwrite_metadata_for_non_standard_connector:
    'لا يمكن استبدال بيانات الموصل غير القياسي هذا.',
};

export default Object.freeze(connector);
