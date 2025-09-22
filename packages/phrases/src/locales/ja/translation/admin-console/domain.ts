const domain = {
  status: {
    connecting: '接続中...',
    in_use: '使用中',
    failed_to_connect: '接続に失敗しました',
  },
  update_endpoint_notice:
    'カスタムドメインを使用する場合は、アプリケーションのソーシャルコネクタコールバックURIとLogtoエンドポイントのドメインを更新することを忘れないでください。',
  error_hint: '{{value}} 秒後にもう一度確認するようにDNSレコードを更新してください。',
  custom: {
    custom_domain: 'カスタムドメイン',
    custom_domain_description:
      'ブランディングを向上させるために、カスタムドメインを利用してください。このドメインは、サインインエクスペリエンスで使用されます。',
    custom_domain_field: 'カスタムドメイン',
    custom_domain_placeholder: 'auth.domain.com',
    add_custom_domain_field: 'カスタムドメインを追加',
    custom_domains_field: 'カスタムドメイン',
    add_domain: 'ドメインを追加',
    invalid_domain_format:
      '有効なドメインURLを指定してください。最低3つの部分を含め、例："auth.domain.com."',
    verify_domain: 'ドメインを検証',
    enable_ssl: 'SSLを有効にする',
    checking_dns_tip:
      'DNSレコードを設定したら、最大で24時間かかる自動プロセスを待つ必要があります。移動中や一時的に中断することができますが、この動作を削除しないでください。',
    enable_ssl_tip:
      'SSLを有効にするには、自動的に実行され、最大で24時間かかる場合があります。このインターフェースを実行中のままにしておくことができます。',
    generating_dns_records: 'DNSレコードを生成しています...',
    add_dns_records: 'DNSプロバイダに次のDNSレコードを追加してください。',
    dns_table: {
      type_field: 'タイプ',
      name_field: '名前',
      value_field: '値',
    },
    deletion: {
      delete_domain: 'ドメインを削除',
      reminder: 'カスタムドメインの削除',
      description: 'このカスタムドメインを削除してもよろしいですか？',
      in_used_description:
        'このカスタムドメイン「<span>{{domain}}</span>」を削除してもよろしいですか？',
      in_used_tip:
        '以前にソーシャルコネクタプロバイダまたはアプリ終了ポイントでこのカスタムドメインを使用して設定した場合、それらのURIをLogtoデフォルトドメイン「<span>{{domain}}</span>」に変更する必要があります。これは、ソーシャルサインインボタンを機能させるために必要です。',
      deleted: 'カスタムドメインを正常に削除しました！',
    },
    config_custom_domain_description:
      'アプリケーション、ソーシャルコネクタ、エンタープライズコネクタを設定するために、カスタムドメインを構成します。',
  },
  default: {
    default_domain: 'デフォルトドメイン',
    default_domain_description:
      'Logtoは、追加のセットアップなしで使用できる事前に構成されたデフォルトドメインを提供しています。このデフォルトドメインは、カスタムドメインを有効にしていない場合でもバックアップオプションとして機能します。',
    default_domain_field: 'Logtoデフォルトドメイン',
  },
  custom_endpoint_note:
    'これらのエンドポイントのドメイン名を必要に応じてカスタマイズできます。 "{{custom}}" または "{{default}}" のいずれかを選択してください。',
  custom_social_callback_url_note:
    'このURIのドメイン名をアプリケーションのエンドポイントに合わせてカスタマイズできます。 "{{custom}}" または "{{default}}" のいずれかを選択してください。',
  custom_acs_url_note:
    'このURIのドメイン名をアイデンティティプロバイダのアサーションコンシューマーサービスURLに合わせてカスタマイズできます。 "{{custom}}" または "{{default}}" のいずれかを選択してください。',
  switch_custom_domain_tip:
    '対応するエンドポイントを表示するにはドメインを切り替えてください。<a>カスタムドメイン</a> からさらに追加できます。',
  switch_saml_app_domain_tip:
    '対応する URL を表示するにはドメインを切り替えてください。SAML プロトコルではメタデータ URL はアクセス可能な任意のドメインでホストできますが、選択したドメインが SP がエンドユーザーを認証にリダイレクトする SSO サービス URL を決定し、ログイン体験と URL の表示に影響します。',
  switch_saml_connector_domain_tip:
    '対応する URL を表示するにはドメインを切り替えてください。選択したドメインは ACS URL を決定し、SSO ログイン後のリダイレクト先に影響します。アプリの期待するリダイレクト動作に合うドメインを選択してください。',
};

export default Object.freeze(domain);
