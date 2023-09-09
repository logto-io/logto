const password_policy = {
  password_requirements: '密碼需求',
  minimum_length: '最小長度',
  /** UNTRANSLATED */
  minimum_length_description: 'NIST suggests using <a>at least 8 characters</a> for web products.',
  minimum_length_error: '最小長度必須介於 {{min}} 到 {{max}}（包括）之間。',
  minimum_required_char_types: '最低需要的字元類型',
  /** UNTRANSLATED */
  minimum_required_char_types_description:
    'Character types: uppercase (A-Z), lowercase (a-z), numbers (0-9), and special symbols ({{symbols}}).',
  password_rejection: '拒絕密碼',
  compromised_passwords: '拒絕已破解的密碼',
  breached_passwords: '遭破解的密碼',
  breached_passwords_description: '拒絕以前在密碼洩漏數據庫中找到的密碼。',
  restricted_phrases: '限制低安全性片語',
  restricted_phrases_tooltip:
    '用戶不能使用完全相同或由下列片語組成的密碼。可以添加3個或更多非連續字符以增加密碼的複雜性。',
  repetitive_or_sequential_characters: '重複或連續字元',
  repetitive_or_sequential_characters_description: '例如：“AAAA”，“1234”，和“abcd”。',
  user_information: '用戶資訊',
  user_information_description: '例如，電子郵件地址，電話號碼，用戶名等。',
  custom_words: '自訂字詞',
  custom_words_description: '個性化上下文相關的字詞，不區分大小寫，每行一個。',
  custom_words_placeholder: '您的服務名稱，公司名稱等。',
};

export default Object.freeze(password_policy);
