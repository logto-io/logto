const password = {
  unsupported_encryption_method: 'طريقة التشفير {{name}} غير مدعومة.',
  pepper_not_found: 'رمز تشفير كلمة المرور غير موجود. يرجى التحقق من البيئة الأساسية الخاصة بك.',
  rejected: 'تم رفض كلمة المرور. يرجى التحقق مما إذا كانت كلمة المرور تلبي المتطلبات.',
  invalid_legacy_password_format: 'تنسيق كلمة المرور القديمة غير صالح.',
  unsupported_legacy_hash_algorithm: 'خوارزمية التجزئة القديمة غير مدعومة: {{algorithm}}.',
};

export default Object.freeze(password);
