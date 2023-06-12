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
  delete_modal: {
    title: 'テナントを削除します',
    description_line1:
      '"<span>{{name}}</span>" というテナント ("<span>{{tag}}</span>" の環境タグを持つ) を削除してもよろしいですか？ このアクションは元に戻せません。これにより、すべてのデータとアカウント情報が永久に削除されます。',
    description_line2:
      'アカウントの削除前に、お手伝いできるかもしれません。 <span><a>メールでお問い合わせください</a></span>。',
    description_line3:
      '続行する場合は、テナント名 "<span>{{name}}</span>" を入力して確認してください。',
    delete_button: '完全に削除する',
  },
  tenant_created: "{{name}}'のテナントが正常に作成されました。",
};

export default tenants;
