const auth = {
  authorization_header_missing: 'Brak nagłówka autoryzacji',
  authorization_token_type_not_supported: 'Nieobsługiwany typ autoryzacji',
  unauthorized: 'Brak autoryzacji. Sprawdź swoje dane logowania i ich zakres.',
  forbidden: 'Brak dostępu. Sprawdź swoje role użytkownika oraz uprawnienia.',
  expected_role_not_found:
    'Nie znaleziono oczekiwanej roli. Sprawdź swoje role użytkownika oraz uprawnienia.',
  jwt_sub_missing: 'Brak `sub` w JWT.',
  require_re_authentication: 'Wymagane ponowne uwierzytelnienie, aby wykonać chronione działanie.',
};

export default auth;
