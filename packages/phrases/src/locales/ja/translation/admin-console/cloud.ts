const cloud = {
  console_sso: {
    back_to_list: 'Console SSO に戻る',
    create: 'コネクターを追加',
    title: 'コンソール SSO',
    description:
      '独自のアイデンティティプロバイダーを設定して、シングルサインオンで Logto Console にサインインできます。',
    domain_bound: 'バインド済み',
    domain_pending: '検証中',
    domain_add_placeholder: 'メールドメインを追加',
    domain_bound_description:
      'このドメインは Console SSO で有効です。TXT 検証レコードは削除されました。',
    domain_dns_instructions:
      'ドメインの所有権を検証するため、DNS プロバイダーにこの TXT レコードを追加してください。',
    domain_waiting_for_dns: 'TXT レコードを待機中です。10 秒ごとに再確認します。',
    domain_proven_unbound:
      'ドメインの所有権は検証済みですが、バインドは未完了です。問題を解決して再試行してください。',
    domain_remove_description:
      '{{domain}} を Console SSO から削除しますか？バインド済みドメインを削除すると、そのメールアドレスの SSO 検出が停止します。',
    domain_invalid: '有効なメールドメインを入力してください。',
    domain_conflict: 'このドメインは別の Console SSO コネクターに既にバインドされています。',
    domain_invalid_provider: 'このドメインをバインドする前に接続設定を完了してください。',
    domain_dns_timeout: 'DNS の確認に失敗しました。自動的に再試行します。',
    domain_recovery: 'ドメインの変更は未完了です。検証を再試行して完了してください。',
    start_over: '最初からやり直す',
    start_over_confirmation:
      '最初からやり直すと、未完了の SSO 設定が削除される場合があります。続行しますか？',
    resume_creation:
      '未完了の作成操作が見つかりました。同じプロバイダーで続行して、このコネクターを復元してください。',
  },
  general: {
    onboarding: 'オンボーディング',
  },
  create_tenant: {
    page_title: 'テナントを作成',
    title: '最初のテナントを作成',
    description:
      'テナントはユーザーアイデンティティ、アプリケーション、およびその他すべての Logto リソースを管理するための独立した環境です。',
    invite_collaborators: 'メールでコラボレーターを招待',
    hear_about_us: {
      title: 'Logto を最初にどこで知りましたか?',
      detail_placeholder: '詳しく教えてください(任意)',
      options: {
        search_engine: '検索エンジン(Google、Bing など)',
        ai_assistant: 'AI アシスタント(ChatGPT、Claude、Gemini など)',
        github_oss: 'GitHub またはオープンソースディレクトリ',
        friend_colleague: '友人・同僚からの紹介',
        powered_by: 'Logto を利用しているアプリのサインインページ',
        content_social: 'SNS・記事・動画(YouTube、X、Reddit など)',
        other: 'その他',
      },
    },
  },
  social_callback: {
    title: 'ログインが成功しました',
    description:
      'ソーシャルアカウントを使用して正常にサインインしました。Logto のすべての機能にシームレスにアクセスできるようにするために、独自のソーシャルコネクタを設定することをお勧めします。',
    notice:
      'デモコネクタを運用目的で使用しないでください。テストが完了したら、デモコネクタを削除し、独自の資格情報でコネクタを設定してください。',
  },
  tenant: {
    create_tenant: 'テナントを作成する',
  },
};

export default Object.freeze(cloud);
