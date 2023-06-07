const domain = {
  status: {
    connecting: '接続中',
    in_used: '使用中',
    failed_to_connect: '接続に失敗しました',
  },
  update_endpoint_alert: {
    deleted: 'カスタムドメインを正常に削除しました！',
    set_up: 'カスタムドメインが正常に設定されました。',
    update_tip:
      '以前にリソースを設定した場合は、<social-link>{{socialLink}}</social-link>と<app-link>{{appLink}}</app-link>に使用するドメインを更新することをお忘れなく。',
    callback_uri_text: 'ソーシャルコネクタのコールバックURI',
    application_text: 'アプリケーションのLogtoエンドポイント',
  },
  error_hint: '{{value}} 秒後にもう一度確認するようにDNSレコードを更新してください。',
  custom: {
    custom_domain: 'カスタムドメイン',
    custom_domain_description:
      'ブランドの一貫性を維持し、ユーザーのサインインエクスペリエンスをカスタマイズするために、Logtoのデフォルトのドメインをカスタムのドメインに置き換えてください。',
    custom_domain_field: 'カスタムドメイン',
    custom_domain_placeholder: 'your.domain.com',
    add_domain: 'ドメインを追加',
    invalid_domain_format:
      '無効なドメイン形式または少なくとも3つのサブドメインを含む有効なドメインを入力してください。',
    verify_domain: 'ドメインを検証',
    enable_ssl: 'SSLを有効化',
    checking_dns_tip:
      'DNSレコードを設定したら、最大で24時間かかる自動プロセスを待つ必要があります。移動中や一時的に中断することができますが、この動作を削除しないでください。',
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
        'このカスタムドメイン "<span>{{domain}}</span>" を削除してもよろしいですか？',
      in_used_tip:
        '以前にソーシャルコネクタプロバイダまたはアプリエンドポイントでこのカスタムドメインを使用して設定した場合、それらのURIをLogtoデフォルトドメイン "<span>{{domain}}</span>" に変更する必要があります。これは、ソーシャルサインインボタンを機能させるために必要です。',
      deleted: 'カスタムドメインを正常に削除しました！',
    },
  },
  default: {
    default_domain: 'デフォルトドメイン',
    default_domain_description:
      'デフォルトのLogtoドメインは常に利用可能であり、アプリケーションに必要なサインイン用のドメインを提供します。',
    default_domain_field: 'Logtoデフォルトドメイン',
  },
};

export default domain;
