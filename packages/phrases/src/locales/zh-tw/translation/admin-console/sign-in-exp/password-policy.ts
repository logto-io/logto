const password_policy = {
  password_requirements: '密碼需求',
  minimum_length: '最小長度',
  minimum_length_description:
    '美國國家標準與技術研究所 (NIST) 建議網路產品需至少使用 <a>8 個字元</a>。',
  minimum_length_error: '最小長度必須介於 {{min}} 到 {{max}}（包括）之間。',
  minimum_required_char_types: '最低需要的字元類型',
  minimum_required_char_types_description:
    '字元類型：大寫字母（A-Z）、小寫字母（a-z）、數字（0-9）和特殊符號（{{symbols}}）。',
  password_rejection: '拒絕密碼',
  compromised_passwords: '拒絕已破解的密碼',
  breached_passwords: '遭破解的密碼',
  breached_passwords_description: '拒絕之前在密碼洩漏資料庫中找到的密碼。',
  restricted_phrases: '限制低安全性片語',
  restricted_phrases_tooltip: '除非您結合 3 個或更多的額外字元，否則密碼應避免使用這些片語。',
  repetitive_or_sequential_characters: '重複或連續字元',
  repetitive_or_sequential_characters_description: '例如：“AAAA”，“1234”，和“abcd”。',
  user_information: '用戶資訊',
  user_information_description: '例如，電子郵件地址，電話號碼，用戶名等。',
  custom_words: '自訂字詞',
  custom_words_description: '個性化上下文相關的字詞，不區分大小寫，每行一個。',
  custom_words_placeholder: '您的服務名稱，公司名稱等。',
};

export default Object.freeze(password_policy);
