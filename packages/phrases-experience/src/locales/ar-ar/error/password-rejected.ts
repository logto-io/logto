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
};

export default Object.freeze(password_rejected);
