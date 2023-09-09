const password_policy = {
  password_requirements: 'パスワードの要件',
  minimum_length: '最小の長さ',
  /** UNTRANSLATED */
  minimum_length_description: 'NIST suggests using <a>at least 8 characters</a> for web products.',
  minimum_length_error: '最小の長さは {{min}} から {{max}}（両方含む）の間でなければなりません。',
  minimum_required_char_types: '必要な文字の種類の最小数',
  /** UNTRANSLATED */
  minimum_required_char_types_description:
    'Character types: uppercase (A-Z), lowercase (a-z), numbers (0-9), and special symbols ({{symbols}}).',
  password_rejection: 'パスワードの拒否',
  compromised_passwords: '危険なパスワードの拒否',
  breached_passwords: '漏洩したパスワードの拒否',
  breached_passwords_description: '以前に流出したデータベースで見つかったパスワードを拒否します。',
  restricted_phrases: '低セキュリティフレーズの制限',
  restricted_phrases_tooltip:
    '以下にリストされたフレーズと完全に一致するパスワードや、そのフレーズを構成する文字のみで構成されたパスワードは使用できません。パスワードの複雑さを高めるために、非連続の3文字以上の追加も許可されています。',
  repetitive_or_sequential_characters: '繰り返しまたは連続する文字',
  repetitive_or_sequential_characters_description: '「AAAA」、「1234」、「abcd」などです。',
  user_information: 'ユーザー情報',
  user_information_description: '例：メールアドレス、電話番号、ユーザー名など。',
  custom_words: 'カスタムワード',
  custom_words_description:
    'コンテキストに特化したワードを、大文字小文字を区別せずに、1つの行に1つずつ追加します。',
  custom_words_placeholder: 'サービス名、会社名など',
};

export default Object.freeze(password_policy);
