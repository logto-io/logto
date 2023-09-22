const mfa = {
  totp: '認証アプリOTP',
  webauthn: 'パスキー',
  backup_code: 'バックアップコード',
  link_totp_description: 'Google Authenticatorなどをリンク',
  link_webauthn_description: 'デバイスまたはUSBハードウェアをリンク',
  link_backup_code_description: 'バックアップコードを生成',
  verify_totp_description: 'アプリにワンタイムコードを入力',
  verify_webauthn_description: 'デバイスまたはUSBハードウェアを確認',
  verify_backup_code_description: '保存したバックアップコードを貼り付け',
  add_mfa_factors: '2段階認証を追加',
  add_mfa_description:
    '2段階認証が有効です。セキュアなアカウントサインインのための第二の確認方法を選択してください。',
  verify_mfa_factors: '2段階認証',
  verify_mfa_description:
    'このアカウントでは2段階認証が有効になっています。アイデンティティを確認するための第二の方法を選択してください。',
  add_authenticator_app: '認証アプリを追加',
  step: 'ステップ{{step, number}}：{{content}}',
  scan_qr_code: 'このQRコードをスキャン',
  scan_qr_code_description:
    'Google Authenticator、Duo mobile、Authyなどの認証アプリを使用して、このQRコードをスキャンしてください。',
  qr_code_not_available: 'QRコードをスキャンできませんか？',
  copy_and_paste_key: 'キーをコピーして貼り付け',
  copy_and_paste_key_description:
    '以下のキーをGoogle Authenticator、Duo mobile、Authyなどの認証アプリに貼り付けてください。',
  want_to_scan_qr_code: 'QRコードをスキャンしたいですか？',
  enter_one_time_code: 'ワンタイムコードを入力',
  enter_one_time_code_link_description:
    '認証アプリによって生成された6桁の確認コードを入力してください。',
  enter_one_time_code_description:
    'このアカウントでは2段階認証が有効になっています。リンクされた認証アプリで表示されるワンタイムコードを入力してください。',
  link_another_mfa_factor: '別の2段階認証をリンク',
  save_backup_code: 'バックアップコードを保存',
  save_backup_code_description:
    '他の方法で2段階認証中に問題が発生した場合、これらのバックアップコードのいずれかを使用してアカウントにアクセスできます。各コードは1回しか使用できません。',
  backup_code_hint: 'コピーして安全な場所に保存してください。',
  enter_backup_code_description:
    '2段階認証が最初に有効になったときに保存したバックアップコードを入力してください。',
  create_a_passkey: 'パスキーを作成',
  create_passkey_description:
    'デバイスのパスワードまたはバイオメトリック、QRコードのスキャン、YubiKeyなどのUSBセキュリティキーを使用して確認するためのパスキーを登録します。',
  name_your_passkey: 'パスキーに名前を付ける',
  name_passkey_description:
    'このデバイスを2段階認証に成功裏に認証しました。複数のキーを持っている場合に識別するために名前をカスタマイズします。',
  try_another_verification_method: '別の確認方法を試す',
  verify_via_passkey: 'パスキーを使用して確認',
  verify_via_passkey_description:
    'デバイスのパスワードまたはバイオメトリック、QRコードのスキャン、YubiKeyなどのUSBセキュリティキーを使用して確認するためにパスキーを使用します。',
  secret_key_copied: 'シークレットキーがコピーされました。',
  backup_code_copied: 'バックアップコードがコピーされました。',
};

export default Object.freeze(mfa);
