const application = {
  invalid_type: '関連するロールを持つことができるのは、マシン間アプリケーションのみです。',
  role_exists: 'ロールID {{roleId}} は、すでにこのアプリケーションに追加されています。',
  invalid_role_type:
    'ユーザータイプのロールをマシン間アプリケーションに割り当てることはできません。',
  /** UNTRANSLATED */
  invalid_third_party_application_type:
    'Only traditional web applications can be marked as a third-party app.',
  /** UNTRANSLATED */
  third_party_application_only: 'The feature is only available for third-party applications.',
  /** UNTRANSLATED */
  user_consent_scopes_not_found: 'Invalid user consent scopes.',
};

export default Object.freeze(application);
