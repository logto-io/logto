const mfa = {
  totp: "OTP de l'application d'authentification",
  webauthn: 'Passkey',
  backup_code: 'Code de sauvegarde',
  email_verification_code: 'Code de vérification par e-mail',
  phone_verification_code: 'Code de vérification par SMS',
  link_totp_description: 'Par exemple, Google Authenticator, etc.',
  link_webauthn_description: 'Associez votre appareil ou matériel USB',
  link_backup_code_description: 'Générez un code de sauvegarde',
  link_email_verification_code_description: 'Associez votre adresse e-mail',
  link_email_2fa_description: 'Associez votre adresse e-mail pour la vérification en 2 étapes',
  link_phone_verification_code_description: 'Associez votre numéro de téléphone',
  link_phone_2fa_description: 'Associez votre numéro de téléphone pour la vérification en 2 étapes',
  verify_totp_description: "Saisissez le code à usage unique dans l'application",
  verify_webauthn_description: 'Vérifiez votre appareil ou matériel USB',
  verify_backup_code_description: 'Collez le code de sauvegarde que vous avez enregistré',
  verify_email_verification_code_description: 'Saisissez le code envoyé à votre e-mail',
  verify_phone_verification_code_description: 'Saisissez le code envoyé à votre téléphone',
  add_mfa_factors: 'Ajouter la vérification en deux étapes',
  add_mfa_description:
    'La vérification en deux étapes est activée. Sélectionnez votre deuxième méthode de vérification pour une connexion sécurisée.',
  verify_mfa_factors: 'Vérification en deux étapes',
  verify_mfa_description:
    'La vérification en deux étapes a été activée pour ce compte. Veuillez sélectionner la deuxième façon de vérifier votre identité.',
  add_authenticator_app: "Ajouter une application d'authentification",
  step: 'Étape {{step, number}} : {{content}}',
  scan_qr_code: 'Scannez ce code QR',
  scan_qr_code_description:
    "Scannez le code QR suivant avec votre application d'authentification, telle que Google Authenticator, Duo Mobile, Authy, etc.",
  qr_code_not_available: 'Impossible de scanner le code QR ?',
  copy_and_paste_key: 'Copiez et collez la clé',
  copy_and_paste_key_description:
    "Copiez et collez la clé suivante dans votre application d'authentification, telle que Google Authenticator, Duo Mobile, Authy, etc.",
  want_to_scan_qr_code: 'Vous voulez scanner le code QR ?',
  enter_one_time_code: 'Saisissez le code à usage unique',
  enter_one_time_code_link_description:
    "Saisissez le code de vérification à 6 chiffres généré par l'application d'authentification.",
  enter_one_time_code_description:
    "La vérification en deux étapes a été activée pour ce compte. Veuillez entrer le code à usage unique affiché sur votre application d'authentification liée.",
  enter_email_verification_code: 'Saisir le code de vérification par e‑mail',
  enter_email_verification_code_description:
    'L’authentification à deux étapes est activée pour ce compte. Veuillez saisir le code de vérification envoyé à {{identifier}}.',
  enter_phone_verification_code: 'Saisir le code de vérification par SMS',
  enter_phone_verification_code_description:
    'L’authentification à deux étapes est activée pour ce compte. Veuillez saisir le code de vérification par SMS envoyé à {{identifier}}.',
  link_another_mfa_factor: 'Passez à une autre méthode',
  save_backup_code: 'Enregistrez votre code de sauvegarde',
  save_backup_code_description:
    "Vous pouvez utiliser l'un de ces codes de sauvegarde pour accéder à votre compte en cas de problème lors de la vérification en deux étapes par d'autres moyens. Chaque code ne peut être utilisé qu'une fois.",
  backup_code_hint: 'Assurez-vous de les copier et de les sauvegarder dans un endroit sûr.',
  enter_a_backup_code: 'Saisissez un code de sauvegarde',
  enter_backup_code_description:
    'Saisissez le code de sauvegarde que vous avez enregistré lorsque la vérification en deux étapes a été activée initialement.',
  create_a_passkey: "Créez une clé d'accès",
  create_passkey_description:
    "Enregistrez votre clé d'accès à l'aide de la biométrie de l'appareil, de clés de sécurité (par exemple, YubiKey) ou d'autres méthodes disponibles.",
  try_another_verification_method: 'Essayez une autre méthode de vérification',
  verify_via_passkey: "Vérifiez via la clé d'accès",
  verify_via_passkey_description:
    "Utilisez la clé d'accès pour vérifier avec votre mot de passe ou la biométrie de votre appareil, en scannant le code QR ou en utilisant une clé de sécurité USB comme la YubiKey.",
  secret_key_copied: 'Clé secrète copiée.',
  backup_code_copied: 'Code de sauvegarde copié.',
  webauthn_not_ready: "WebAuthn n'est pas prêt pour le moment. Veuillez réessayer plus tard.",
  webauthn_not_supported: "WebAuthn n'est pas pris en charge dans ce navigateur.",
  webauthn_failed_to_create: 'Échec de la création. Veuillez réessayer.',
  webauthn_failed_to_verify: 'Échec de la vérification. Veuillez réessayer.',
};

export default Object.freeze(mfa);
