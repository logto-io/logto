const paywall = {
  applications:
    '{{count, number}}個の<planName/>アプリケーション制限に達しました。チームのニーズに対応するため、プランをアップグレードしてください。サポートが必要な場合は、お気軽に<a>お問い合わせ</a>ください。',
  applications_other:
    '{{count, number}}個の<planName/>アプリケーション制限に達しました。チームのニーズに対応するため、プランをアップグレードしてください。サポートが必要な場合は、お気軽に<a>お問い合わせ</a>ください。',
  machine_to_machine_feature:
    'Switch to the <strong>Pro</strong> plan to gain extra machine-to-machine applications and enjoy all premium features. <a>Contact us</a> if you have questions.',
  machine_to_machine:
    '{{count, number}}個の<planName/>マシン間アプリケーション制限に達しました。チームのニーズに対応するため、プランをアップグレードしてください。サポートが必要な場合は、お気軽に<a>お問い合わせ</a>ください。',
  machine_to_machine_other:
    '{{count, number}}個の<planName/>マシン間アプリケーション制限に達しました。チームのニーズに対応するため、プランをアップグレードしてください。サポートが必要な場合は、お気軽に<a>お問い合わせ</a>ください。',
  resources:
    '{{count, number}}の<planName/> APIリソース制限に達しました。チームのニーズに合わせてプランをアップグレードしてください。<a>お問い合わせ</a>は何かお手伝いが必要な場合はお気軽にどうぞ。',
  resources_other:
    '{{count, number}}の<planName/> APIリソース制限に達しました。チームのニーズに合わせてプランをアップグレードしてください。<a>お問い合わせ</a>は何かお手伝いが必要な場合はお気軽にどうぞ。',
  scopes_per_resource:
    '{{count, number}}の<planName/> APIリソースあたりの許可制限に達しました。拡張するには今すぐアップグレードしてください。<a>お問い合わせ</a>は何かお手伝いが必要な場合はお気軽にどうぞ。',
  scopes_per_resource_other:
    '{{count, number}}の<planName/> APIリソースあたりの許可制限に達しました。拡張するには今すぐアップグレードしてください。<a>お問い合わせ</a>は何かお手伝いが必要な場合はお気軽にどうぞ。',
  custom_domain:
    'カスタムドメインの機能を解除するには、<strong>Hobby</strong>または<strong>Pro</strong>プランにアップグレードしてください。何かお手伝いが必要な場合は、お気軽に<a>お問い合わせ</a>ください。',
  social_connectors:
    '{{count, number}}の<planName/>ソーシャルコネクタ制限に達しました。チームのニーズに合わせて有料プランにアップグレードして、OIDC、OAuth 2.0、およびSAMLプロトコルを使用して独自のコネクタを作成できるようにしましょう。<a>お問い合わせ</a>は何かお手伝いが必要な場合はお気軽にどうぞ。',
  social_connectors_other:
    '{{count, number}}個の<planName/>制限のソーシャルコネクタに達しました。チームのニーズを満たすために、追加のソーシャルコネクタとOIDC、OAuth 2.0、およびSAMLプロトコルを使用して独自のコネクタを作成する機能を得るためにプランをアップグレードしてください。サポートが必要な場合は、お気軽に<a>お問い合わせ</a>ください。',
  standard_connectors_feature:
    'OIDC、OAuth 2.0、およびSAMLプロトコルを使用して独自のコネクタを作成し、無制限のソーシャルコネクタとすべてのプレミアム機能を利用するには、<strong>Hobby</strong>プランまたは<strong>Pro</strong>プランにアップグレードしてください。どんなお手伝いが必要でも、お気軽に<a>お問い合わせ</a>ください。',
  standard_connectors:
    '{{count, number}}の<planName/>ソーシャルコネクタ制限に達しました。チームのニーズに合わせて有料プランにアップグレードして、OIDC、OAuth 2.0、およびSAMLプロトコルを使用して独自のコネクタを作成できるようにしましょう。<a>お問い合わせ</a>は何かお手伝いが必要な場合はお気軽にどうぞ。',
  standard_connectors_other:
    '{{count, number}}個の<planName/>制限のソーシャルコネクタに達しました。チームのニーズを満たすために、追加のソーシャルコネクタとOIDC、OAuth 2.0、およびSAMLプロトコルを使用して独自のコネクタを作成する機能を得るためにプランをアップグレードしてください。サポートが必要な場合は、お気軽に<a>お問い合わせ</a>ください。',
  standard_connectors_pro:
    '{{count, number}}の<planName/>スタンダードコネクタ制限に達しました。チームのニーズに合わせてエンタープライズプランにアップグレードして、OIDC、OAuth 2.0、およびSAMLプロトコルを使用して独自のコネクタを作成できるようにしましょう。<a>お問い合わせ</a>は何かお手伝いが必要な場合はお気軽にどうぞ。',
  standard_connectors_pro_other:
    '{{count, number}}個の<planName/>制限のスタンダードコネクタに達しました。チームのニーズを満たすために、追加のソーシャルコネクタとOIDC、OAuth 2.0、およびSAMLプロトコルを使用して独自のコネクタを作成する機能を得るためにエンタープライズプランにアップグレードしてください。サポートが必要な場合は、お気軽に<a>お問い合わせ</a>ください。',
  roles:
    '追加のロールと権限を追加するにはプランをアップグレードしてください。サポートが必要な場合は、お気軽に<a>お問い合わせ</a>ください。',
  scopes_per_role:
    '{{count, number}}の<planName/>ロールあたりの許可制限に達しました。追加のロールと権限を追加するにはプランをアップグレードしてください。<a>お問い合わせ</a>は何かお手伝いが必要な場合はお気軽にどうぞ.',
  scopes_per_role_other:
    '{{count, number}}個の<planName/>制限のロールあたりの許可に達しました。追加のロールおよび権限を追加するにはプランをアップグレードしてください。サポートが必要な場合は、お気軽に<a>お問い合わせ</a>ください。',
  saml_applications_oss:
    '追加の SAML アプリは Logto エンタープライズプランで利用可能です。サポートが必要な場合は、お問い合わせください。',
  logto_pricing_button_text: 'Logto クラウド価格設定',
  saml_applications:
    '追加の SAML アプリは Logto エンタープライズプランで利用可能です。サポートが必要な場合は、お問い合わせください。',
  saml_applications_add_on:
    'SAML アプリ機能をアンロックするには、有料プランにアップグレードしてください。サポートが必要な場合は、お気軽に<a>お問い合わせ</a>ください。',
  hooks:
    '{{count, number}}の<planName/>ウェブフック制限に達しました。追加のウェブフックを作成するにはプランをアップグレードしてください。<a>お問い合わせ</a>は何かお手伝いが必要な場合はお気軽にどうぞ。',
  hooks_other:
    '{{count, number}}個の<planName/>制限のウェブフックに達しました。追加のウェブフックを作成するにはプランをアップグレードしてください。サポートが必要な場合は、お気軽に<a>お問い合わせ</a>ください。',
  mfa: 'セキュリティを確認するためにMFAを解除して有料プランにアップグレードしてください。ご質問があれば、<a>お問い合わせください</a>。',
  organizations:
    '有料プランにアップグレードして、組織を解除します。サポートが必要な場合は、遠慮なく<a>お問い合わせください</a>。',
  third_party_apps:
    '有料プランにアップグレードして、サードパーティアプリの IdP としてログトを解除します。サポートが必要な場合はお気軽に<a>お問い合わせ</a>ください。',
  sso_connectors:
    '有料プランにアップグレードして、エンタープライズ sso を解除します。サポートが必要な場合はお気軽に<a>お問い合わせ</a>ください。',
  tenant_members:
    '有料プランにアップグレードして、コラボレーション機能を解除します。サポートが必要な場合はお気軽に<a>お問い合わせ</a>ください。',
  tenant_members_dev_plan:
    "You've reached your {{limit}}-member limit. Release a member or revoke a pending invitation to add someone new. Need more seats? Feel free to contact us.",
  custom_jwt: {
    title: 'カスタムクレームを追加',
    description:
      'カスタム JWT 機能とプレミアム特典のために有料プランにアップグレードしましょう。質問がある場合は、お気軽に<a>お問い合わせください</a>。',
  },
  bring_your_ui:
    'カスタム UI 機能とプレミアム特典を利用するには、有料プランにアップグレードしてください。',
  security_features:
    'Pro プランにアップグレードして、高度なセキュリティ機能を解除してください。質問があれば、お気軽に<a>お問い合わせ</a>ください。',
  collect_user_profile:
    'サインアップ時に追加のユーザープロフィール情報を収集するために有料プランにアップグレードしてください。ご質問がある場合は、お気軽に<a>お問い合わせ</a>ください。',
};

export default Object.freeze(paywall);
