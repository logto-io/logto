const password_policy = {
  password_requirements: '密码要求',
  minimum_length: '最小长度',
  /** UNTRANSLATED */
  minimum_length_description: 'NIST suggests using <a>at least 8 characters</a> for web products.',
  minimum_length_error: '最小长度必须在{{min}}和{{max}}之间（包括{{min}}和{{max}}）。',
  minimum_required_char_types: '最小要求字符类型',
  /** UNTRANSLATED */
  minimum_required_char_types_description:
    'Character types: uppercase (A-Z), lowercase (a-z), numbers (0-9), and special symbols ({{symbols}}).',
  password_rejection: '密码拒绝',
  compromised_passwords: '拒绝已泄露的密码',
  breached_passwords: '泄露的密码',
  breached_passwords_description: '拒绝之前在泄露数据库中发现的密码。',
  restricted_phrases: '限制低安全性短语',
  restricted_phrases_tooltip:
    '用户不能使用与下方列表中的短语完全相同或由其组成的密码。可以添加3个或更多个非连续字符以增加密码复杂性。',
  repetitive_or_sequential_characters: '重复或连续字符',
  repetitive_or_sequential_characters_description: '例如，“AAAA”、“1234”和“abcd”。',
  user_information: '用户信息',
  user_information_description: '例如，电子邮件地址，电话号码，用户名等。',
  custom_words: '自定义词汇',
  custom_words_description: '个性化上下文相关的词汇，不区分大小写，每行一个。',
  custom_words_placeholder: '您的服务名称，公司名称等。',
};

export default Object.freeze(password_policy);
