import password_rejected from './password-rejected.js';

const error = {
  general_required: `{{types, list(type: disjunction;)}} مطلوب`,
  general_invalid: `{{types, list(type: disjunction;)}} غير صالح`,
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
};

export default Object.freeze(error);
