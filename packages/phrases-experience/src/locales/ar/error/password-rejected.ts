import { type PasswordRejectionCode } from '@logto/core-kit';

type BreakdownKeysToObject<Key extends string> = {
  [K in Key as K extends `${infer A}.${string}` ? A : K]: K extends `${string}.${infer B}`
    ? BreakdownKeysToObject<B>
    : string;
};

type RejectionPhrases = BreakdownKeysToObject<PasswordRejectionCode>;

const password_rejected = {
  too_short: 'الحد الأدنى للطول هو {{min}}.',
  too_long: 'الحد الأقصى للطول هو {{max}}.',
  character_types: 'مطلوب على الأقل {{min}} أنواع من الأحرف.',
  unsupported_characters: 'تم العثور على حرف غير مدعوم.',
  pwned: 'تجنب استخدام كلمات مرور بسيطة يسهل تخمينها.',
  restricted_found: 'تجنب الاستخدام المفرط لـ {{list, list}}.',
  restricted: {
    repetition: 'حروف متكررة',
    sequence: 'حروف متتالية',
    user_info: 'معلوماتك الشخصية',
    words: 'سياق المنتج',
  },
} satisfies RejectionPhrases & {
  // Use for displaying a list of restricted issues
  restricted_found: string;
};

export default Object.freeze(password_rejected);
