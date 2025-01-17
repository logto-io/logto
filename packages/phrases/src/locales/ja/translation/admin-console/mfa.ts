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
  policy: 'ポリシー',
  policy_description: 'サインインおよびサインアップフローのためのMFAポリシーを設定します。',
  two_step_sign_in_policy: 'サインイン時の2段階認証ポリシー',
  user_controlled: 'ユーザーは自分でMFAを有効または無効にできます',
  user_controlled_tip:
    'ユーザーは最初のサインインまたはサインアップ時にMFAのセットアップをスキップしたり、アカウント設定で有効/無効にしたりできます。',
  mandatory: 'ユーザーは常にサインイン時にMFAの使用が必要です',
  mandatory_tip:
    'ユーザーは最初のサインインまたはサインアップ時にMFAを設定し、将来のすべてのサインインでそれを使用する必要があります。',
  /** UNTRANSLATED */
  require_mfa: 'Require MFA',
  /** UNTRANSLATED */
  require_mfa_label:
    'Enable this to make 2-step verification mandatory for accessing your applications. If disabled, users can decide whether to enable MFA for themselves.',
  /** UNTRANSLATED */
  set_up_prompt: 'MFA set-up prompt',
  /** UNTRANSLATED */
  no_prompt: 'Do not ask users to set up MFA',
  /** UNTRANSLATED */
  prompt_at_sign_in_and_sign_up:
    'Ask users to set up MFA during registration (skippable, one-time prompt)',
  /** UNTRANSLATED */
  prompt_only_at_sign_in:
    'Ask users to set up MFA on their next sign-in attempt after registration (skippable, one-time prompt)',
};

export default Object.freeze(mfa);
