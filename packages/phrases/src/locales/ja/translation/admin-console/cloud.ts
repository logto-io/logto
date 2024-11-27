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
  },
  social_callback: {
    title: 'ログインが成功しました',
    description:
      'ソーシャルアカウントを使用して正常にサインインしました。Logto のすべての機能にシームレスにアクセスできるようにするために、独自のソーシャルコネクタを設定することをお勧めします。',
    /** UNTRANSLATED */
    notice:
      "Please avoid using the demo connector for production purposes. Once you've completed testing, kindly delete the demo connector and set up your own connector with your credentials.",
  },
  tenant: {
    create_tenant: 'テナントを作成する',
  },
};

export default Object.freeze(cloud);
