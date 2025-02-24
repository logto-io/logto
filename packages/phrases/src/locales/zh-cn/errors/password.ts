const password = {
  unsupported_encryption_method: '不支持的加密方法 {{name}}',
  pepper_not_found: '密码 pepper 未找到。请检查 core 的环境变量。',
  rejected: '密码被拒绝。请检查密码是否符合要求。',
  invalid_legacy_password_format: '无效的旧密码格式。',
  unsupported_legacy_hash_algorithm: '不支持的旧哈希算法：{{algorithm}}。',
};

export default Object.freeze(password);
