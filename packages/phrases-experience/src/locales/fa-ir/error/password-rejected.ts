import { type PasswordRejectionCode } from '@logto/core-kit';

type BreakdownKeysToObject<Key extends string> = {
  [K in Key as K extends `${infer A}.${string}` ? A : K]: K extends `${string}.${infer B}`
    ? BreakdownKeysToObject<B>
    : string;
};

type RejectionPhrases = BreakdownKeysToObject<PasswordRejectionCode>;

const password_rejected = {
  too_short: 'حداقل طول {{min}} کاراکتر است.',
  too_long: 'حداکثر طول {{max}} کاراکتر است.',
  character_types: 'حداقل {{min}} نوع کاراکتر مورد نیاز است.',
  unsupported_characters: 'کاراکتر پشتیبانی‌نشده‌ای یافت شد.',
  pwned: 'از استفاده از رمزهای عبور ساده که به راحتی قابل حدس هستند خودداری کنید.',
  restricted_found: 'از استفاده بیش از حد {{list, list}} خودداری کنید.',
  restricted: {
    repetition: 'کاراکترهای تکراری',
    sequence: 'کاراکترهای متوالی',
    user_info: 'اطلاعات شخصی شما',
    words: 'محتوای مرتبط با محصول',
  },
} satisfies RejectionPhrases & {
  // Use for displaying a list of restricted issues
  restricted_found: string;
};

export default Object.freeze(password_rejected);
