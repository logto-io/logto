const sign_in_experiences = {
  empty_content_url_of_terms_of_use:
    'عنوان URL لمحتوى "شروط الاستخدام" فارغ. يرجى إضافة عنوان URL للمحتوى إذا تم تمكين "شروط الاستخدام".',
  empty_social_connectors:
    'الموصلات الاجتماعية فارغة. يرجى إضافة الموصلات الاجتماعية الممكّنة عند تمكين طريقة تسجيل الدخول الاجتماعية.',
  enabled_connector_not_found: 'لم يتم العثور على موصل {{type}} الممكّن.',
  not_one_and_only_one_primary_sign_in_method:
    'يجب أن يكون هناك طريقة واحدة وفقط لتسجيل الدخول الأساسية. يرجى التحقق من المدخلات الخاصة بك.',
  username_requires_password: 'يجب تمكين تعيين كلمة مرور لمعرف تسجيل الدخول باسم المستخدم.',
  passwordless_requires_verify: 'يجب تمكين التحقق لمعرف تسجيل الدخول بالبريد الإلكتروني / الهاتف.',
  miss_sign_up_identifier_in_sign_in: 'يجب أن تحتوي طرق تسجيل الدخول على معرف التسجيل.',
  password_sign_in_must_be_enabled:
    'يجب تمكين تسجيل الدخول بكلمة المرور عندما يكون تعيين كلمة المرور مطلوبًا في التسجيل.',
  code_sign_in_must_be_enabled:
    'يجب تمكين تسجيل الدخول برمز التحقق عندما لا يكون تعيين كلمة المرور مطلوبًا في التسجيل.',
  unsupported_default_language: 'هذه اللغة - {{language}} غير مدعومة في الوقت الحالي.',
  at_least_one_authentication_factor: 'يجب عليك تحديد عامل مصادقة واحد على الأقل.',
  backup_code_cannot_be_enabled_alone: 'لا يمكن تمكين رمز النسخ الاحتياطي بمفرده.',
  duplicated_mfa_factors: 'عوامل MFA مكررة.',
};

export default Object.freeze(sign_in_experiences);
