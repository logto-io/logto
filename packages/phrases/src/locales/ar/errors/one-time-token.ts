const one_time_token = {
  token_not_found: 'لم يتم العثور على رمز نشط مع البريد الإلكتروني والرمز المقدمين.',
  email_mismatch: 'البريد الإلكتروني لا يتطابق مع الرمز المقدم.',
  token_expired: 'انتهت صلاحية الرمز.',
  token_consumed: 'تم استهلاك الرمز.',
  token_revoked: 'تم إلغاء الرمز.',
  cannot_reactivate_token: 'لا يمكن إعادة تفعيل الرمز.',
};

export default Object.freeze(one_time_token);
