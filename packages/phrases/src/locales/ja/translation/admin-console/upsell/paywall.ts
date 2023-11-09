const paywall = {
  applications:
    '{{count, number}}個の<planName/>アプリケーション制限に達しました。チームのニーズに対応するため、プランをアップグレードしてください。サポートが必要な場合は、お気軽に<a>お問い合わせ</a>ください。',
  applications_other:
    '{{count, number}}個の<planName/>アプリケーション制限に達しました。チームのニーズに対応するため、プランをアップグレードしてください。サポートが必要な場合は、お気軽に<a>お問い合わせ</a>ください。',
  /** UNTRANSLATED */
  machine_to_machine_feature:
    'Upgrade to the <b>Hobby</b> plan to unlock 1 machine-to-machine application, or choose the <b>Pro</b> plan for unlimited usage. For any assistance, feel free to <a>contact us</a>.',
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
  /** UNTRANSLATED */
  custom_domain:
    'Unlock custom domain functionality by upgrading to <b>Hobby</b> or <b>Pro</b> plan. Don’t hesitate to <a>contact us</a> if you need any assistance.',
  social_connectors:
    '{{count, number}}の<planName/>ソーシャルコネクタ制限に達しました。チームのニーズに合わせて有料プランにアップグレードして、OIDC、OAuth 2.0、およびSAMLプロトコルを使用して独自のコネクタを作成できるようにしましょう。<a>お問い合わせ</a>は何かお手伝いが必要な場合はお気軽にどうぞ。',
  social_connectors_other:
    '{{count, number}}の<planName/>ソーシャルコネクタ制限に達しました。チームのニーズに合わせて有料プランにアップグレードして、OIDC、OAuth 2.0、およびSAMLプロトコルを使用して独自のコネクタを作成できるようにしましょう。<a>お問い合わせ</a>は何かお手伝いが必要な場合はお気軽にどうぞ。',
  /** UNTRANSLATED */
  standard_connectors_feature:
    'Upgrade to the <b>Hobby</b> or <b>Pro</b> plan to create your own connectors using OIDC, OAuth 2.0, and SAML protocols, plus unlimited social connectors and all the premium features. Feel free to <a>contact us</a> if you need any assistance.',
  standard_connectors:
    '{{count, number}}の<planName/>ソーシャルコネクタ制限に達しました。チームのニーズに合わせて有料プランにアップグレードして、OIDC、OAuth 2.0、およびSAMLプロトコルを使用して独自のコネクタを作成できるようにしましょう。<a>お問い合わせ</a>は何かお手伝いが必要な場合はお気軽にどうぞ。',
  standard_connectors_other:
    '{{count, number}}の<planName/>ソーシャルコネクタ制限に達しました。チームのニーズに合わせて有料プランにアップグレードして、OIDC、OAuth 2.0、およびSAMLプロトコルを使用して独自のコネクタを作成できるようにしましょう。<a>お問い合わせ</a>は何かお手伝いが必要な場合はお気軽にどうぞ。',
  standard_connectors_pro:
    '{{count, number}}の<planName/>スタンダードコネクタ制限に達しました。チームのニーズに合わせてエンタープライズプランにアップグレードして、OIDC、OAuth 2.0、およびSAMLプロトコルを使用して独自のコネクタを作成できるようにしましょう。<a>お問い合わせ</a>は何かお手伝いが必要な場合はお気軽にどうぞ。',
  standard_connectors_pro_other:
    '{{count, number}}の<planName/>スタンダードコネクタ制限に達しました。チームのニーズに合わせてエンタープライズプランにアップグレードして、OIDC、OAuth 2.0、およびSAMLプロトコルを使用して独自のコネクタを作成できるようにしましょう。<a>お問い合わせ</a>は何かお手伝いが必要な場合はお気軽にどうぞ。',
  roles:
    '{{count, number}}の<planName/>ロール制限に達しました。追加のロールと権限を追加するにはプランをアップグレードしてください。<a>お問い合わせ</a>は何かお手伝いが必要な場合はお気軽にどうぞ。',
  roles_other:
    '{{count, number}}の<planName/>ロール制限に達しました。追加のロールと権限を追加するにはプランをアップグレードしてください。<a>お問い合わせ</a>は何かお手伝いが必要な場合はお気軽にどうぞ。',
  scopes_per_role:
    '{{count, number}}の<planName/>ロールあたりの許可制限に達しました。追加のロールと権限を追加するにはプランをアップグレードしてください。<a>お問い合わせ</a>は何かお手伝いが必要な場合はお気軽にどうぞ。',
  scopes_per_role_other:
    '{{count, number}}の<planName/>ロールあたりの許可制限に達しました。追加のロールと権限を追加するにはプランをアップグレードしてください。<a>お問い合わせ</a>は何かお手伝いが必要な場合はお気軽にどうぞ。',
  hooks:
    '{{count, number}}の<planName/>ウェブフック制限に達しました。追加のウェブフックを作成するにはプランをアップグレードしてください。<a>お問い合わせ</a>は何かお手伝いが必要な場合はお気軽にどうぞ。',
  hooks_other:
    '{{count, number}}の<planName/>ウェブフック制限に達しました。追加のウェブフックを作成するにはプランをアップグレードしてください。<a>お問い合わせ</a>は何かお手伝いが必要な場合はお気軽にどうぞ。',
};

export default Object.freeze(paywall);
