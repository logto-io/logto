const password_policy = {
  password_requirements: '密碼要求',
  minimum_length: '最小長度',
  minimum_length_description: 'NIST 建議在 Web 產品中使用至少 8 個字符。',
  minimum_length_error: '最小長度必須介於{{min}}和{{max}}之間（包括{{min}}和{{max}}）。',
  minimum_required_char_types: '最小所需字符類型',
  minimum_required_char_types_description:
    '字符類型：大寫字母（A-Z）、小寫字母（a-z）、數字（0-9）和特殊符號（{{symbols}}）。',
  password_rejection: '密碼拒絕設置',
  compromised_passwords: '拒絕被破解的密碼',
  breached_passwords: '洩露的密碼',
  breached_passwords_description: '拒絕之前在洩露數據庫中出現的密碼。',
  restricted_phrases: '限制低安全性短語',
  restricted_phrases_tooltip: '密碼應該避免使用這些短語，除非結合至少 3 個或更多的額外字符。',
  repetitive_or_sequential_characters: '重複或連續字符',
  repetitive_or_sequential_characters_description: '例如："AAAA"、"1234"和"abcd"。',
  user_information: '用戶信息',
  user_information_description: '例如：郵件地址、電話號碼、用戶名等等。',
  custom_words: '自定義詞彙',
  custom_words_description: '個性化上下文特定的詞彙，不區分大小寫，每行一個詞。',
  custom_words_placeholder: '您的服務名稱、公司名稱等等。',
};

export default Object.freeze(password_policy);
