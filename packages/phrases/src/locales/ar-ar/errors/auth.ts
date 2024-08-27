const auth = {
  authorization_header_missing: 'تفقد رأس الطلب (Authorization header).',
  authorization_token_type_not_supported: 'نوع التصريح غير مدعوم.',
  unauthorized: 'غير مصرح. يرجى التحقق من بيانات الاعتماد ونطاقها.',
  forbidden: 'ممنوع. يرجى التحقق من أدوار المستخدم والأذونات.',
  expected_role_not_found:
    'لم يتم العثور على الدور المتوقع. يرجى التحقق من أدوار المستخدم والأذونات.',
  jwt_sub_missing: 'القيمة `sub` مفقودة في JWT.',
  require_re_authentication: 'مطلوب إعادة المصادقة لإجراء حماية.',
};

export default Object.freeze(auth);
