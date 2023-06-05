const tenant_settings = {
  title: 'テナント設定',
  description:
    'アカウントのセキュリティを確保するために、ここでアカウント設定を変更し、個人情報を管理します。',
  tabs: {
    settings: '設定',
    domains: 'ドメイン',
  },
  profile: {
    title: 'プロファイル設定',
    tenant_id: 'テナントID',
    tenant_name: 'テナント名',
    environment_tag: '環境タグ',
    environment_tag_description:
      'タグを使用してテナント使用環境を区別します。 各タグ内のサービスは同一で、一貫性が保たれます。',
    environment_tag_development: '開発',
    environment_tag_staging: 'ステージング',
    environment_tag_production: 'プロダクション',
  },
};

export default tenant_settings;
