const password_policy = {
  password_requirements: '암호 요구 사항',
  minimum_length: '최소 길이',
  /** UNTRANSLATED */
  minimum_length_description: 'NIST suggests using <a>at least 8 characters</a> for web products.',
  minimum_length_error: '최소 길이는 {{min}}에서 {{max}}(포함) 사이여야 합니다.',
  minimum_required_char_types: '최소 필요 문자 유형',
  /** UNTRANSLATED */
  minimum_required_char_types_description:
    'Character types: uppercase (A-Z), lowercase (a-z), numbers (0-9), and special symbols ({{symbols}}).',
  password_rejection: '암호 거부',
  compromised_passwords: '의심되는 암호 거부',
  breached_passwords: '위반된 암호',
  breached_passwords_description: '이전에 위반 데이터베이스에서 발견된 암호를 거부합니다.',
  restricted_phrases: '저보안 구구절 제한',
  restricted_phrases_tooltip:
    '사용자는 아래 목록에 정확히 같거나 해당 구구절로 구성된 암호를 사용할 수 없습니다. 비 연속적인 문자 3개 이상의 추가는 암호 복잡성을 높이기 위해 허용됩니다.',
  repetitive_or_sequential_characters: '반복 또는 순차 문자',
  repetitive_or_sequential_characters_description: '예: "AAAA", "1234" 및 "abcd".',
  user_information: '사용자 정보',
  user_information_description: '예: 이메일 주소, 전화 번호, 사용자 이름 등.',
  custom_words: '사용자 지정 단어',
  custom_words_description:
    '맞춤형 컨텍스트별 단어, 대소 문자를 구분하지 않으며 한 줄에 하나씩 작성합니다.',
  custom_words_placeholder: '서비스 이름, 회사 이름 등.',
};

export default Object.freeze(password_policy);
