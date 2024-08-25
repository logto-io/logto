const verification_code = {
  phone_email_empty: 'كل من رقم الهاتف والبريد الإلكتروني فارغين.',
  not_found: 'لم يتم العثور على رمز التحقق. يرجى إرسال رمز التحقق أولاً.',
  phone_mismatch: 'عدم تطابق الهاتف. يرجى طلب رمز تحقق جديد.',
  email_mismatch: 'عدم تطابق البريد الإلكتروني. يرجى طلب رمز تحقق جديد.',
  code_mismatch: 'رمز التحقق غير صالح.',
  expired: 'انتهت صلاحية رمز التحقق. يرجى طلب رمز تحقق جديد.',
  exceed_max_try: 'تجاوز الحد الأقصى لمحاولات رمز التحقق. يرجى طلب رمز تحقق جديد.',
};

export default Object.freeze(verification_code);
