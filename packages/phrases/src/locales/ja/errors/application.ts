const application = {
  invalid_type: '関連するロールを持つことができるのは、マシン間アプリケーションのみです。',
  role_exists: 'ロールID {{roleId}} は、すでにこのアプリケーションに追加されています。',
  invalid_role_type:
    'ユーザータイプのロールをマシン間アプリケーションに割り当てることはできません。',
  invalid_third_party_application_type:
    '伝統的なWebアプリケーションにのみ、サードパーティアプリとしてマークできます。',
  third_party_application_only: 'この機能はサードパーティアプリケーションにのみ利用可能です。',
  user_consent_scopes_not_found: '無効なユーザー同意スコープ。',
};

export default Object.freeze(application);
