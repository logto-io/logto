const tenants = {
  create_modal: {
    title: 'テナントを作成する',
    subtitle: 'リソースとユーザーを分離するには、新しいテナントを作成します。',
    create_button: 'テナントを作成する',
    tenant_name: 'テナント名',
    tenant_name_placeholder: '私のテナント',
    environment_tag: '環境タグ',
    environment_tag_description:
      'タグを使用して、テナント使用環境を区別します。各タグ内のサービスは同一であり、一貫性が保たれます。',
    environment_tag_development: '開発',
    environment_tag_staging: 'ステージング',
    environment_tag_production: 'プロダクション',
  },
  tenant_created: "{{name}}'のテナントが正常に作成されました。",
};

export default tenants;
