const password = {
  unsupported_encryption_method: '{{name}} şifreleme metodu desteklenmiyor.',
  pepper_not_found: 'Şifre pepperı bulunamadı. Lütfen core envs.i kontrol edin.',
  rejected: 'Şifre reddedildi. Lütfen şifrenizin gereksinimleri karşıladığından emin olun.',
  invalid_legacy_password_format: 'Geçersiz eski şifre formatı.',
  unsupported_legacy_hash_algorithm: 'Desteklenmeyen eski hash algoritması: {{algorithm}}.',
};

export default Object.freeze(password);
