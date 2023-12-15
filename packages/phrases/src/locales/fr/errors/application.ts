const application = {
  invalid_type: 'Seules les applications machine à machine peuvent avoir des rôles associés.',
  role_exists: "Le rôle d'identifiant {{roleId}} a déjà été ajouté à cette application.",
  invalid_role_type:
    "Impossible d'assigner un rôle de type utilisateur à une application machine à machine.",
  /** UNTRANSLATED */
  invalid_third_party_application_type:
    'Only traditional web applications can be marked as a third-party app.',
  /** UNTRANSLATED */
  user_consent_scopes_only_for_third_party_applications:
    'Only third-party applications can manage user consent scopes.',
  /** UNTRANSLATED */
  user_consent_scopes_not_found: 'Invalid user consent scopes.',
};

export default Object.freeze(application);
