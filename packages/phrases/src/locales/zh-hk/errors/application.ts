const application = {
  invalid_type: '只有機器對機器應用程式才能有相關職能。',
  role_exists: '角色 ID {{roleId}} 已經被添加到此應用程式中。',
  invalid_role_type: '無法將使用者類型的角色分配給機器對機器應用程式。',
  /** UNTRANSLATED */
  invalid_third_party_application_type:
    'Only traditional web applications can be marked as a third-party app.',
  /** UNTRANSLATED */
  third_party_application_only: 'The feature is only available for third-party applications.',
  /** UNTRANSLATED */
  user_consent_scopes_not_found: 'Invalid user consent scopes.',
};

export default Object.freeze(application);
