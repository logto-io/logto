const user = {
  username_already_in_use: 'Dieser Benutzername wird bereits verwendet.',
  email_already_in_use: 'Diese E-Mail-Adresse ist mit einem vorhandenen Konto verknüpft.',
  phone_already_in_use: 'Diese Telefonnummer ist mit einem vorhandenen Konto verknüpft.',
  invalid_email: 'Ungültige E-Mail.',
  invalid_phone: 'Ungültige Telefonnummer.',
  email_not_exist: 'Die E-Mail wurde noch nicht registriert.',
  phone_not_exist: 'Die Telefonnummer wurde noch nicht registriert.',
  identity_not_exist: 'Die Identität wurde noch nicht registriert.',
  identity_already_in_use: 'Die Identität wurde registriert.',
  social_account_exists_in_profile: 'Sie haben diesen Social-Media-Account bereits verknüpft.',
  cannot_delete_self: 'Du kannst dich nicht selbst löschen.',
  sign_up_method_not_enabled: 'Diese Anmeldeart ist nicht aktiviert.',
  sign_in_method_not_enabled: 'Diese Anmeldemethode ist nicht aktiviert.',
  same_password: 'Das neue Passwort muss sich vom alten unterscheiden.',
  password_required_in_profile:
    'Sie müssen ein Passwort festlegen, bevor Sie sich anmelden können.',
  new_password_required_in_profile: 'Sie müssen ein neues Passwort festlegen.',
  password_exists_in_profile: 'Das Passwort ist bereits in Ihrem Profil vorhanden.',
  username_required_in_profile:
    'Sie müssen einen Benutzernamen festlegen, bevor Sie sich anmelden können.',
  username_exists_in_profile: 'Der Benutzername ist bereits in Ihrem Profil vorhanden.',
  email_required_in_profile:
    'Sie müssen eine E-Mail-Adresse hinzufügen, bevor Sie sich anmelden können.',
  email_exists_in_profile: 'Ihr Profil ist bereits mit einer E-Mail-Adresse verknüpft.',
  phone_required_in_profile:
    'Sie müssen eine Telefonnummer hinzufügen, bevor Sie sich anmelden können.',
  phone_exists_in_profile: 'Ihr Profil ist bereits mit einer Telefonnummer verknüpft.',
  email_or_phone_required_in_profile:
    'Sie müssen eine E-Mail-Adresse oder eine Telefonnummer hinzufügen, bevor Sie sich anmelden können.',
  suspended: 'Dieses Konto wurde gesperrt.',
  user_not_exist: 'Der Benutzer mit {{ identifier }} existiert nicht.',
  missing_profile: 'Sie müssen zusätzliche Informationen angeben, bevor Sie sich anmelden können.',
  role_exists: 'Die Rollen-ID {{roleId}} wurde diesem Benutzer bereits hinzugefügt.',
  invalid_role_type:
    'Ungültiger Rollentyp, kann keine Maschinen-zu-Maschinen-Rolle einem Benutzer zuweisen.',
  missing_mfa: 'Sie müssen zusätzliches MFA verbinden, bevor Sie sich anmelden können.',
  totp_already_in_use: 'TOTP wird bereits verwendet.',
  backup_code_already_in_use: 'Backup-Code wird bereits verwendet.',
  password_algorithm_required: 'Password-Algorithmus ist erforderlich.',
  password_and_digest:
    'Sie können nicht sowohl das Passwort im Klartext als auch den Passwort-Hash festlegen.',
  personal_access_token_name_exists: 'Name des persönlichen Zugriffstokens existiert bereits.',
  totp_secret_invalid: 'Ungültiges TOTP-Geheimnis bereitgestellt.',
  wrong_backup_code_format: 'Backup-Code-Format ist ungültig.',
  username_required: 'Benutzername ist ein erforderlicher Bezeichner, er kann nicht null sein.',
  email_or_phone_required:
    'E-Mail-Adresse oder Telefonnummer ist ein erforderlicher Bezeichner, mindestens eine ist erforderlich.',
  email_required: 'E-Mail-Adresse ist ein erforderlicher Bezeichner, sie kann nicht null sein.',
  phone_required: 'Telefonnummer ist ein erforderlicher Bezeichner, sie kann nicht null sein.',
  enterprise_sso_identity_not_exists:
    'Der Benutzer hat keine Unternehmensidentität, die mit der angegebenen SSO-Konnektor-ID verknüpft ist: {{ ssoConnectorId }}.',
  identity_not_exists_in_current_user:
    'Die angegebene Identität existiert nicht im aktuellen Benutzerkonto. Bitte verknüpfen Sie die Identität, bevor Sie fortfahren.',
};

export default Object.freeze(user);
