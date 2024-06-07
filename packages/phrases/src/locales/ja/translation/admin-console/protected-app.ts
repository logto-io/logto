const protected_app = {
  name: '保護されたアプリ',
  title: '保護されたアプリを作成：シンプルさとエピックなスピードで認証を追加',
  description:
    '保護されたアプリはユーザーセッションを安全に維持し、アプリのリクエストをプロキシします。Cloudflare Workersによって強力なパフォーマンスと世界中で0msの起動時間をお楽しみください。<a>さらに詳しく</a>',
  fast_create: '高速作成',
  modal_title: '保護されたアプリを作成',
  modal_subtitle:
    'クリックするだけで安全で高速な保護を有効にします。既存のWebアプリに簡単に認証を追加します。',
  form: {
    url_field_label: '元のURL',
    url_field_placeholder: 'https://domain.com/',
    url_field_description: '認証保護が必要なアプリのアドレスを提供してください。',
    url_field_modification_notice:
      '元のURLへの変更は、グローバルネットワークロケーション全体で有効になるまで1〜2分かかる場合があります。',
    url_field_tooltip:
      "アプリケーションのアドレスを提供します。'/pathname'を含まないでください。作成後、ルート認証ルールをカスタマイズできます。\n\n注意：元のURLそのものには認証が必要ではありません。指定されたアプリドメイン経由でのアクセスにのみ保護が適用されます。",
    domain_field_label: 'アプリドメイン',
    domain_field_placeholder: 'your-domain',
    domain_field_description:
      'このURLは元のURLの認証保護プロキシとして機能します。作成後、カスタムドメインを適用できます。',
    domain_field_description_short: 'このURLは元のURLの認証保護プロキシとして機能します。',
    domain_field_tooltip:
      "Logtoによって保護されたアプリは、デフォルトで 'your-domain.{{domain}}' でホストされます。作成後にカスタムドメインを適用できます。",
    create_application: 'アプリケーションを作成',
    create_protected_app: '高速作成',
    errors: {
      domain_required: 'アプリドメインが必要です。',
      domain_in_use: 'このサブドメイン名は既に使用されています。',
      invalid_domain_format:
        '無効なサブドメイン形式：小文字のアルファベット、数字、ハイフン「-」のみを使用してください。',
      url_required: '元のURLが必要です。',
      invalid_url:
        "無効な元のURL形式：http://またはhttps://を使用してください。注：'/pathname' は現在サポートされていません。",
      localhost:
        'まずローカルサーバーをインターネットに公開してください。<a>ローカル開発についてさらに詳しく</a>。',
    },
  },
  success_message:
    '🎉 アプリ認証が正常に有効化されました！Webサイトの新しいエクスペリエンスをご覧ください。',
};

export default Object.freeze(protected_app);
