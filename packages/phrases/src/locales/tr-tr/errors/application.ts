const application = {
  invalid_type: 'Sadece makine ile makine uygulamaları rollerle ilişkilendirilebilir.',
  role_exists: 'Bu uygulamaya zaten {{roleId}} kimlikli bir rol eklenmiş.',
  invalid_role_type: 'Kullanıcı tipi rolü makine ile makine uygulamasına atayamaz.',
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
