const mfa = {
  totp: 'Autentiseringsapp OTP',
  webauthn: 'Passkey',
  backup_code: 'Reservkod',
  link_totp_description: 'T.ex Google Authenticator eller liknande',
  link_webauthn_description: 'Länka din enhet eller en extern USB-enhet',
  link_backup_code_description: 'Generera en reservkod',
  verify_totp_description: 'Skriv engångskoden från appen',
  verify_webauthn_description: 'Verifiera din enhet eller en extern USB-enhet',
  verify_backup_code_description: 'Klistra in reservkoden du sparade',
  add_mfa_factors: 'Lägg till tvåstegsverifiering',
  add_mfa_description: 'Tvåstegsverifiering är aktiverat. Välj metod för säker inloggning.',
  verify_mfa_factors: 'Tvåstegsverifiering',
  verify_mfa_description: 'Tvåstegsverifiering är aktiverat för det här kontot. Välj metod för att verifiera din identitet.',
  add_authenticator_app: 'Lägg till autentiseringsapp',
  step: 'Steg {{step, number}}: {{content}}',
  scan_qr_code: 'Scanna QR-koden',
  scan_qr_code_description:
    'Scanna QR-koden med din autentiseringsapp, t.ex Google Authenticator, Duo Mobile, Authy eller liknande.',
  qr_code_not_available: 'Går koden inte att scanna?',
  copy_and_paste_key: 'Kopiera och klistra in nyckeln',
  copy_and_paste_key_description:
    'Kopiera och klistra in följande nyckel i din autentiseringsapp, t.ex Google Authenticator, Duo Mobile, Authy eller liknande.',
  want_to_scan_qr_code: 'Vill du scanna QR-koden?',
  enter_one_time_code: 'Skriv in engångskoden',
  enter_one_time_code_link_description:
    'Skriv in den sexsiffriga koden från din autentiseringsapp',
  enter_one_time_code_description:
    'tvåstegsverifiering är aktiverat för det här kontot. Skriv in engångskoden från din autentiseringsapp.',
  link_another_mfa_factor: 'Välj en annan metod',
  save_backup_code: 'Spara din reservkod',
  save_backup_code_description:
    'Du kan använda en av dessa reservkoder för att komma åt ditt konto om du har problem med tvåstegsverifieringen. Varje kod går bara att använda en gång.',
  backup_code_hint: 'Kom ihåg att kopiera och spara dem på ett säkert ställe.',
  enter_a_backup_code: 'Ange en reservkod',
  enter_backup_code_description:
    'Skriv in reservkoden du sparade när tvåstegsverifiering aktiverades.',
  create_a_passkey: 'Skapa en passkey',
  create_passkey_description:
    'Registrera din passkey med biometri, säkerhetsnycklar (t.ex YubiKey), eller andra tillgängliga metoder.',
  try_another_verification_method: 'Använd en annan metod för att verifiera',
  verify_via_passkey: 'Verifiera med passkey',
  verify_via_passkey_description:
    'Använd passkey för verifiering med enhetslösenord eller biometri, scanna en QR-kod eller använd en USB-säkerhetsnykcel (T.ex YubiKey).',
  secret_key_copied: 'Hemlig nyckel kopierad.',
  backup_code_copied: 'Reservkod kopierad.',
  webauthn_not_ready: 'WebAuthn är inte färdigt än. Försök igen senare.',
  webauthn_not_supported: 'WebAuthn stöds inte av din webbläsare.',
  webauthn_failed_to_create: 'Kunde ej skapa. Försök igen senare.',
  webauthn_failed_to_verify: 'Kunde inte verifiera. Försök igen senare.',
};

export default Object.freeze(mfa);
