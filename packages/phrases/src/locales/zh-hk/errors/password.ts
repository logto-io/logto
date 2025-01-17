const password = {
  unsupported_encryption_method: '不支持的加密方法 {{name}}',
  pepper_not_found: '密碼 pepper 未找到。請檢查 core 的環境變量。',
  rejected: '密碼被拒絕。請檢查您的密碼是否符合要求。',
  invalid_legacy_password_format: '無效的舊密碼格式。',
  unsupported_legacy_hash_algorithm: '不支援的舊雜湊演算法：{{algorithm}}。',
};

export default Object.freeze(password);
