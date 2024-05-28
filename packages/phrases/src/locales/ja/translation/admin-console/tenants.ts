const tenants = {
  title: '設定',
  description: 'テナントの設定を効率的に管理し、ドメインをカスタマイズします。',
  tabs: {
    settings: '設定',
    members: 'メンバー',
    domains: 'ドメイン',
    subscription: 'プランと請求',
    billing_history: '請求履歴',
  },
  settings: {
    title: '設定',
    description: 'テナント名を設定し、ホストされているデータの地域とテナントタイプを表示します。',
    tenant_id: 'テナントID',
    tenant_name: 'テナント名',
    tenant_region: 'データがホストされている地域',
    tenant_region_tip: 'テナントのリソースは{{region}}にホストされています。 <a>詳細</a>',
    environment_tag_development: '開発',
    environment_tag_production: '本番',
    tenant_type: 'テナントタイプ',
    development_description:
      'テスト用であり、本番で使用すべきではありません。サブスクリプションは必要ありません。すべてのプロの機能がありますが、サインインバナーなどの制限があります。<a>詳細</a>',
    production_description:
      'エンドユーザーに使用することを意図しており、有料のサブスクリプションが必要なアプリ向け。<a>詳細</a>',
    tenant_info_saved: 'テナント情報は正常に保存されました。',
  },
  full_env_tag: {
    development: '開発',
    production: '本番',
  },
  deletion_card: {
    title: '削除',
    tenant_deletion: 'テナントの削除',
    tenant_deletion_description:
      'テナントの削除は、関連するすべてのユーザーデータと設定の永久的な削除につながります。十分に注意して操作してください。',
    tenant_deletion_button: 'テナントを削除する',
  },
  leave_tenant_card: {
    title: '退出',
    leave_tenant: 'テナントを退出する',
    leave_tenant_description:
      'テナント内のリソースは保持されますが、これ以上このテナントにアクセスできません。',
    last_admin_note:
      'このテナントを退出するには、少なくとも1人の他のメンバーが管理者の役割を持つことを確認してください。',
  },
  create_modal: {
    title: 'テナントを作成する',
    subtitle:
      '分離されたリソースとユーザーを持つ新しいテナントを作成します。データがホストされる地域とテナントの種類は作成後に変更できません。',
    tenant_usage_purpose: 'このテナントを使用する目的は何ですか？',
    development_description:
      'テスト用であり、本番で使用すべきではありません。サブスクリプションは必要ありません。',
    development_hint: 'すべてのプロの機能がありますが、サインインバナーなどの制限があります。',
    production_description:
      'エンドユーザーに使用することを意図しており、有料のサブスクリプションが必要なアプリ向け。',
    available_plan: '利用可能なプラン:',
    create_button: 'テナントを作成する',
    tenant_name_placeholder: '私のテナント',
  },
  dev_tenant_migration: {
    title: '新しい「開発テナント」を作成して、プロの機能を無料でお試しできます！',
    affect_title: 'これはあなたにどのように影響しますか？',
    hint_1:
      '古い<strong>環境タグ</strong>が2つの新しいテナントタイプ<strong>「開発」</strong>および<strong>「本番」</strong>に置き換えられます。',
    hint_2:
      'シームレスな移行と機能の連続性を保証するため、すべての早期に作成されたテナントは、前のサブスクリプションとともに<strong>「本番」</strong>テナントタイプに昇格されます。',
    hint_3: 'ご安心ください、他のすべての設定は変わりません。',
    about_tenant_type: 'テナントタイプについて',
  },
  delete_modal: {
    title: 'テナントを削除します',
    description_line1:
      'あなたはテナント "<span>{{name}}</span>" を環境接尾辞タグ "<span>{{tag}}</span>" と共に削除してもよろしいでしょうか？ この操作は取り消すことができず、すべてのデータとテナント情報が永久に削除されます。',
    description_line2:
      'テナントを削除する前に、お手伝いできることがあるかもしれません。 <span><a>電子メールでお問い合わせ</a></span>',
    description_line3:
      '続行する場合は、テナント名 "<span>{{name}}</span>" を入力して確認してください。',
    delete_button: '完全に削除する',
    cannot_delete_title: 'このテナントは削除できません',
    cannot_delete_description:
      '申し訳ありませんが、現時点ではこのテナントを削除できません。無料プランに登録しており、未払いの請求がないことを確認してください。',
  },
  leave_tenant_modal: {
    description: 'このテナントを退出してもよろしいですか？',
    leave_button: '退出',
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
  },
};

export default Object.freeze(tenants);
