const password_rejected = {
  too_short: '最小の長さは{{min}}です。',
  too_long: '最大の長さは{{max}}です。',
  character_types: '少なくとも{{min}}種類の文字が必要です。',
  unsupported_characters: 'サポートされていない文字が見つかりました。',
  pwned: '簡単に推測できる簡単なパスワードの使用を避けてください。',
  restricted_found: '{{list, list}}の過度な使用を避けてください。',
  restricted: {
    repetition: '繰り返された文字',
    sequence: '連続する文字',
    user_info: '個人情報',
    words: '製品のコンテキスト',
  },
};

export default Object.freeze(password_rejected);
