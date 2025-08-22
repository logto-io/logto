const sign_in_experiences = {
  empty_content_url_of_terms_of_use:
    'Pusty adres URL zawartości "Regulaminu". Proszę dodać adres URL zawartości, jeśli funkcja "Regulamin" jest włączona.',
  empty_social_connectors:
    'Brak skojarzonych kont społecznościowych. Proszę dodać skojarzone konta społecznościowe, gdy metoda logowania za pomocą sieci społecznościowej jest włączona.',
  enabled_connector_not_found: 'Nie znaleziono aktywowanego łącznika typu {{type}}.',
  not_one_and_only_one_primary_sign_in_method:
    'Musi istnieć jedna i tylko jedna podstawowa metoda logowania. Proszę sprawdzić swoje dane wejściowe.',
  username_requires_password:
    'Należy włączyć ustawienie hasła dla identyfikatora rejestracji nazwy użytkownika.',
  passwordless_requires_verify:
    'Należy włączyć weryfikację dla identyfikatora rejestracji adresu e-mail/telefonu.',
  miss_sign_up_identifier_in_sign_in: 'Metody logowania muszą zawierać identyfikator rejestracji.',
  password_sign_in_must_be_enabled:
    'Logowanie za pomocą hasła musi być włączone, gdy w rejestracji wymagane jest ustawienie hasła.',
  code_sign_in_must_be_enabled:
    'Logowanie za pomocą kodu weryfikacyjnego musi być włączone, gdy w rejestracji nie jest wymagane ustawienie hasła.',
  unsupported_default_language: 'Ten język - {{language}} nie jest obecnie obsługiwany.',
  at_least_one_authentication_factor: 'Musisz wybrać co najmniej jeden czynnik uwierzytelniający.',
  backup_code_cannot_be_enabled_alone: 'Kod zapasowy nie może być włączony samodzielnie.',
  duplicated_mfa_factors: 'Powielone czynniki MFA.',
  email_verification_code_cannot_be_used_for_mfa:
    'Kod weryfikacyjny e-mail nie może być używany do MFA, gdy weryfikacja e-mail jest włączona podczas logowania.',
  phone_verification_code_cannot_be_used_for_mfa:
    'Kod weryfikacyjny SMS nie może być używany do MFA, gdy weryfikacja SMS jest włączona podczas logowania.',
  email_verification_code_cannot_be_used_for_sign_in:
    'Kod weryfikacyjny e-mail nie może być używany do logowania, gdy jest włączony dla MFA.',
  phone_verification_code_cannot_be_used_for_sign_in:
    'Kod weryfikacyjny SMS nie może być używany do logowania, gdy jest włączony dla MFA.',
  duplicated_sign_up_identifiers: 'Wykryto zduplikowane identyfikatory rejestracji.',
  missing_sign_up_identifiers: 'Podstawowy identyfikator rejestracji nie może być pusty.',
  invalid_custom_email_blocklist_format:
    'Nieprawidłowe elementy niestandardowej listy blokowanych adresów e-mail: {{items, list(type:conjunction)}}. Każdy element musi być prawidłowym adresem e-mail lub domeną, np. foo@example.com lub @example.com.',
  forgot_password_method_requires_connector:
    'Metoda "Zapomniałem hasła" wymaga skonfigurowania odpowiedniego łącznika {{method}}.',
};

export default Object.freeze(sign_in_experiences);
