import password_rejected from './password-rejected.js';

const error = {
  general_required: `{{types, list(type: disjunction;)}} مطلوب`,
  general_invalid: `{{types, list(type: disjunction;)}} غير صالح`,
  invalid_min_max_input: 'يجب أن تكون قيمة الإدخال بين {{minValue}} و {{maxValue}}',
  invalid_min_max_length: 'يجب أن يكون طول قيمة الإدخال بين {{minLength}} و {{maxLength}}',
  username_required: 'اسم المستخدم مطلوب',
  password_required: 'كلمة المرور مطلوبة',
  username_exists: 'اسم المستخدم موجود بالفعل',
  username_should_not_start_with_number: 'يجب ألا يبدأ اسم المستخدم برقم',
  username_invalid_charset: 'يجب أن يحتوي اسم المستخدم فقط على الحروف والأرقام والشرطات السفلية.',
  username_too_short: 'يجب أن يكون اسم المستخدم على الأقل {{min}} حرفًا.',
  username_too_long: 'يجب أن يكون اسم المستخدم بحد أقصى {{max}} حرفًا.',
  username_uppercase_not_allowed: 'لا يُسمح بالأحرف الكبيرة في أسماء المستخدمين.',
  username_lowercase_not_allowed: 'لا يُسمح بالأحرف الصغيرة في أسماء المستخدمين.',
  username_numbers_not_allowed: 'لا يُسمح بالأرقام في أسماء المستخدمين.',
  username_underscore_not_allowed: 'لا يُسمح بالشرطات السفلية في أسماء المستخدمين.',
  invalid_email: 'البريد الإلكتروني غير صالح',
  invalid_phone: 'رقم الهاتف غير صالح',
  passwords_do_not_match: 'كلمات المرور غير متطابقة. يرجى المحاولة مرة أخرى.',
  invalid_passcode: 'رمز التحقق غير صالح.',
  device_code_required: 'الرمز مطلوب.',
  invalid_device_code: 'رمز الجهاز غير صالح.',
  device_flow_aborted: 'تم مقاطعة طلب تسجيل الدخول.',
  invalid_connector_auth: 'التوثيق غير صالح',
  invalid_connector_request: 'بيانات الموصل غير صالحة',
  unknown: 'خطأ غير معروف. يرجى المحاولة مرة أخرى لاحقًا.',
  invalid_session: 'الجلسة غير موجودة. يرجى العودة وتسجيل الدخول مرة أخرى.',
  timeout: 'انتهت مهلة الطلب. يرجى المحاولة مرة أخرى لاحقًا.',
  password_rejected,
  sso_not_enabled: 'تسجيل الدخول الموحد غير ممكّن لحساب البريد الإلكتروني هذا.',
  invalid_link: 'رابط غير صالح',
  invalid_link_description: 'ربما يكون رمز الدخول المؤقت قد انتهى أو لم يعد صالحًا.',
  captcha_verification_failed: 'فشل التحقق من رمز التحقق.',
  send_verification_code_failed: 'فشل إرسال رمز التحقق. يرجى المحاولة لاحقًا.',
  send_verification_code_failed_use_password:
    'فشل إرسال رمز التحقق. يرجى تسجيل الدخول باستخدام كلمة المرور بدلاً من ذلك.',
  terms_acceptance_required: 'مطلوب قبول الشروط',
  terms_acceptance_required_description:
    'يجب أن توافق على الشروط للمتابعة. يرجى المحاولة مرة أخرى.',
  something_went_wrong: 'حدث خطأ ما',
  account_suspended: 'الحساب موقوف',
  account_suspended_description: 'تم إيقاف هذا الحساب. يرجى الاتصال بالمسؤول للحصول على المساعدة.',
  access_denied: 'تم رفض الوصول',
  application_access_denied:
    'ليس لديك إذن للوصول إلى هذا التطبيق.\nيرجى الاتصال بالمسؤول للحصول على المساعدة.',
  feature_not_enabled:
    'ليس لديك إذن للوصول إلى هذه الميزة. يرجى الاتصال بالمسؤول للحصول على المساعدة.',
};

export default Object.freeze(error);
