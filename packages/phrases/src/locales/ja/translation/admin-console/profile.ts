const profile = {
  page_title: 'アカウント設定',
  title: 'アカウント設定',
  description:
    'アカウントのセキュリティを確保するため、ここでアカウント設定と個人情報の管理を変更できます。',
  settings: {
    title: 'プロファイル設定',
    profile_information: 'プロファイル情報',
    avatar: 'アバター',
    name: '名前',
    username: 'ユーザー名',
  },
  link_account: {
    title: 'アカウントをリンク',
    email_sign_in: 'Email sign-In',
    email: 'Eメール',
    social_sign_in: 'ソーシャルサインイン',
    link_email: 'Eメールのリンク',
    link_email_subtitle: 'ログインにEメールをリンクするか、アカウントの回復をお手伝いします。',
    email_required: 'Eメールが必要です',
    invalid_email: '無効なEメールアドレス',
    identical_email_address: '入力したEメールアドレスは現在のものと同じです',
    anonymous: '匿名',
  },
  password: {
    title: 'パスワードとセキュリティ',
    password: 'パスワード',
    password_setting: 'パスワード設定',
    new_password: '新しいパスワード',
    confirm_password: 'パスワードの確認',
    enter_password: '現在のパスワードを入力してください',
    enter_password_subtitle:
      'アカウントのセキュリティを保護するためにあなたが本人であることを確認してください。変更する前に現在のパスワードを入力してください。',
    set_password: 'パスワードを設定する',
    verify_via_password: 'パスワードを使って確認する',
    show_password: 'パスワードを表示する',
    required: 'パスワードが必要です',
    do_not_match: 'パスワードが一致しません。もう一度お試しください。',
  },
  code: {
    enter_verification_code: '検証コードを入力してください',
    enter_verification_code_subtitle: '検証コードは <strong>{{target}}</strong> に送信されました。',
    verify_via_code: '検証コードを使用して確認する',
    resend: '検証コードを再送信する',
    resend_countdown: '{{countdown}} 秒後に再送信する',
  },
  delete_account: {
    title: 'アカウントを削除',
    label: 'アカウントを削除',
    description:
      'アカウントの削除は、すべての個人情報、ユーザーデータ、および設定が削除されます。このアクションは元に戻せません。',
    button: 'アカウントを削除',
    p: {
      has_issue:
        'アカウントを削除したいということで申し訳ありません。アカウントを削除する前に、以下の問題を解決する必要があります。',
      after_resolved:
        '問題が解決したら、アカウントを削除できます。サポートが必要な場合は、ご連絡ください。',
      check_information:
        'アカウントを削除したいということで申し訳ありません。続行する前に、以下の情報を注意深く確認してください。',
      remove_all_data:
        'アカウントを削除すると、Logto Cloud に関するすべてのデータが永久に削除されます。続行する前に、重要なデータをバックアップしてください。',
      confirm_information:
        '上記の情報が期待通りであることを確認してください。アカウントを削除すると、復元できなくなります。',
      has_admin_role: '次のテナントでは管理者権限があるため、アカウントと共に削除されます：',
      has_admin_role_other: '次のテナントでは管理者権限があるため、アカウントと共に削除されます：',
      quit_tenant: '次のテナントを退出しようとしています：',
      quit_tenant_other: '次のテナントを退出しようとしています：',
    },
    issues: {
      paid_plan: '次のテナントは有料プランです。まずサブスクリプションをキャンセルしてください：',
      paid_plan_other:
        '次のテナントは有料プランです。まずサブスクリプションをキャンセルしてください：',
      subscription_status: '次のテナントにサブスクリプションの問題があります：',
      subscription_status_other: '次のテナントにサブスクリプションの問題があります：',
      open_invoice: '次のテナントに未払いの請求書があります：',
      open_invoice_other: '次のテナントに未払いの請求書があります：',
    },
    error_occurred: 'エラーが発生しました',
    error_occurred_description: '申し訳ありませんが、アカウントの削除中に問題が発生しました：',
    request_id: 'リクエスト ID：{{requestId}}',
    try_again_later:
      '後でもう一度試してください。問題が解決しない場合は、リクエスト ID を持って Logto チームに連絡してください。',
    final_confirmation: '最終確認',
    about_to_start_deletion: '削除プロセスを開始しようとしています。この操作は元に戻せません。',
    permanently_delete: '完全に削除',
  },
  set: '設定する',
  change: '変更する',
  link: 'リンクする',
  unlink: 'リンクを解除する',
  not_set: '設定されていません',
  change_avatar: 'アバターを変更する',
  change_name: '名前を変更する',
  change_username: 'ユーザー名を変更する',
  set_name: '名前を設定する',
  email_changed: 'Eメールが変更されました。',
  password_changed: 'パスワードが変更されました。',
  updated: '{{target}} が更新されました。',
  linked: '{{target}} がリンクされました。',
  unlinked: '{{target}} のリンクが解除されました。',
  email_exists_reminder:
    'このEメール{{email}}は、既存のアカウントに関連付けられています。ここで別のEメールをリンクしてください。',
  unlink_confirm_text: 'はい、リンクを解除します',
  unlink_reminder:
    'リンクを解除すると、ユーザーは<span></span>アカウントでサインインできなくなります。本当に進めますか？',
};

export default Object.freeze(profile);
