const security = {
  page_title: 'セキュリティ',
  title: 'セキュリティ',
  subtitle: '高度な攻撃に対する高度な保護を構成します。',
  bot_protection: {
    title: 'ボット保護',
    description:
      'サインアップ、サインイン、パスワード回復に CAPTCHA を有効にして、自動的な脅威をブロックします。',
    captcha: {
      title: 'CAPTCHA',
      placeholder: 'CAPTCHA プロバイダーを選択し、統合を設定します。',
      add: 'CAPTCHA を追加',
    },
    settings: '設定',
    captcha_required_flows: 'CAPTCHA が必要なフロー',
    sign_up: 'サインアップ',
    sign_in: 'サインイン',
    forgot_password: 'パスワードを忘れた',
  },
  create_captcha: {
    setup_captcha: 'CAPTCHA をセットアップ',
  },
  captcha_providers: {
    recaptcha_enterprise: {
      name: 'reCAPTCHA Enterprise',
      description:
        'Google の企業向け CAPTCHA ソリューション。高度な脅威検出と詳細なセキュリティ分析を提供し、不正行為からウェブサイトを保護します。',
    },
    turnstile: {
      name: 'Cloudflare Turnstile',
      description:
        'Cloudflare のスマート CAPTCHA 代替案。視覚的パズルを用いず、シームレスなユーザー体験を提供しながらボット保護を実現します。',
    },
  },
  captcha_details: {
    back_to_security: 'セキュリティへ戻る',
    page_title: 'CAPTCHA の詳細',
    check_readme: 'README をチェック',
    options_change_captcha: 'CAPTCHA プロバイダーを変更',
    connection: '接続',
    description: 'CAPTCHA 接続を構成します。',
    site_key: 'サイトキー',
    secret_key: 'シークレットキー',
    project_id: 'プロジェクト ID',
    deletion_description: 'この CAPTCHA プロバイダーを削除してもよろしいですか？',
    captcha_deleted: 'CAPTCHA プロバイダーが正常に削除されました',
    setup_captcha: 'CAPTCHA をセットアップ',
  },
};

export default Object.freeze(security);
