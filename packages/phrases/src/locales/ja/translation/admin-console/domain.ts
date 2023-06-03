const domain = {
  status: {
    connecting: '接続中',
    in_used: '使用中',
    failed_to_connect: '接続に失敗しました',
  },
  update_endpoint_alert: {
    description:
      'カスタムドメインの設定が正常に完了しました。以前に以下のリソースを設定していた場合は、使用していたドメインを <span>{{domain}}</span> に更新することを忘れないでください。',
    endpoint_url: '<a>{{link}}</a>のエンドポイントURL',
    application_settings_link_text: 'アプリケーション設定',
    callback_url: '<a>{{link}}</a>のコールバックURL',
    social_connector_link_text: 'ソーシャルコネクタ',
    api_identifier: '<a>{{link}}</a>のAPI識別子',
    uri_management_api_link_text: 'URI管理API',
    tip: '設定を変更した後、サインインエクスペリエンスの<a>{{link}}</a>でテストすることができます。',
  },
  custom: {
    custom_domain: 'カスタムドメイン',
    custom_domain_description:
      'デフォルトのドメインを独自のドメインに置き換えて、ブランドの一貫性を保ち、ユーザーのサインインエクスペリエンスを個別にカスタマイズします。',
    custom_domain_field: 'カスタムドメイン',
    custom_domain_placeholder: 'your.domain.com',
    add_domain: 'ドメインを追加',
    invalid_domain_format:
      'サブドメインの形式が無効です。サブドメインを少なくとも3つ含むサブドメインを入力してください。',
    verify_domain: 'ドメインを検証',
    enable_ssl: 'SSLを有効化',
    checking_dns_tip:
      'DNSレコードを設定した後、プロセスが自動的に実行され、最大24時間かかる場合があります。この間このインターフェースを開いたままにすることができます。',
    generating_dns_records: 'DNSレコードを生成しています...',
    add_dns_records: '以下のDNSレコードをDNSプロバイダに追加してください。',
    dns_table: {
      type_field: 'タイプ',
      name_field: '名前',
      value_field: '値',
    },
    deletion: {
      delete_domain: 'ドメインを削除',
      reminder: 'カスタムドメインを削除',
      description: 'このカスタムドメインを削除してもよろしいですか？',
      in_used_description:
        'このカスタムドメイン "<span>{{domain}}</span>" を削除してもよろしいですか？',
      in_used_tip:
        'このカスタムドメインを以前に<br/>ソーシャルコネクタプロバイダまたはアプリケーションエンドポイントで設定した場合、そのURIをLogtoのデフォルトドメイン"<span>{{domain}}</span>"に変更する必要があります。これは、ソーシャルサインインボタンが正常に機能するために必要です。',
      deleted: 'カスタムドメインを正常に削除しました！',
    },
  },
  default: {
    default_domain: 'デフォルトドメイン',
    default_domain_description:
      '直接オンラインで使用できるデフォルトのドメイン名を提供しています。カスタムドメインに切り替えても、常にアクセスできるため、サインインに必要なアプリケーションが常に利用できます。',
    default_domain_field: 'Logtoデフォルトドメイン',
  },
};

export default domain;
