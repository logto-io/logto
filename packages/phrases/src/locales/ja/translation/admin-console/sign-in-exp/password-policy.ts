const password_policy = {
  password_requirements: 'パスワードの要件',
  minimum_length: '最小の長さ',
  minimum_length_description:
    'NISTは、Web製品に対して少なくとも8文字を使用することを提案しています。',
  minimum_length_error: '最小の長さは {{min}} から {{max}}（両方含む）の間でなければなりません。',
  minimum_required_char_types: '必要な文字の種類の最小数',
  minimum_required_char_types_description:
    '文字の種類：大文字（A-Z）、小文字（a-z）、数字（0-9）、特殊記号（{{symbols}}）。',
  password_rejection: 'パスワードの拒否',
  compromised_passwords: '危険なパスワードの拒否',
  breached_passwords: '漏洩したパスワードの拒否',
  breached_passwords_description: '以前に漏洩したデータベースで見つかったパスワードを拒否します。',
  restricted_phrases: '低セキュリティフレーズの制限',
  restricted_phrases_tooltip:
    'パスワードにこれらのフレーズを使用しないでください。ただし、追加の文字を3文字以上組み合わせる場合は例外です。',
  repetitive_or_sequential_characters: '繰り返しまたは連続する文字',
  repetitive_or_sequential_characters_description: '「AAAA」、「1234」、「abcd」などです。',
  user_information: 'ユーザー情報',
  user_information_description: '例: メールアドレス、電話番号、ユーザー名など。',
  custom_words: 'カスタムワード',
  custom_words_description:
    '特定の文脈に関連するワードを、大文字小文字を区別せずに、1つの行に1つずつ追加します。',
  custom_words_placeholder: 'サービス名、会社名など',
};

export default Object.freeze(password_policy);
