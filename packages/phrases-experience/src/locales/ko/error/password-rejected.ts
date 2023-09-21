const password_rejected = {
  too_short: '최소 길이는 {{min}}입니다.',
  too_long: '최대 길이는 {{max}}입니다.',
  character_types: '최소 {{min}}개의 문자 유형이 필요합니다.',
  unsupported_characters: '지원되지 않는 문자가 발견되었습니다.',
  pwned: '추측하기 쉬운 간단한 암호 사용을 피하십시오.',
  restricted_found: '{{list, list}}을(를) 과도하게 사용하지 마십시오.',
  restricted: {
    repetition: '반복된 문자',
    sequence: '연속된 문자',
    user_info: '개인 정보',
    words: '품질 가능성',
  },
};

export default Object.freeze(password_rejected);
