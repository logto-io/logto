const password = {
  unsupported_encryption_method: '{{name}} 암호화 방법을 지원하지 않아요.',
  pepper_not_found: '비밀번호 Pepper를 찾을 수 없어요. Core 환경설정을 확인해 주세요.',
  rejected: '비밀번호가 거부되었습니다. 비밀번호가 요구 사항을 충족하는지 확인해 주세요.',
  invalid_legacy_password_format: '잘못된 레거시 비밀번호 형식입니다.',
  unsupported_legacy_hash_algorithm: '지원되지 않는 레거시 해시 알고리즘: {{algorithm}}.',
};

export default Object.freeze(password);
