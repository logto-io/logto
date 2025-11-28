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
    verification_required: 'Verification expired. Please verify your identity again.',
  },
  password_verification: {
    title: 'Verify password',
    description: "Verify it's you to protect your account security. Enter your password.",
    error_failed: 'Verification failed. Please check your password.',
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
    success: 'Primary email linked successfully.',
    verification_required: 'Verification expired. Please verify your identity again.',
  },
  phone: {
    title: 'Link phone',
    description: 'Link your phone number to sign in or help with account recovery.',
    verification_title: 'Enter phone verification code',
    verification_description: 'The verification code has been sent to your phone {{phone_number}}.',
    success: 'Primary phone linked successfully.',
    verification_required: 'Verification expired. Please verify your identity again.',
  },

  email_verification: {
    title: 'メールアドレスを確認',
    prepare_description:
      "Verify it's you to protect your account security. Send the verification code to your email.",
    email_label: 'Email address',
    send: 'Send verification code',
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
    send: 'Send verification code',
    description: '認証コードを電話 {{phone}} に送信しました。コードを入力して続行してください。',
    resend: 'コードを再送',
    resend_countdown: 'まだ届きませんか？ {{seconds}} 秒後に再送できます。',
    error_send_failed: '認証コードの送信に失敗しました。しばらくしてからもう一度お試しください。',
    error_verify_failed: '認証に失敗しました。もう一度コードを入力してください。',
    error_invalid_code: '認証コードが無効か、有効期限が切れています。',
  },
};

export default Object.freeze(account_center);
