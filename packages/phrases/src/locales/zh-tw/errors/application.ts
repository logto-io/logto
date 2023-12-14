const application = {
  invalid_type: '僅允許機器對機器應用程式附加角色。',
  role_exists: '該角色 ID {{roleId}} 已被添加至此應用程式。',
  invalid_role_type: '無法將使用者類型的角色指派給機器對機器應用程式。',
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
