const user = {
  username_already_in_use: "Ce nom d'utilisateur est déjà utilisé.",
  email_already_in_use: 'Cet e-mail est associé à un compte existant.',
  phone_already_in_use: 'Ce numéro de téléphone est associé à un compte existant.',
  invalid_email: 'Addresse email incorrecte.',
  invalid_phone: 'Numéro de téléphone incorrect.',
  email_not_exist: "L'adresse e-mail n'a pas encore été enregistrée.",
  phone_not_exist: "Le numéro de téléphone n'a pas encore été enregistré.",
  identity_not_exist: "Le compte social n'a pas encore été enregistré.",
  identity_already_in_use: 'Le compte social a été enregistré.',
  social_account_exists_in_profile: 'Vous avez déjà associé ce compte social.',
  cannot_delete_self: 'Vous ne pouvez pas vous supprimer vous-même.',
  sign_up_method_not_enabled: "Cette méthode d'inscription n'est pas activée.",
  sign_in_method_not_enabled: "Cette méthode de connexion n'est pas activée.",
  same_password: "Le nouveau mot de passe ne peut pas être identique à l'ancien.",
  password_required_in_profile: 'Vous devez définir un mot de passe avant de vous connecter.',
  new_password_required_in_profile: 'Vous devez définir un nouveau mot de passe.',
  password_exists_in_profile: 'Le mot de passe existe déjà dans votre profil.',
  username_required_in_profile: "Vous devez définir un nom d'utilisateur avant de vous connecter.",
  username_exists_in_profile: "Le nom d'utilisateur existe déjà dans votre profil.",
  email_required_in_profile: 'Vous devez ajouter une adresse e-mail avant de vous connecter.',
  email_exists_in_profile: 'Votre profil est déjà associé à une adresse e-mail.',
  phone_required_in_profile: 'Vous devez ajouter un numéro de téléphone avant de vous connecter.',
  phone_exists_in_profile: 'Votre profil est déjà associé à un numéro de téléphone.',
  email_or_phone_required_in_profile:
    'Vous devez ajouter une adresse e-mail ou un numéro de téléphone avant de vous connecter.',
  suspended: 'Ce compte est suspendu.',
  user_not_exist: "L'utilisateur avec {{ identifier }} n'existe pas.",
  missing_profile: 'Vous devez fournir des informations supplémentaires avant de vous connecter.',
  role_exists: "L'ID de rôle {{roleId}} a déjà été ajouté à cet utilisateur",
  invalid_role_type:
    'Le type de rôle est invalide, il est impossible d\'assigner un rôle "machine-to-machine" à un utilisateur.',
  missing_mfa: 'Vous devez lier un MFA supplémentaire avant de vous connecter.',
  totp_already_in_use: 'TOTP est déjà utilisé.',
  backup_code_already_in_use: 'Le code de sauvegarde est déjà utilisé.',
  password_algorithm_required: 'Algorithme de mot de passe est requis.',
  password_and_digest:
    'Vous ne pouvez pas définir à la fois un mot de passe en texte brut et un digest de mot de passe.',
  personal_access_token_name_exists: "Le nom du jeton d'accès personnel existe déjà.",
  totp_secret_invalid: 'Le secret TOTP fourni est invalide.',
  wrong_backup_code_format: 'Le format du code de sauvegarde est invalide.',
  username_required:
    "Le nom d'utilisateur est un identifiant requis, vous ne pouvez pas le définir à null.",
  email_or_phone_required:
    "L'adresse e-mail ou le numéro de téléphone est un identifiant requis, au moins un est nécessaire.",
  email_required:
    "L'adresse e-mail est un identifiant requis, vous ne pouvez pas la définir à null.",
  phone_required:
    'Le numéro de téléphone est un identifiant requis, vous ne pouvez pas le définir à null.',
  enterprise_sso_identity_not_exists:
    "L'utilisateur n'a pas d'identité d'entreprise liée à l'ID du connecteur SSO spécifié : {{ ssoConnectorId }}.",
  identity_not_exists_in_current_user:
    "L'identité spécifiée n'existe pas dans le compte utilisateur actuel. Veuillez lier l'identité avant de continuer.",
};

export default Object.freeze(user);
