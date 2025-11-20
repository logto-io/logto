const system_limit = {
  limit_exceeded:
    'この<planName/>テナントは、<a>Logtoのエンティティポリシー</a>に基づく{{entity}}の制限に達しました。',
  entities: {
    application: 'アプリケーション',
    third_party_application: 'サードパーティアプリ',
    scope_per_resource: 'リソースごとの権限',
    social_connector: 'ソーシャルコネクタ',
    user_role: 'ユーザーロール',
    machine_to_machine_role: 'マシン間ロール',
    scope_per_role: 'ロールごとの権限',
    hook: 'Webhook',
    machine_to_machine: 'マシン間アプリ',
    resource: 'API リソース',
    enterprise_sso: 'エンタープライズ SSO',
    tenant_member: 'テナントメンバー',
    organization: '組織',
    saml_application: 'SAML アプリケーション',
    custom_domain: 'カスタムドメイン',
    user_per_organization: '組織ごとのユーザー',
    organization_user_role: '組織ユーザーロール',
    organization_machine_to_machine_role: '組織マシン間ロール',
    organization_scope: '組織権限',
  },
};

export default Object.freeze(system_limit);
