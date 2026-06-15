const verification_record = {
  not_found: 'رکورد تأیید یافت نشد.',
  permission_denied: 'دسترسی رد شد، لطفاً دوباره احراز هویت کنید.',
  not_supported_for_google_one_tap: 'این API از Google One Tap پشتیبانی نمی‌کند.',
  social_verification: {
    invalid_target: 'رکورد تأیید نامعتبر است. {{expected}} انتظار می‌رفت اما {{actual}} دریافت شد.',
    token_response_not_found:
      'پاسخ توکن یافت نشد. لطفاً بررسی کنید که ذخیره توکن برای اتصال‌دهنده اجتماعی پشتیبانی و فعال است.',
  },
};

export default Object.freeze(verification_record);
