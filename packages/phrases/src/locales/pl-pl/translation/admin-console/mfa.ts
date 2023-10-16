const mfa = {
  title: 'Wieloczynnikowa autoryzacja',
  description:
    'Dodaj wieloczynnikową autoryzację, aby podnieść bezpieczeństwo swojego doświadczenia z logowaniem.',
  factors: 'Czynniki',
  multi_factors: 'Wieloczynniki',
  multi_factors_description:
    'Użytkownicy muszą zweryfikować jeden z włączonych czynników podczas autoryzacji dwuetapowej.',
  totp: 'OTP z aplikacji Authenticator',
  otp_description: 'Połącz Google Authenticator itp., aby zweryfikować jednorazowe hasła.',
  webauthn: 'WebAuthn',
  webauthn_description:
    'WebAuthn używa klucza przechodzenia do weryfikacji urządzenia użytkownika, w tym YubiKey.',
  backup_code: 'Kod zapasowy',
  backup_code_description:
    'Generuj 10 unikalnych kodów, z których każdy można użyć do jednej autoryzacji.',
  backup_code_setup_hint:
    'Czynnik autoryzacji zapasowej, który nie może być włączony samodzielnie:',
  backup_code_error_hint:
    'Aby używać kodu zapasowego do autoryzacji wieloczynnikowej, inne czynniki muszą być włączone, aby zapewnić udane logowanie użytkowników.',
  policy: 'Polityka',
  two_step_sign_in_policy: 'Polityka autoryzacji dwuetapowej podczas logowania',
  user_controlled: 'Użytkownicy mają możliwość samodzielnego włączenia MFA.',
  mandatory: 'Obowiązkowe MFA dla wszystkich użytkowników przy każdym logowaniu.',
  unlock_reminder:
    'Odblokuj autoryzację wieloczynnikową, aby zwiększyć bezpieczeństwo, przechodząc na płatny plan. Nie wahaj się <a>skontaktować z nami</a>, jeśli potrzebujesz pomocy.',
  view_plans: 'Zobacz plany',
};

export default Object.freeze(mfa);
