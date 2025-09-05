const mfa = {
  title: 'マルチファクタ認証',
  description:
    'サインインエクスペリエンスのセキュリティを向上させるためにマルチファクタ認証を追加します。',
  factors: '要因',
  multi_factors: 'マルチファクタ',
  multi_factors_description:
    'ユーザーは2段階認証のために有効になっている要因のうちの1つを検証する必要があります。',
  totp: '認証アプリ OTP',
  otp_description: 'Google Authenticatorなどをリンクしてワンタイムパスワードを検証します。',
  webauthn: 'WebAuthn（パスキー）',
  webauthn_description:
    'ブラウザでサポートされている方法を使用して検証します：生体認証、電話のスキャン、またはセキュリティキーなど。',
  webauthn_native_tip: 'WebAuthnはネイティブアプリケーションではサポートされていません。',
  webauthn_domain_tip:
    'WebAuthnは公開鍵を特定のドメインにバインドします。サービスのドメインを変更すると、既存のパスキーを使用したユーザーの認証がブロックされます。',
  backup_code: 'バックアップコード',
  backup_code_description:
    'ユーザーが任意のMFAメソッドを設定した後に10個のワンタイムバックアップコードを生成します。',
  backup_code_setup_hint: '上記のMFA要因を検証できない場合は、バックアップオプションを使用します。',
  backup_code_error_hint:
    'バックアップコードを使用するには、成功したユーザー認証のために少なくとも1つ以上のMFAメソッドが必要です。',
  email_verification_code: 'メール認証コード',
  email_verification_code_description:
    '確認コードを受信して確認するためにメールアドレスをリンクします。',
  phone_verification_code: 'SMS認証コード',
  phone_verification_code_description:
    'SMS認証コードを受信して確認するために電話番号をリンクします。',
  policy: 'ポリシー',
  policy_description: 'サインインおよびサインアップフローのためのMFAポリシーを設定します。',
  two_step_sign_in_policy: 'サインイン時の2段階認証ポリシー',
  user_controlled: 'ユーザーは自分でMFAを有効または無効にできます',
  user_controlled_tip:
    'ユーザーは最初のサインインまたはサインアップ時にMFAのセットアップをスキップしたり、アカウント設定で有効/無効にしたりできます。',
  mandatory: 'ユーザーは常にサインイン時にMFAの使用が必要です',
  mandatory_tip:
    'ユーザーは最初のサインインまたはサインアップ時にMFAを設定し、将来のすべてのサインインでそれを使用する必要があります。',
  require_mfa: 'MFA を要求',
  require_mfa_label:
    'アプリケーションにアクセスするために 2 段階認証を必須にするには、これを有効にします。無効にすると、ユーザーは自分で MFA を有効にするかどうかを決めることができます。',
  set_up_prompt: 'MFA の設定プロンプト',
  no_prompt: 'MFA の設定をユーザーに求めない',
  prompt_at_sign_in_and_sign_up:
    '登録時にユーザーに MFA の設定を依頼します（スキップ可能、1 回限りのプロンプト）',
  prompt_only_at_sign_in:
    '登録後の次回サインイン時にユーザーに MFA の設定を依頼します（スキップ可能、1 回限りのプロンプト）',
  set_up_organization_required_mfa_prompt:
    '組織が MFA を有効にした後のユーザーの MFA 設定プロンプト',
  prompt_at_sign_in_no_skip: '次回サインイン時にユーザーに MFA の設定を依頼します（スキップ不可）',
  email_primary_method_tip:
    'メール認証コードは既にあなたの主要なサインイン方法です。セキュリティを維持するため、それを MFA に再利用することはできません。',
  phone_primary_method_tip:
    'SMS認証コードは既にあなたの主要なサインイン方法です。セキュリティを維持するため、それを MFA に再利用することはできません。',
  no_email_connector_warning:
    'メールコネクターがまだ設定されていません。設定を完了する前に、ユーザーはMFAにメール認証コードを使用できません。「コネクター」で<a>{{link}}</a>してください。',
  no_sms_connector_warning:
    'SMSコネクターがまだ設定されていません。設定を完了する前に、ユーザーはMFAにSMS認証コードを使用できません。「コネクター」で<a>{{link}}</a>してください。',
  no_email_connector_error:
    'メールコネクターがないとメール認証コードMFAを有効にできません。まずメールコネクターを設定してください。',
  no_sms_connector_error:
    'SMSコネクターがないとSMS認証コードMFAを有効にできません。まずSMSコネクターを設定してください。',
  setup_link: '設定',
};

export default Object.freeze(mfa);
