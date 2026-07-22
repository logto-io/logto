const cloud = {
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
