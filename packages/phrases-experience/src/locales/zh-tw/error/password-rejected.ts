const password_rejected = {
  too_short: '最少需要 {{min}} 位字元。',
  too_long: '最多只能有 {{max}} 位字元。',
  character_types: '至少需要 {{min}} 種不同的字元類型。',
  unsupported_characters: '發現不支援的字元。',
  pwned: '請避免使用容易被猜中的簡單密碼。',
  restricted_found: '請避免過度使用 {{list, list}}。',
  restricted: {
    repetition: '連續重複的字元',
    sequence: '連續的字元',
    user_info: '個人資訊',
    words: '使用產品相關的字詞',
  },
};

export default Object.freeze(password_rejected);
