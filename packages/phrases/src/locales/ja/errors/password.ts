const password = {
  unsupported_encryption_method: '暗号化方式 {{name}} はサポートされていません。',
  pepper_not_found: 'パスワードペッパーが見つかりません。コアの環境を確認してください。',
  rejected: 'パスワードが拒否されました。パスワードが要件を満たしているか確認してください。',
  invalid_legacy_password_format: '無効なレガシーパスワード形式です。',
  unsupported_legacy_hash_algorithm: '未対応のレガシーハッシュアルゴリズム：{{algorithm}}。',
};

export default Object.freeze(password);
