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
    verification_title: '電話の認証コードを入力',
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
    resend: 'コードを再送',
    resend_countdown: 'まだ届きませんか？ {{seconds}} 秒後に再送できます。',
  },

  email_verification: {
    title: 'メールアドレスを確認',
    prepare_description:
      'アカウントの安全を守るため、ご本人であることを確認します。認証コードをメールに送信します。',
    email_label: 'メールアドレス',
    send: '認証コードを送信',
    description:
      '認証コードをメールアドレス {{email}} に送信しました。コードを入力して続行してください。',
    resend: 'コードを再送',
    resend_countdown: 'まだ届きませんか？ {{seconds}} 秒後に再送できます。',
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
    resend: 'コードを再送',
    resend_countdown: 'まだ届きませんか？ {{seconds}} 秒後に再送できます。',
    error_send_failed: '認証コードの送信に失敗しました。しばらくしてからもう一度お試しください。',
    error_verify_failed: '認証に失敗しました。もう一度コードを入力してください。',
    error_invalid_code: '認証コードが無効か、有効期限が切れています。',
  },
  update_success: {
    default: {
      title: '更新が完了しました',
      description: '変更内容が正常に保存されました。',
    },
    email: {
      title: 'メールアドレスを更新しました！',
      description: 'アカウントのメールアドレスが正常に変更されました。',
    },
    phone: {
      title: '電話番号を更新しました！',
      description: 'アカウントの電話番号が正常に変更されました。',
    },
    username: {
      title: 'ユーザー名を更新しました！',
      description: 'アカウントのユーザー名が正常に変更されました。',
    },

    password: {
      title: 'パスワードを更新しました！',
      description: 'アカウントのパスワードが正常に変更されました。',
    },
  },
};

export default Object.freeze(account_center);
