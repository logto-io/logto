const connectors = {
  page_title: 'コネクタ',
  title: 'コネクタ',
  subtitle: 'コネクタを設定して、パスワードレスおよびソーシャルサインイン体験を有効にします',
  create: 'ソーシャルコネクタを追加',
  config_sie_notice: 'コネクタを設定しました。<a>{{link}}</a>で設定を確認してください。',
  config_sie_link_text: 'サインイン体験',
  tab_email_sms: 'メールとSMSのコネクタ',
  tab_social: 'ソーシャルコネクタ',
  connector_name: 'コネクタ名',
  demo_tip:
    'このデモコネクタの許容される最大メッセージ数は100件に限定されており、本番環境での展開は推奨されません。',
  social_demo_tip:
    'このデモコネクタは実演目的にのみ使用するように設計されており、本番環境での展開は推奨されません。',
  connector_type: 'タイプ',
  connector_status: 'サインイン体験',
  connector_status_in_use: '使用中',
  connector_status_not_in_use: '未使用',
  not_in_use_tip: {
    content:
      '未使用は、サインイン体験でこのサインイン方法が使用されていないことを意味します。<a>{{link}}</a>でこのサインイン方法を追加してください。',
    go_to_sie: 'サインイン体験に進む',
  },
  placeholder_title: 'ソーシャルコネクタ',
  placeholder_description:
    'Logtoは、標準プロトコルを使用して独自のソーシャルサインインコネクタを作成できるとともに、多くの一般的に使用されているソーシャルサインインコネクタを提供しています。',
  save_and_done: '保存して完了',
  type: {
    email: 'メールコネクタ',
    sms: 'SMSコネクタ',
    social: 'ソーシャルコネクタ',
  },
  setup_title: {
    email: 'メールコネクタの設定',
    sms: 'SMSコネクタの設定',
    social: 'ソーシャルコネクタを追加',
  },
  guide: {
    subtitle: 'コネクタの設定手順',
    general_setting: '全般設定',
    parameter_configuration: 'パラメータ設定',
    test_connection: '接続テスト',
    name: 'ソーシャルサインインボタンの名前',
    name_placeholder: 'ソーシャルサインインボタンの名前を入力',
    name_tip:
      'コネクタボタンの名前は「{{name}}で続ける」で表示されます。名前が長くなりすぎないように注意してください。',
    logo: 'ソーシャルサインインボタンのロゴURL',
    logo_placeholder: 'https://your.cdn.domain/logo.png',
    logo_tip:
      'ロゴ画像はコネクタに表示されます。一般的にアバターやトンマークなどを使用します。公開アクセス可能な画像リンクを取得し、リンクをここに挿入してください。',
    logo_dark: 'ソーシャルサインインボタンのロゴURL（ダークモード）',
    logo_dark_placeholder: 'https://your.cdn.domain/logo.png',
    logo_dark_tip: 'ダークモードでコネクタのロゴを設定してください。',
    logo_dark_collapse: '折りたたむ',
    logo_dark_show: 'ダークモード用のロゴ設定を表示',
    target: 'Identity Providerの名前',
    target_placeholder: 'コネクタIdentity Providerの名前を入力',
    target_tip: '「IdP名」として、ソーシャルIDを識別するための一意の識別子文字列を指定します。',
    target_tip_standard:
      '「IdP名」として、ソーシャルIDを識別するための一意の識別子文字列を指定します。この設定は、コネクタが作成された後に変更できません。',
    target_tooltip:
      'Logtoのソーシャルコネクタでの「IdP名」とは、ソーシャルIDの「ソース」を指します。「IdP名」は、Plat formごとに一意でなければならず、同じ名前は許可されません。「IdP名」は一度作成されたコネクタで変更することはできません。<a>詳細を見る</a>',
    target_conflict:
      '入力されたIdP名は、既存の<span>name</span>コネクタと一致します。同じIdP名を使用すると、ユーザーが2つの異なるコネクタを通じて同じアカウントにアクセスする予期しないサインイン動作が発生する可能性があります。',
    target_conflict_line2:
      '以前のユーザーが再登録せずにサインインできるように、同じIdentity Providerを持つ現在のコネクタを削除し、新しいコネクタを "IdP名" と同じで作成する場合は、前のユーザーが再登録せずにサインインできるように、同じIdentity Providerを持つ現在のコネクタを削除し、新しいコネクタを "IdP名" で作成してください。',
    target_conflict_line3:
      '別のIdentity Providerに接続する場合は、「IdP名」を変更して続行してください。',
    config: '構成JSONを入力してください',
    sync_profile: 'プロファイル情報の同期',
    sync_profile_only_at_sign_up: 'サインアップ時にのみ同期する',
    sync_profile_each_sign_in: 'サインインごとに同期する',
    sync_profile_tip:
      '基本プロファイル（ユーザーの名前やアバターなど）をソーシャルプロバイダから同期します。',
    callback_uri: 'Callback URI',
    callback_uri_description:
      'Redirect URIもしくはコールバックURIとも呼ばれ、Logtoに戻るURIです。コピーしてソーシャルプロバイダの構成ページに貼り付けてください。',
    acs_url: 'アサーションコンシューマーサービスURL',
  },
  platform: {
    universal: 'ユニバーサル',
    web: 'Web',
    native: 'ネイティブ',
  },
  add_multi_platform:
    'は複数のプラットフォームをサポートしています。続行するプラットフォームを選択してください。',
  drawer_title: 'コネクターガイド',
  drawer_subtitle: 'インテグレーションの手順に従ってください',
  unknown: '不明なコネクタ',
  standard_connectors: '標準コネクタ',
};

export default Object.freeze(connectors);
