const connectors = {
  page_title: 'コネクタ',
  title: 'コネクタ',
  subtitle: 'コネクタを設定して、パスワードレスおよびソーシャルサインイン体験を有効にします',
  create: 'ソーシャルコネクタを追加',
  config_sie_notice: 'コネクタを設定しました。<a>{{link}}</a>で設定を確認してください。',
  config_sie_link_text: 'サインイン体験',
  tab_email_sms: 'メールと SMS のコネクタ',
  tab_social: 'ソーシャルコネクタ',
  connector_name: 'コネクタ名',
  demo_tip:
    'このデモコネクタの許容される最大メッセージ数は 100 件に限定されており、本番環境での展開は推奨されません。',
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
    'Logto は、標準プロトコルを使用して独自のソーシャルサインインコネクタを作成できるとともに、多くの一般的に使用されているソーシャルサインインコネクタを提供しています。',
  save_and_done: '保存して完了',
  type: {
    email: 'メールコネクタ',
    sms: 'SMS コネクタ',
    social: 'ソーシャルコネクタ',
  },
  setup_title: {
    email: 'メールコネクタの設定',
    sms: 'SMS コネクタの設定',
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
    connector_logo: 'コネクタロゴ',
    connector_logo_tip: 'ロゴはコネクタサインインボタンに表示されます。',
    target: 'Identity Provider の名前',
    target_placeholder: 'コネクタ Identity Provider の名前を入力',
    target_tip: '「IdP 名」として、ソーシャル ID を識別するための一意の識別子文字列を指定します。',
    target_tip_standard:
      '「IdP 名」として、ソーシャル ID を識別するための一意の識別子文字列を指定します。この設定は、コネクタが作成された後に変更できません。',
    target_tooltip:
      'Logto のソーシャルコネクタでの「IdP 名」とは、ソーシャル ID の「ソース」を指します。「IdP 名」は、Platform ごとに一意でなければならず、同じ名前は許可されません。「IdP 名」は一度作成されたコネクタで変更することはできません。<a>詳細を見る</a>',
    target_conflict:
      '入力された IdP 名は、既存の<span>name</span>コネクタと一致します。同じ IdP 名を使用すると、ユーザーが 2 つの異なるコネクタを通じて同じアカウントにアクセスする予期しないサインイン動作が発生する可能性があります。',
    target_conflict_line2:
      '以前のユーザーが再登録せずにサインインできるように、同じ Identity Provider を持つ現在のコネクタを削除し、新しいコネクタを "IdP 名" と同じで作成する場合は、前のユーザーが再登録せずにサインインできるように、同じ Identity Provider を持つ現在のコネクタを削除し、新しいコネクタを "IdP 名" で作成してください。',
    target_conflict_line3:
      '別の Identity Provider に接続する場合は、「IdP 名」を変更して続行してください。',
    config: '構成 JSON を入力してください',
    sync_profile: 'プロファイル情報の同期',
    sync_profile_only_at_sign_up: 'サインアップ時にのみ同期する',
    sync_profile_each_sign_in: 'サインインごとに同期する',
    sync_profile_tip:
      '基本プロファイル（ユーザーの名前やアバターなど）をソーシャルプロバイダから同期します。',
    callback_uri: 'Callback URI',
    callback_uri_description:
      'Redirect URI もしくはコールバック URI とも呼ばれ、Logto に戻る URI です。コピーしてソーシャルプロバイダの構成ページに貼り付けてください。',
    acs_url: 'アサーションコンシューマーサービス URL',
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
