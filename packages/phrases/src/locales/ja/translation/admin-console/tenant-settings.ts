const tenant_settings = {
  title: '設定',
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
      'タグの異なるサービスは同一です。環境を区別するためにチームを支援する接尾辞として機能します。',
    environment_tag_development: 'Dev',
    environment_tag_staging: 'Staging',
    environment_tag_production: 'Prod',
    tenant_info_saved: 'テナント情報は正常に保存されました。',
  },
  deletion_card: {
    title: '削除',
    tenant_deletion: 'テナントの削除',
    tenant_deletion_description:
      'アカウントを削除すると、すべての個人情報、ユーザーデータ、および構成が削除されます。この操作は元に戻すことはできません。',
    tenant_deletion_button: 'テナントを削除する',
  },
};

export default tenant_settings;
