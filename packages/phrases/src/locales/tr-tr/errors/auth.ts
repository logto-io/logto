const auth = {
  authorization_header_missing: 'Yetkilendirme başlığı eksik.',
  authorization_token_type_not_supported: 'Yetkilendirme tipi desteklenmiyor.',
  unauthorized: 'Yetki yok. Lütfen kimlik bilgilerini ve kapsamını kontrol edin.',
  forbidden: 'Yasak. Lütfen kullanıcı rollerinizi ve izinlerinizi kontrol edin.',
  expected_role_not_found: 'Expected role not found. Please check your user roles and permissions.',
  jwt_sub_missing: 'JWTde `sub` eksik.',
  require_re_authentication:
    'Korumalı bir işlem gerçekleştirmek için yeniden doğrulama gereklidir.',
};

export default auth;
