const domain = {
  status: {
    connecting: '接続中...',
    in_use: '使用中',
    failed_to_connect: '接続に失敗しました',
  },
  update_endpoint_notice:
    'カスタムドメインを使用する場合は、アプリケーションのソーシャルコネクタコールバックURIとLogtoエンドポイントのドメインを更新することを忘れないでください。 <a>{{link}}</a>',
  error_hint: '{{value}} 秒後にもう一度確認するようにDNSレコードを更新してください。',
  custom: {
    custom_domain: 'カスタムドメイン',
    custom_domain_description:
      'ブランディングを向上させるために、カスタムドメインを利用してください。このドメインは、サインインエクスペリエンスで使用されます。',
    custom_domain_field: 'カスタムドメイン',
    custom_domain_placeholder: 'your.domain.com',
    add_domain: 'ドメインを追加',
    invalid_domain_format:
      '無効なドメイン形式または少なくとも3つのサブドメインを含む有効なドメインを入力してください。',
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
  /** UNTRANSLATED */
  custom_acs_url_note:
    'You can customize the domain name of this URI to match your identity provider assertion consumer service URL. Choose either "{{custom}}" or "{{default}}".',
};

export default Object.freeze(domain);
