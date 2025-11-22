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
  invalid_email: 'البريد الإلكتروني غير صالح',
  invalid_phone: 'رقم الهاتف غير صالح',
  passwords_do_not_match: 'كلمات المرور غير متطابقة. يرجى المحاولة مرة أخرى.',
  invalid_passcode: 'رمز التحقق غير صالح.',
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
  terms_acceptance_required: 'مطلوب قبول الشروط',
  terms_acceptance_required_description:
    'يجب أن توافق على الشروط للمتابعة. يرجى المحاولة مرة أخرى.',
  something_went_wrong: 'حدث خطأ ما.',
  feature_not_enabled: 'هذه الميزة غير مفعلة.',
};

export default Object.freeze(error);
