const mfa = {
  totp: "OTP de l'application d'authentification",
  webauthn: "Clé d'accès",
  backup_code: 'Code de sauvegarde',
  link_totp_description: 'Lier Google Authenticator, etc.',
  link_webauthn_description: 'Lier votre appareil ou matériel USB',
  link_backup_code_description: 'Générer un code de sauvegarde',
  verify_totp_description: "Saisissez le code à usage unique dans l'application",
  verify_webauthn_description: 'Vérifiez votre appareil ou matériel USB',
  verify_backup_code_description: 'Collez le code de sauvegarde que vous avez enregistré',
  add_mfa_factors: "Ajouter l'authentification à deux facteurs",
  add_mfa_description:
    "L'authentification à deux facteurs est activée. Sélectionnez votre deuxième méthode de vérification pour vous connecter en toute sécurité à votre compte.",
  verify_mfa_factors: 'Authentification à deux facteurs',
  verify_mfa_description:
    "L'authentification à deux facteurs a été activée pour ce compte. Veuillez sélectionner la deuxième méthode pour vérifier votre identité.",
  add_authenticator_app: "Ajouter une application d'authentification",
  step: 'Étape {{step, number}} : {{content}}',
  scan_qr_code: 'Scannez ce code QR',
  scan_qr_code_description:
    "Scannez ce code QR à l'aide de votre application d'authentification, telle que Google Authenticator, Duo Mobile, Authy, etc.",
  qr_code_not_available: 'Impossible de scanner le code QR ?',
  copy_and_paste_key: 'Copiez et collez la clé',
  copy_and_paste_key_description:
    "Collez la clé ci-dessous dans votre application d'authentification, telle que Google Authenticator, Duo Mobile, Authy, etc.",
  want_to_scan_qr_code: 'Vous voulez scanner le code QR ?',
  enter_one_time_code: 'Saisissez le code à usage unique',
  enter_one_time_code_link_description:
    "Saisissez le code de vérification à 6 chiffres généré par l'application d'authentification.",
  enter_one_time_code_description:
    "L'authentification à deux facteurs a été activée pour ce compte. Veuillez saisir le code à usage unique affiché dans votre application d'authentification liée.",
  link_another_mfa_factor: "Lier un autre facteur d'authentification à deux facteurs",
  save_backup_code: 'Enregistrez votre code de sauvegarde',
  save_backup_code_description:
    "Vous pouvez utiliser l'un de ces codes de sauvegarde pour accéder à votre compte en cas de problème lors de l'authentification à deux facteurs par d'autres moyens. Chaque code ne peut être utilisé qu'une fois.",
  backup_code_hint: 'Assurez-vous de les copier et de les enregistrer dans un endroit sûr.',
  enter_backup_code_description:
    "Saisissez le code de sauvegarde que vous avez enregistré lors de l'activation initiale de l'authentification à deux facteurs.",
  create_a_passkey: "Créez une clé d'accès",
  create_passkey_description:
    "Enregistrez une clé d'accès pour vérifier votre mot de passe de l'appareil ou la biométrie, numérisez le code QR ou utilisez une clé de sécurité USB telle que YubiKey.",
  name_your_passkey: "Nommez votre clé d'accès",
  name_passkey_description:
    "Vous avez vérifié avec succès cet appareil pour l'authentification à deux facteurs. Personnalisez le nom pour le reconnaître si vous avez plusieurs clés.",
  try_another_verification_method: 'Essayez une autre méthode de vérification',
  verify_via_passkey: "Vérifiez via la clé d'accès",
  verify_via_passkey_description:
    "Utilisez la clé d'accès pour vérifier votre mot de passe de l'appareil ou la biométrie, numérisez le code QR ou utilisez une clé de sécurité USB telle que YubiKey.",
  secret_key_copied: 'Clé secrète copiée.',
  backup_code_copied: 'Code de sauvegarde copié.',
};

export default Object.freeze(mfa);
