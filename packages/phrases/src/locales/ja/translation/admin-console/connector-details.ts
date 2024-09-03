const connector_details = {
  page_title: 'コネクターの詳細',
  back_to_connectors: 'コネクタに戻る',
  check_readme: 'READMEを確認する',
  settings: '一般設定',
  settings_description:
    'コネクタは Logto に不可欠です。Logto はコネクタのおかげでエンドユーザーがパスワードレス登録またはサインインを利用し、ソーシャルアカウントでサインインすることができる機能を提供することができます。',
  parameter_configuration: 'パラメーター設定',
  test_connection: 'テスト',
  save_error_empty_config: '設定を入力してください',
  send: '送信',
  send_error_invalid_format: '入力が無効です',
  edit_config_label: 'JSONを入力してください',
  test_email_sender: 'メールコネクタのテスト',
  test_sms_sender: 'SMS コネクタのテスト',
  test_email_placeholder: 'john.doe@example.com',
  test_sms_placeholder: '+1 555-123-4567',
  test_message_sent: 'テストメッセージが送信されました',
  test_sender_description:
    'Logto はテストのために「共通」テンプレートを使用しています。コネクタが正しく構成されている場合、メッセージを受信します。',
  options_change_email: 'メールコネクタの変更',
  options_change_sms: 'SMS コネクタの変更',
  connector_deleted: 'コネクタが正常に削除されました',
  type_email: 'メールコネクタ',
  type_sms: 'SMS コネクタ',
  type_social: 'ソーシャルコネクタ',
  in_used_social_deletion_description:
    'このコネクタはあなたのサインイン体験で使用されています。削除すると、サインイン体験設定のサインイン体験が削除されます。再追加する場合は再設定する必要があります。',
  in_used_passwordless_deletion_description:
    'この{{name}}はあなたのサインイン体験で使用されています。削除すると、競合が解決されるまでサインイン体験が正常に機能しません。再追加する場合は再設定する必要があります。',
  deletion_description:
    'このコネクタを削除します。元に戻すことはできず、再追加する場合は再設定する必要があります。',
  logto_email: {
    total_email_sent: '総送信数: {{value, number}}',
    total_email_sent_tip:
      'Logto はセキュアかつ安定した組み込みメールのために SendGrid を利用しています。完全に無料です。<a>詳細を見る</a>',
    email_template_title: 'メールテンプレート',
    template_description:
      '組み込みのメールは、シームレスな認証メールの配信のためにデフォルトのテンプレートを使用します。設定は必要ありません。基本的なブランド情報をカスタマイズできます。',
    template_description_link_text: 'テンプレートを表示',
    description_action_text: 'テンプレートを表示',
    from_email_field: '送信元メールアドレス',
    sender_name_field: '送信元名',
    sender_name_tip:
      'メールの送信元名をカスタマイズします。空白の場合、「Verification」がデフォールト名として使用されます。',
    sender_name_placeholder: '送信元の名前を入力してください',
    company_information_field: '企業情報',
    company_information_description:
      'メールの下部に会社名、住所、郵便番号などを表示して、真正性を高めます。',
    company_information_placeholder: '会社の基本情報を入力してください',
    email_logo_field: 'メール ロゴ',
    email_logo_tip:
      'メールの上部にブランドロゴを表示します。ライトモードとダークモードの両方で同じ画像を使用します。',
    urls_not_allowed: 'URLは許可されません',
    test_notes: 'Logto はテストのために「共通」テンプレートを使用しています。',
  },
  google_one_tap: {
    title: 'Google ワンタップ',
    description:
      'Google ワンタップは、ユーザーがあなたのウェブサイトにサインインするための安全で簡単な方法です。',
    enable_google_one_tap: 'Google ワンタップを有効にする',
    enable_google_one_tap_description:
      'サインインエクスペリエンスでGoogle ワンタップを有効にします。ユーザーがデバイスにサインインしている場合、Google アカウントを使用してすぐにサインアップまたはサインインできます。',
    configure_google_one_tap: 'Google ワンタップを設定する',
    auto_select: '可能であれば資格情報を自動選択',
    close_on_tap_outside: '外側をクリック／タップした場合にプロンプトをキャンセル',
    itp_support: '<a>ITP ブラウザでアップグレードされたワンタップ UX</a> を有効にする',
  },
};

export default Object.freeze(connector_details);
