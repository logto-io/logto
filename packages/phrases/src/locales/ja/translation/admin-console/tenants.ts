const tenants = {
  title: '設定',
  description: 'テナントの設定を効率的に管理し、ドメインをカスタマイズします。',
  tabs: {
    settings: '設定',
    domains: 'ドメイン',
    subscription: 'プランと請求',
    billing_history: '請求履歴',
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
  create_modal: {
    title: 'テナントを作成する',
    subtitle: 'リソースとユーザーを分離するには、新しいテナントを作成します。',
    create_button: 'テナントを作成する',
    tenant_name_placeholder: '私のテナント',
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
  tenant_landing_page: {
    title: 'まだテナントを作成していません',
    description:
      'Logto でプロジェクトを設定するには、新しいテナントを作成してください。ログアウトまたはアカウントを削除する必要がある場合は、右上隅のアバターボタンをクリックしてください。',
    create_tenant_button: 'テナントを作成',
  },
  status: {
    mau_exceeded: 'MAUの制限を超えました',
    suspended: '一時停止中',
    overdue: '期限切れ',
  },
  tenant_suspended_page: {
    title: 'テナントが一時停止されました。アクセスを復元するにはお問い合わせください。',
    description_1:
      '誠に申し訳ありませんが、ご利用のテナントアカウントが一時的に停止されました。MAU制限を超えた、支払いの遅延、その他の不正な操作などが原因です。',
    description_2:
      '詳細な説明や懸念事項がある場合、または機能を完全に復元しテナントをアンブロックする場合は、直ちにお問い合わせください。',
    contact_us: 'お問い合わせ',
  },
};

export default tenants;
