const security = {
  page_title: 'セキュリティ',
  title: 'セキュリティ',
  subtitle: '高度な攻撃に対する高度な保護を構成します。',
  tabs: {
    captcha: 'CAPTCHA',
    password_policy: 'パスワードポリシー',
    blocklist: 'ブロックリスト',
    general: '一般設定',
  },
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
    enable_captcha: 'CAPTCHA を有効化',
    enable_captcha_description:
      'サインアップ、サインイン、パスワード回復フローに CAPTCHA 検証を有効にします。',
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
    domain: 'ドメイン（オプション）',
    domain_placeholder: 'www.google.com（デフォルト）または recaptcha.net',
    recaptcha_key_id: 'reCAPTCHA キー ID',
    recaptcha_api_key: 'プロジェクトの API キー',
    deletion_description: 'この CAPTCHA プロバイダーを削除してもよろしいですか？',
    captcha_deleted: 'CAPTCHA プロバイダーが正常に削除されました',
    setup_captcha: 'CAPTCHA をセットアップ',
    mode: '認証モード',
    mode_invisible: '非表示',
    mode_checkbox: 'チェックボックス',
    mode_notice:
      '認証モードは Google Cloud Console の reCAPTCHA キー設定で定義されています。ここでモードを変更するには、一致するキータイプが必要です。',
  },
  password_policy: {
    password_requirements: 'パスワードの要件',
    password_requirements_description:
      '資格情報の詰め込み攻撃や弱いパスワード攻撃に対抗するため、パスワードの要件を強化します。',
    minimum_length: '最小の長さ',
    minimum_length_description:
      'NISTは、Web製品に対して少なくとも8文字を使用することを提案しています。',
    minimum_length_error: '最小の長さは {{min}} から {{max}}（両方含む）の間でなければなりません。',
    minimum_required_char_types: '必要な文字の種類の最小数',
    minimum_required_char_types_description:
      '文字の種類：大文字（A-Z）、小文字（a-z）、数字（0-9）、特殊記号（{{symbols}}）。',
    password_rejection: 'パスワードの拒否',
    compromised_passwords: '危険なパスワードの拒否',
    breached_passwords: '漏洩したパスワードの拒否',
    breached_passwords_description:
      '以前に漏洩したデータベースで見つかったパスワードを拒否します。',
    restricted_phrases: '低セキュリティフレーズの制限',
    restricted_phrases_tooltip:
      'パスワードにこれらのフレーズを使用しないでください。ただし、追加の文字を3文字以上組み合わせる場合は例外です。',
    repetitive_or_sequential_characters: '繰り返しまたは連続する文字',
    repetitive_or_sequential_characters_description: '「AAAA」、「1234」、「abcd」などです。',
    user_information: 'ユーザー情報',
    user_information_description: '例: メールアドレス、電話番号、ユーザー名など。',
    custom_words: 'カスタムワード',
    custom_words_description:
      '特定の文脈に関連するワードを、大文字小文字を区別せずに、1つの行に1つずつ追加します。',
    custom_words_placeholder: 'サービス名、会社名など',
  },
  sentinel_policy: {
    card_title: '識別子によるロックアウト',
    card_description:
      'すべてのユーザーはデフォルト設定でロックアウトを利用できますが、カスタマイズすることでより多くの制御が可能です。\n\n複数の認証失敗（例えば、連続した間違ったパスワードや確認コード）後に識別子を一時的にロックし、ブルートフォースアクセスを防ぎます。',
    enable_sentinel_policy: {
      title: 'ロックアウト体験をカスタマイズ',
      description:
        'ロックアウト前の最大失敗ログイン試行回数、ロックアウト期間、および直ちに手動で解除する機能をカスタマイズできるようにします。',
    },
    max_attempts: {
      title: '最大失敗試行回数',
      description: '最大失敗ログイン試行回数に達した後に識別子を一時的にロックします。',
      error_message: '最大失敗試行回数は 0 より大きくなければなりません。',
    },
    lockout_duration: {
      title: 'ロックアウト期間（分）',
      description: '最大の失敗試行回数を超えた後、一定期間サインインをブロックします。',
      error_message: 'ロックアウト期間は少なくとも 1 分でなければなりません。',
    },
    manual_unlock: {
      title: '手動での解除',
      description: 'ユーザーの身元確認と識別子の入力により、即座にロックを解除します。',
      unblock_by_identifiers: '識別子での解除',
      modal_description_1:
        '識別子はサインイン/サインアップの複数の失敗により一時的にロックされました。セキュリティを保護するため、ロックアウト期間後にアクセスが自動的に復元されます。',
      modal_description_2:
        'ユーザーの身元を確認し、無許可のアクセス試行がないことを確認した場合にのみ、手動でロックを解除してください。',
      placeholder: '識別子を入力してください (メールアドレス / 電話番号 / ユーザー名)',
      confirm_button_text: '今すぐ解除',
      success_toast: '正常に解除されました',
      duplicate_identifier_error: '識別子は既に追加されています',
      empty_identifier_error: '少なくとも 1 つの識別子を入力してください',
    },
  },
  blocklist: {
    card_title: 'メールブロックリスト',
    card_description:
      'ハイリスクまたは不要なメールアドレスをブロックすることで、ユーザーベースを制御します。',
    disposable_email: {
      title: '使い捨てメールアドレスをブロック',
      description:
        'スパムを防止し、ユーザーの質を向上させるために、使い捨てや一時のメールアドレスを使用したサインアップ試行を拒否することを有効にします。',
    },
    email_subaddressing: {
      title: 'メールサブアドレッシングをブロック',
      description:
        'メールサブアドレスをプラス記号（+）と追加の文字（例：user+alias@foo.com）で使用するサインアップ試行を拒否できるようにします。',
    },
    custom_email_address: {
      title: 'カスタムメールアドレスをブロック',
      description:
        'UI を介して登録またはリンクできない特定のメールドメインまたはメールアドレスを追加します。',
      placeholder:
        'ブロックするメールアドレスまたはドメインを入力してください（例：bar@example.com、@example.com）',
      duplicate_error: 'メールアドレスまたはドメインは既に追加されています',
      invalid_format_error:
        '有効なメールアドレス（bar@example.com）またはドメイン（@example.com）である必要があります',
    },
  },
};

export default Object.freeze(security);
