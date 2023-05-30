const domain = {
  status: {
    connecting: '接続中',
    in_used: '使用中',
    failed_to_connect: '接続に失敗しました',
  },
  update_endpoint_alert: {
    description:
      'カスタムドメインの設定が正常に完了しました。以前に以下のリソースを設定していた場合は、使用していたドメインを{{domain}}に更新することを忘れないでください。',
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
    custom_domain_placeholder: 'yourdomain.com',
    add_domain: 'ドメインを追加',
    invalid_domain_format: '無効なドメイン形式です',
    steps: {
      add_records: {
        title: '次のDNSレコードをDNSプロバイダに追加します',
        generating_dns_records: 'DNSレコードを生成しています...',
        table: {
          type_field: 'タイプ',
          name_field: '名前',
          value_field: '値',
        },
        finish_and_continue: '完了して続行',
      },
      verify_domain: {
        title: 'DNSレコードの接続を自動的に確認します',
        description:
          'このプロセスは自動的に行われますが、数分（最大24時間）かかる場合があります。実行中にこのインターフェースを終了しても構いません。',
        error_message: '確認に失敗しました。ドメイン名またはDNSレコードを確認してください。',
      },
      generate_ssl_cert: {
        title: 'SSL証明書を自動的に生成します',
        description:
          'このプロセスは自動的に行われますが、数分（最大24時間）かかる場合があります。実行中にこのインターフェースを終了しても構いません。',
        error_message: 'SSL証明書の生成に失敗しました。',
      },
      enable_domain: 'カスタムドメインを自動的に有効にします',
    },
    deletion: {
      delete_domain: 'ドメインを削除',
      reminder: 'カスタムドメインを削除',
      description: 'このカスタムドメインを削除してもよろしいですか？',
      in_used_description: 'このカスタムドメイン "{{domain}}" を削除してもよろしいですか？',
      in_used_tip:
        '以前にこのカスタムドメインをソーシャルコネクタプロバイダまたはアプリケーションエンドポイントに設定した場合は、まずURIをLogtoカスタムドメイン "{{domain}}" に変更する必要があります。これにより、ソーシャルサインインボタンが正常に機能します。',
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
