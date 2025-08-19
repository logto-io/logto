const mfa = {
  totp: '認証アプリOTP',
  webauthn: 'パスキー',
  backup_code: 'バックアップコード',
  email_verification_code: 'メール確認コード',
  phone_verification_code: 'SMS確認コード',
  link_totp_description: '例：Google Authenticator など',
  link_webauthn_description: 'デバイスまたはUSBハードウェアをリンク',
  link_backup_code_description: 'バックアップコードを生成',
  link_email_verification_code_description: 'メールアドレスをリンク',
  link_email_2fa_description: '2段階認証のためのメールアドレスをリンク',
  link_phone_verification_code_description: '電話番号をリンク',
  link_phone_2fa_description: '2段階認証のための電話番号をリンク',
  verify_totp_description: 'アプリに表示されるワンタイムコードを入力',
  verify_webauthn_description: 'デバイスまたはUSBハードウェアを確認',
  verify_backup_code_description: '保存したバックアップコードを貼り付け',
  verify_email_verification_code_description: 'メールに送信されたコードを入力',
  verify_phone_verification_code_description: '電話に送信されたコードを入力',
  add_mfa_factors: '2段階認証を追加',
  add_mfa_description:
    '2段階認証が有効になっています。安全なサインインのために第二の認証方法を選択してください。',
  verify_mfa_factors: '2段階認証',
  verify_mfa_description:
    'このアカウントでは2段階認証が有効になっています。アイデンティティを確認するための第二の方法を選択してください。',
  add_authenticator_app: '認証アプリを追加',
  step: 'ステップ{{step, number}}：{{content}}',
  scan_qr_code: 'このQRコードをスキャン',
  scan_qr_code_description:
    '次のQRコードを認証アプリ（例：Google Authenticator、Duo Mobile、Authyなど）でスキャンしてください。',
  qr_code_not_available: 'QRコードをスキャンできませんか？',
  copy_and_paste_key: 'キーをコピーして貼り付ける',
  copy_and_paste_key_description:
    '次のキーを認証アプリ（例：Google Authenticator、Duo Mobile、Authyなど）にコピーして貼り付けてください。',
  want_to_scan_qr_code: 'QRコードをスキャンしますか？',
  enter_one_time_code: 'ワンタイムコードを入力',
  enter_one_time_code_link_description: '認証アプリで生成された6桁の確認コードを入力してください。',
  enter_one_time_code_description:
    'このアカウントでは2段階認証が有効になっています。リンクされた認証アプリに表示されるワンタイムコードを入力してください。',
  enter_email_verification_code: 'メールの確認コードを入力',
  enter_email_verification_code_description:
    'このアカウントでは二段階認証が有効です。{{identifier}} に送信された確認コードを入力してください。',
  enter_phone_verification_code: 'SMSの確認コードを入力',
  enter_phone_verification_code_description:
    'このアカウントでは二段階認証が有効です。{{identifier}} に送信されたSMS確認コードを入力してください。',
  link_another_mfa_factor: '別の方法に切り替える',
  save_backup_code: 'バックアップコードを保存',
  save_backup_code_description:
    '2段階認証中に他の方法で問題が発生した場合、これらのバックアップコードのいずれかを使用してアカウントにアクセスできます。各コードは一度だけ使用できます。',
  backup_code_hint: '必ずコピーして安全な場所に保存してください。',
  enter_a_backup_code: 'バックアップコードを入力',
  enter_backup_code_description:
    '初めて2段階認証が有効になったときに保存したバックアップコードを入力してください。',
  create_a_passkey: 'パスキーを作成',
  create_passkey_description:
    'デバイスの生体認証、セキュリティキー（例：YubiKey）などを使用してパスキーを登録します。',
  try_another_verification_method: '別の検証方法を試す',
  verify_via_passkey: 'パスキーで確認',
  verify_via_passkey_description:
    'デバイスのパスワードまたは生体認証、QRコードのスキャン、YubiKeyなどのUSBセキュリティキーを使用してパスキーで確認します。',
  secret_key_copied: '秘密鍵がコピーされました。',
  backup_code_copied: 'バックアップコードがコピーされました。',
  webauthn_not_ready: 'WebAuthnはまだ準備ができていません。後でもう一度試してください。',
  webauthn_not_supported: 'このブラウザではWebAuthnはサポートされていません。',
  webauthn_failed_to_create: '作成に失敗しました。もう一度試してください。',
  webauthn_failed_to_verify: '確認に失敗しました。もう一度試してください。',
};

export default Object.freeze(mfa);
