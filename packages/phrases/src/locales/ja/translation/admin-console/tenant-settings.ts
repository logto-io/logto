const tenant_settings = {
  title: '設定',
  description: 'テナントの設定を効率的に管理し、ドメインをカスタマイズします。',
  tabs: {
    settings: '設定',
    domains: 'ドメイン',
  },
  settings: {
    title: '設定',
    tenant_id: 'テナントID',
    tenant_name: 'テナント名',
    environment_tag: '環境タグ',
    environment_tag_description:
      'タグはサービスを変更しません。単にさまざまな環境を区別するためのガイドです。',
    environment_tag_development: '開発',
    environment_tag_staging: 'ステージング',
    environment_tag_production: '本番',
    tenant_info_saved: 'テナント情報は正常に保存されました。',
  },
  deletion_card: {
    title: '削除',
    tenant_deletion: 'テナントの削除',
    tenant_deletion_description:
      'テナントの削除は、関連するすべてのユーザーデータと設定の永久的な削除につながります。十分に注意して操作してください。',
    tenant_deletion_button: 'テナントを削除する',
  },
};

export default tenant_settings;
