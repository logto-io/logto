const password_policy = {
  password_requirements: '비밀번호 요구사항',
  minimum_length: '최소 길이',
  minimum_length_description: 'NIST는 <a>최소 8자리</a>를 권장합니다.',
  minimum_length_error: '최소 길이는 {{min}} ~ {{max}}(포함) 사이여야 합니다.',
  minimum_required_char_types: '최소 필요 문자 유형',
  minimum_required_char_types_description:
    '문자 유형: 대문자(A-Z), 소문자(a-z), 숫자(0-9), 특수 기호({{symbols}}).',
  password_rejection: '비밀번호 거부',
  compromised_passwords: '위험한 비밀번호',
  breached_passwords: '유출된 비밀번호',
  breached_passwords_description: '이전에 유출된 비밀번호를 거부합니다.',
  restricted_phrases: '보안속에 좋지 않은 구구절',
  restricted_phrases_tooltip:
    '3글자 이상의 다른 글자와 함께 조합하지 않는 한 이러한 구문을 피하세요.',
  repetitive_or_sequential_characters: '반복된 혹은 순차적인 문자',
  repetitive_or_sequential_characters_description: '예: "AAAA", "1234", "abcd" 등.',
  user_information: '사용자 정보',
  user_information_description: '예: 이메일 주소, 전화 번호, 사용자 이름 등.',
  custom_words: '사용자 정의 단어',
  custom_words_description:
    '컨텍스트에 따라 맞춤형 단어입니다. 대소문자를 구분하지 않으며, 한 줄에 하나씩 작성하세요.',
  custom_words_placeholder: '서비스 이름, 회사 이름 등.',
};

export default Object.freeze(password_policy);
