const one_time_token = {
  token_not_found: 'الرمز {{token}} غير موجود.',
  email_mismatch: 'البريد الإلكتروني لا يتطابق مع الرمز المقدم.',
  interaction_event_mismatch: 'لا يمكن استخدام الرمز لهذا التفاعل.',
  token_expired: 'انتهت صلاحية الرمز.',
  token_consumed: 'تم استهلاك الرمز.',
  token_revoked: 'تم إلغاء الرمز.',
  cannot_reactivate_token: 'لا يمكن إعادة تفعيل الرمز.',
};

export default Object.freeze(one_time_token);
