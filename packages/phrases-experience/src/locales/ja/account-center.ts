const account_center = {
  header: {
    title: 'アカウントセンター',
  },
  home: {
    title: 'ページが見つかりません',
    description: 'このページは利用できません。',
  },
  verification: {
    title: 'セキュリティ確認',
    description:
      'アカウントの安全を守るため、ご本人であることを確認します。本人確認の方法を選択してください。',
    error_send_failed: '認証コードの送信に失敗しました。しばらくしてからもう一度お試しください。',
    error_invalid_code: '認証コードが無効か、有効期限が切れています。',
    error_verify_failed: '認証に失敗しました。もう一度コードを入力してください。',
    verification_required: '認証の有効期限が切れました。もう一度本人確認を行ってください。',
    try_another_method: '別の方法で確認する',
  },
  password_verification: {
    title: 'パスワードを確認',
    description: 'アカウントを保護するため、パスワードを入力して本人確認してください。',
    error_failed: '認証に失敗しました。パスワードを確認してください。',
  },
  verification_method: {
    password: {
      name: 'パスワード',
      description: 'パスワードを確認してください',
    },
    email: {
      name: 'メール認証コード',
      description: '認証コードをメールに送信',
    },
    phone: {
      name: '電話認証コード',
      description: '認証コードを電話番号に送信',
    },
  },
  email: {
    title: 'メールをリンク',
    description: 'メールをリンクしてサインインやアカウント復旧に役立てましょう。',
    verification_title: 'メール認証コードを入力',
    verification_description: '認証コードをメールアドレス {{email_address}} に送信しました。',
    success: 'メインのメールアドレスをリンクしました。',
    verification_required: '認証の有効期限が切れました。もう一度本人確認を行ってください。',
  },
  phone: {
    title: '電話番号をリンク',
    description: 'サインインやアカウント復旧のために電話番号をリンクします。',
    verification_title: 'SMS認証コードを入力',
    verification_description: '認証コードを電話番号 {{phone_number}} に送信しました。',
    success: 'メインの電話番号をリンクしました。',
    verification_required: '認証の有効期限が切れました。もう一度本人確認を行ってください。',
  },
  username: {
    title: 'ユーザー名を設定',
    description: 'ユーザー名は英数字とアンダースコアのみ使用できます。',
    success: 'ユーザー名を更新しました。',
  },
  password: {
    title: 'パスワードを設定',
    description: 'アカウントを守るために新しいパスワードを作成してください。',
    success: 'パスワードを更新しました。',
  },

  code_verification: {
    send: '認証コードを送信',
    resend: 'まだ届きませんか？ <a>認証コードを再送</a>',
    resend_countdown: 'まだ届きませんか？<span> {{seconds}} 秒後に再送できます</span>',
  },

  email_verification: {
    title: 'メールアドレスを確認',
    prepare_description:
      'アカウントの安全を守るため、ご本人であることを確認します。認証コードをメールに送信します。',
    email_label: 'メールアドレス',
    send: '認証コードを送信',
    description:
      '認証コードをメールアドレス {{email}} に送信しました。コードを入力して続行してください。',
    resend: 'まだ届きませんか？ <a>認証コードを再送</a>',
    resend_countdown: 'まだ届きませんか？<span> {{seconds}} 秒後に再送できます</span>',
    error_send_failed: '認証コードの送信に失敗しました。しばらくしてからもう一度お試しください。',
    error_verify_failed: '認証に失敗しました。もう一度コードを入力してください。',
    error_invalid_code: '認証コードが無効か、有効期限が切れています。',
  },
  phone_verification: {
    title: '電話番号を確認',
    prepare_description:
      'アカウントの安全を守るため、ご本人であることを確認します。認証コードを電話に送信します。',
    phone_label: '電話番号',
    send: '認証コードを送信',
    description: '認証コードを電話 {{phone}} に送信しました。コードを入力して続行してください。',
    resend: 'まだ届きませんか？ <a>認証コードを再送</a>',
    resend_countdown: 'まだ届きませんか？<span> {{seconds}} 秒後に再送できます</span>',
    error_send_failed: '認証コードの送信に失敗しました。しばらくしてからもう一度お試しください。',
    error_verify_failed: '認証に失敗しました。もう一度コードを入力してください。',
    error_invalid_code: '認証コードが無効か、有効期限が切れています。',
  },
  mfa: {
    totp_already_added: '認証アプリはすでに追加されています。まず既存のものを削除してください。',
    totp_not_enabled: '認証アプリは有効になっていません。管理者に連絡して有効にしてください。',
    backup_code_already_added:
      'すでに有効なバックアップコードがあります。新しいコードを生成する前に、これらを使用するか削除してください。',
    backup_code_not_enabled:
      'バックアップコードは有効になっていません。管理者に連絡して有効にしてください。',
    backup_code_requires_other_mfa:
      'バックアップコードを使用するには、まず他の MFA メソッドを設定する必要があります。',
    passkey_not_enabled: 'パスキーが有効になっていません。管理者に連絡して有効にしてください。',
  },
  update_success: {
    default: {
      title: '更新しました！',
      description: 'あなたの情報が更新されました。',
    },
    email: {
      title: 'メールアドレスを更新しました！',
      description: 'メールアドレスが正常に更新されました。',
    },
    phone: {
      title: '電話番号を更新しました！',
      description: '電話番号が正常に更新されました。',
    },
    username: {
      title: 'ユーザー名を変更しました！',
      description: 'ユーザー名が正常に更新されました。',
    },

    password: {
      title: 'パスワードを変更しました！',
      description: 'パスワードが正常に更新されました。',
    },
    social: {
      title: 'ソーシャルアカウントをリンクしました！',
      description: 'ソーシャルアカウントが正常にリンクされました。',
    },
    totp: {
      title: '認証アプリを追加しました！',
      description: '認証アプリがアカウントに正常にリンクされました。',
    },
    backup_code: {
      title: 'バックアップコードが生成されました！',
      description: 'バックアップコードが保存されました。安全な場所に保管してください。',
    },
    backup_code_deleted: {
      title: 'バックアップコードが削除されました！',
      description: 'バックアップコードがアカウントから削除されました。',
    },
    passkey: {
      title: 'パスキーが追加されました！',
      description: 'パスキーがアカウントに正常にリンクされました。',
    },
    passkey_deleted: {
      title: 'パスキーが削除されました！',
      description: 'パスキーがアカウントから削除されました。',
    },
  },
  backup_code: {
    title: 'バックアップコード',
    description:
      '2段階認証で問題が発生した場合、これらのバックアップコードのいずれかを使用してアカウントにアクセスできます。各コードは1回のみ使用できます。',
    copy_hint: 'コピーして安全な場所に保存してください。',
    generate_new_title: '新しいバックアップコードを生成',
    generate_new: '新しいバックアップコードを生成',
    delete_confirmation_title: 'バックアップコードを削除',
    delete_confirmation_description:
      'これらのバックアップコードを削除すると、認証に使用できなくなります。',
  },
  passkey: {
    title: 'パスキー',
    added: '追加日: {{date}}',
    last_used: '最後の使用: {{date}}',
    never_used: '未使用',
    unnamed: '名前なしのパスキー',
    renamed: 'パスキーの名前を変更しました。',
    add_another_title: '別のパスキーを追加',
    add_another_description:
      'デバイスの生体認証、セキュリティキー（例: YubiKey）、またはその他の利用可能な方法を使用してパスキーを登録してください。',
    add_passkey: 'パスキーを追加',
    delete_confirmation_title: 'パスキーを削除',
    delete_confirmation_description:
      '「{{name}}」を削除してもよろしいですか？このパスキーでログインできなくなります。',
    rename_passkey: 'パスキー名を変更',
    rename_description: 'このパスキーの新しい名前を入力してください。',
  },
};

export default Object.freeze(account_center);
