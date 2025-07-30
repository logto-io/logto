const verification_record = {
  not_found: 'لم يتم العثور على سجل التحقق.',
  permission_denied: 'تم رفض الإذن، يرجى إعادة التحقق.',
  not_supported_for_google_one_tap: 'هذا الـ API لا يدعم Google One Tap.',
  social_verification: {
    invalid_target: 'سجل التحقق غير صالح. المتوقع {{expected}} ولكن تم الحصول على {{actual}}.',
    token_response_not_found:
      'لم يتم العثور على استجابة الرمز. يرجى التحقق من أن تخزين الرموز مدعوم ومفعل للموصل الاجتماعي.',
  },
};

export default Object.freeze(verification_record);
