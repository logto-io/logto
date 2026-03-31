const mfa = {
  totp: 'Jednorázový kód z autentizační aplikace',
  webauthn: 'Ověřovací klíč',
  backup_code: 'Záložní kód',
  email_verification_code: 'Ověřovací kód z e-mailu',
  phone_verification_code: 'Ověřovací kód z SMS',
  link_totp_description: 'Např. Google Authenticator a další',
  link_webauthn_description: 'Propoj své zařízení nebo USB klíč',
  link_backup_code_description: 'Vygeneruj záložní kód',
  link_email_verification_code_description: 'Propoj svůj e-mail',
  link_email_2fa_description: 'Propoj svůj e-mail pro dvoufázové ověření',
  link_phone_verification_code_description: 'Propoj své telefonní číslo',
  link_phone_2fa_description: 'Propoj své telefonní číslo pro dvoufázové ověření',
  verify_totp_description: 'Zadej jednorázový kód v aplikaci',
  verify_webauthn_description: 'Ověř své zařízení nebo USB klíč',
  verify_backup_code_description: 'Vlož záložní kód, který jsi uložil/a',
  verify_email_verification_code_description: 'Zadej kód, který ti přišel na e-mail',
  verify_phone_verification_code_description: 'Zadej kód, který ti přišel na telefon',
  send_to_email: 'Poslat na {{identifier}}',
  send_to_phone: 'Poslat na {{identifier}}',
  onboarding: 'Zapnout dvoufázové ověření',
  onboarding_description:
    'Chraň svůj účet pomocí dvoufázového ověření. Vyber jednu nebo více metod: Přístupový klíč, autentizační aplikace (OTP), ověřovací kód SMS nebo záložní kódy.',
  enable_mfa: 'Zapnout dvoufázové ověření',
  add_mfa_factors: 'Přidat dvoufázové ověření',
  add_mfa_description:
    'Dvoufázové ověření je zapnuté. Vyber svou druhou metodu ověření pro bezpečné přihlášení.',
  add_another_mfa_factor: 'Přidat další dvoufázové ověření',
  add_another_mfa_description: 'Vyber jiný způsob ověření identity při přihlášení.',
  verify_mfa_factors: 'Dvoufázové ověření',
  verify_mfa_description:
    'Dvoufázové ověření je pro tento účet zapnuté. Prosím, vyber druhý způsob ověření své identity.',
  add_authenticator_app: 'Přidat autentizační aplikaci',
  replace_authenticator_app: 'Nahradit autentizační aplikaci',
  step: 'Krok {{step, number}}: {{content}}',
  scan_qr_code: 'Naskenuj tento QR kód',
  scan_qr_code_description:
    'Naskenuj následující QR kód ve své autentizační aplikaci, např. Google Authenticator, Duo Mobile, Authy a další.',
  qr_code_not_available: 'Nemůžeš naskenovat QR kód?',
  copy_and_paste_key: 'Zkopíruj a vlož klíč',
  copy_and_paste_key_description:
    'Zkopíruj a vlož následující klíč do své autentizační aplikace, např. Google Authenticator, Duo Mobile, Authy a další.',
  want_to_scan_qr_code: 'Chceš naskenovat QR kód?',
  enter_one_time_code: 'Zadej jednorázový kód',
  enter_one_time_code_link_description:
    'Zadej 6místný ověřovací kód vygenerovaný autentizační aplikací.',
  enter_one_time_code_description:
    'Dvoufázové ověření je pro tento účet zapnuté. Zadej jednorázový kód z propojené autentizační aplikace.',
  enter_email_verification_code: 'Zadej ověřovací kód z e-mailu',
  enter_email_verification_code_description:
    'Dvoufázové ověření je pro tento účet zapnuté. Zadej ověřovací kód z e-mailu, který byl odeslán na {{identifier}}.',
  enter_phone_verification_code: 'Zadej ověřovací kód z SMS',
  enter_phone_verification_code_description:
    'Dvoufázové ověření je pro tento účet zapnuté. Zadej ověřovací kód z SMS, který byl odeslán na {{identifier}}.',
  link_another_mfa_factor: 'Přepnout na jinou metodu',
  save_backup_code: 'Ulož svůj záložní kód',
  save_backup_code_description:
    'Můžeš použít jeden z těchto záložních kódů pro přístup ke svému účtu, pokud máš problémy s dvoufázovým ověřením. Každý kód lze použít pouze jednou.',
  backup_code_hint: 'Nezapomeň je zkopírovat a uložit na bezpečné místo.',
  new_backup_codes_generated:
    'Nové záložní kódy nahradily tvé staré kódy. Ulož je na bezpečné místo co nejdříve.',
  enter_a_backup_code: 'Zadej záložní kód',
  enter_backup_code_description:
    'Zadej záložní kód, který jsi uložil/a při prvním zapnutí dvoufázového ověření.',
  create_a_passkey: 'Vytvořit přístupový klíč',
  create_passkey_description:
    'Zaregistruj svůj přístupový klíč pomocí biometrie zařízení, bezpečnostních klíčů (např. YubiKey) nebo jiných dostupných metod.',
  try_another_verification_method: 'Zkusit jinou metodu ověření',
  verify_via_passkey: 'Ověřit pomocí přístupového klíče',
  verify_via_passkey_description:
    'Ověř se pomocí přístupového klíče zadáním hesla zařízení, biometrie, naskenováním QR kódu nebo použitím bezpečnostního USB klíče, např. YubiKey.',
  secret_key_copied: 'Tajný klíč zkopírován.',
  backup_code_copied: 'Záložní kód zkopírován.',
  webauthn_not_ready: 'WebAuthn ještě není připraven. Zkus to prosím později.',
  webauthn_not_supported: 'WebAuthn není v tomto prohlížeči podporován.',
  webauthn_failed_to_create: 'Nepodařilo se vytvořit. Zkus to prosím znovu.',
  webauthn_failed_to_verify: 'Nepodařilo se ověřit. Zkus to prosím znovu.',
};

export default Object.freeze(mfa);
