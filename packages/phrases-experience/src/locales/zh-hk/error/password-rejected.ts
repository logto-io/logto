const password_rejected = {
  too_short: '最少長度為{{min}}。',
  too_long: '最大長度為{{max}}。',
  character_types: '至少需要{{min}}種類的字符。',
  unsupported_characters: '發現不支援的字符。',
  pwned: '避免使用容易猜測的簡單密碼。',
  restricted_found: '避免過度使用{{list, list}}。',
  restricted: {
    repetition: '重複的字符',
    sequence: '連續的字符',
    user_info: '個人資訊',
    words: '產品上下文',
  },
};

export default Object.freeze(password_rejected);
