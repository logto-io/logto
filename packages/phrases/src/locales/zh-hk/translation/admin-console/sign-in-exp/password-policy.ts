const password_policy = {
  password_requirements: '密碼要求',
  minimum_length: '最小長度',
  /** UNTRANSLATED */
  minimum_length_description: 'NIST suggests using <a>at least 8 characters</a> for web products.',
  minimum_length_error: '最小長度必須介於{{min}}和{{max}}之間（包括{{min}}和{{max}}）。',
  minimum_required_char_types: '最小所需字符類型',
  /** UNTRANSLATED */
  minimum_required_char_types_description:
    'Character types: uppercase (A-Z), lowercase (a-z), numbers (0-9), and special symbols ({{symbols}}).',
  password_rejection: '密碼拒絕設置',
  compromised_passwords: '拒絕被破解的密碼',
  breached_passwords: '洩露的密碼',
  breached_passwords_description: '拒絕之前在洩露數據庫中出現的密碼。',
  restricted_phrases: '限制低安全性短語',
  restricted_phrases_tooltip:
    '用戶不能使用與下面列出的短語完全相同或由它們組成的密碼。為了增加密碼的複雜性，可以添加3個或更多個非連續字符。',
  repetitive_or_sequential_characters: '重複或連續字符',
  repetitive_or_sequential_characters_description: '例如："AAAA"、"1234"和"abcd"。',
  user_information: '用戶信息',
  user_information_description: '例如：郵件地址、電話號碼、用戶名等等。',
  custom_words: '自定義詞彙',
  custom_words_description: '個性化上下文特定的詞彙，不區分大小寫，每行一個詞。',
  custom_words_placeholder: '您的服務名稱、公司名稱等等。',
};

export default Object.freeze(password_policy);
