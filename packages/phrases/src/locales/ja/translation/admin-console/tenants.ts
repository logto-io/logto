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
    description: 'テナント名を設定し、データがホストされている地域とテナントタイプを表示します。',
    tenant_id: 'テナントID',
    tenant_name: 'テナント名',
    tenant_region: 'データがホストされている地域',
    tenant_region_tip: 'テナントのリソースは{{region}}にホストされています。 <a>さらに詳しく</a>',
    environment_tag_development: '開発',
    environment_tag_staging: 'ステージング',
    environment_tag_production: '本番',
    tenant_type: 'テナントタイプ',
    development_description:
      'テスト用であり、本番で使用されるべきではありません。サブスクリプションは不要です。すべてのプロの機能を備えていますが、サインインバナーなどの制限があります。 <a>さらに詳しく</a>',
    production_description:
      'エンドユーザーが使用するアプリ向けに作成され、有料サブスクリプションを必要とする場合があります。 <a>さらに詳しく</a>',
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
  create_modal: {
    title: 'テナントを作成する',
    subtitle:
      '分離されたリソースとユーザーを持つ新しいテナントを作成します。データがホストされる地域とテナントの種類は作成後に変更できません。',
    tenant_usage_purpose: 'このテナントを使用する目的は？',
    development_description:
      'テスト用であり、本番で使用されるべきではありません。サブスクリプションは不要です。',
    development_hint: 'すべてのプロの機能を備えていますが、サインインバナーなどの制限があります。',
    production_description:
      'エンドユーザーが使用し、有料サブスクリプションが必要な場合があります。',
    available_plan: '利用可能なプラン:',
    create_button: 'テナントを作成する',
    tenant_name_placeholder: '私のテナント',
  },
  dev_tenant_migration: {
    title: '「開発テナント」を作成してログトのホビーやプロの機能を無料でお試しいただけます！',
    affect_title: 'これがあなたにどのように影響するか？',
    hint_1:
      '古い<strong>環境タグ</strong>を新しいテナントタイプ<strong>「開発」</strong>および<strong>「本番」</strong>に置き換える予定です。',
    hint_2:
      'シームレスな移行と機能の中断なくするため、過去に作成されたすべてのテナントは、既存のサブスクリプションと共に<strong>「本番」</strong>テナントタイプに昇格します。',
    hint_3: '他のすべての設定は変わりませんので、安心してください。',
    about_tenant_type: 'テナントタイプについて',
  },
  dev_tenant_notification: {
    title: '開発テナントで今すぐ<a>ログトのホビーやプロのすべての機能</a>にアクセスできます！',
    description: '試用期間なしで完全に無料です！',
  },
  delete_modal: {
    title: 'テナントを削除します',
    description_line1:
      '"<span>{{name}}</span>" というテナント（"<span>{{tag}}</span>" の環境タグを持つ）を削除してもよろしいですか？ このアクションは元に戻せません。これにより、すべてのデータとアカウント情報が永久に削除されます。',
    description_line2:
      'アカウントの削除前に、お手伝いできるかもしれません。 <span><a>メールでお問い合わせください</a></span>。',
    description_line3:
      '続行する場合は、テナント名 "<span>{{name}}</span>" を入力して確認してください。',
    delete_button: '完全に削除する',
    cannot_delete_title: 'このテナントは削除できません',
    cannot_delete_description:
      '申し訳ありませんが、現時点ではこのテナントを削除できません。無料プランに登録しており、未払いの請求がないことを確認してください。',
  },
  tenant_landing_page: {
    title: 'まだテナントを作成していません',
    description:
      'ログトでプロジェクトを設定するには、新しいテナントを作成してください。ログアウトまたはアカウントを削除する必要がある場合は、右上隅のアバターボタンをクリックしてください。',
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
  signing_keys: {
    title: 'SIGNING KEYS',
    description: 'テナント内で署名キーを安全に管理します。',
    type: {
      private_key: 'OIDCプライベートキー',
      cookie_key: 'OIDCクッキーキー',
    },
    private_keys_in_use: '使用中のプライベートキー',
    cookie_keys_in_use: '使用中のクッキーキー',
    rotate_private_keys: 'プライベートキーを回転',
    rotate_cookie_keys: 'クッキーキーを回転',
    rotate_private_keys_description:
      'この操作は新しいプライベート署名キーを作成し、現在のキーを回転させ、以前のキーを削除します。現在のキーで署名されたJWTトークンは削除または回転の再度実行まで有効です。',
    rotate_cookie_keys_description:
      'この操作は新しいクッキーキーを作成し、現在のキーを回転させ、以前のキーを削除します。現在のキーで生成されたクッキーは削除または回転の再度実行まで有効です。',
    select_private_key_algorithm: '新しいプライベートキーの署名キーアルゴリズムを選択',
    rotate_button: '回転',
    table_column: {
      id: 'ID',
      status: 'ステータス',
      algorithm: '署名キーアルゴリズム',
    },
    status: {
      current: '現在の',
      previous: '以前の',
    },
    reminder: {
      rotate_private_key:
        'OIDCプライベートキー</strong>を回転しますか？新しく発行されるJWTトークンは新しいキーで署名されます。既存のJWTトークンは、再度回転するまで有効です。',
      rotate_cookie_key:
        'OIDCクッキーキー</strong>を回転しますか？サインインセッションで生成された新しいクッキーは新しいクッキーキーで署名されます。既存のクッキーは、再度回転するまで有効です。',
      delete_private_key:
        'OIDCプライベートキー</strong>を削除しますか？このプライベート署名キーで署名された既存のJWTトークンは無効になります。',
      delete_cookie_key:
        'OIDCクッキーキー</strong>を削除しますか？このクッキーキーで署名された過去のサインインセッションのクッキーは無効になります。これらのユーザーには再認証が必要です。',
    },
    messages: {
      rotate_key_success: '署名キーは正常に回転しました。',
      delete_key_success: 'キーは正常に削除されました。',
    },
  },
};

export default Object.freeze(tenants);
