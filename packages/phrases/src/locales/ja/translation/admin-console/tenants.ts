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
    /** UNTRANSLATED */
    description: 'Set the tenant name and view your data hosted region and tenant type.',
    tenant_id: 'テナントID',
    tenant_name: 'テナント名',
    tenant_region: 'データがホストされている地域',
    tenant_region_tip: 'Your tenant resources are hosted in {{region}}. <a>Learn more</a>',
    environment_tag_development: '開発',
    environment_tag_staging: 'ステージング',
    environment_tag_production: '本番',
    /** UNTRANSLATED */
    tenant_type: 'Tenant type',
    /** UNTRANSLATED */
    development_description:
      "For testing only and shouldn't be used in production. No subscription is required. It has all the pro features but has limitations like a sign-in banner. <a>Learn more</a>",
    /** UNTRANSLATED */
    production_description:
      'Intended for apps that are being used by end-users and may require a paid subscription. <a>Learn more</a>',
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
    tenant_usage_purpose: 'What do you want to use this tenant for?',
    /** UNTRANSLATED */
    development_description:
      "For testing only and shouldn't be used in production. No subscription is required.",
    /** UNTRANSLATED */
    development_hint: 'It has all the pro features but has limitations like a sign-in banner.',
    /** UNTRANSLATED */
    production_description: 'For use by end-users and may require a paid subscription.',
    available_plan: 'Available plan:',
    create_button: 'テナントを作成する',
    tenant_name_placeholder: '私のテナント',
  },
  dev_tenant_migration: {
    /** UNTRANSLATED */
    title:
      'You can now try our Hobby and Pro features for free by creating a new "Development tenant"!',
    /** UNTRANSLATED */
    affect_title: 'How does this affect you?',
    /** UNTRANSLATED */
    hint_1:
      'We are replacing the old <strong>environment tags</strong> with two new tenant types: <strong>“Development”</strong> and <strong>“Production”</strong>.',
    /** UNTRANSLATED */
    hint_2:
      'To ensure a seamless transition and uninterrupted functionality, all early-created tenants will be elevated to the <strong>Production</strong> tenant type along with your previous subscription.',
    /** UNTRANSLATED */
    hint_3: "Don't worry, all your other settings will remain the same.",
    /** UNTRANSLATED */
    about_tenant_type: 'About tenant type',
  },
  dev_tenant_notification: {
    /** UNTRANSLATED */
    title:
      'You can now access <a>all features of Logto Hobby and Pro</a> in your development tenant!',
    /** UNTRANSLATED */
    description: "It's completely free, with no trial period – forever!",
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
    cannot_delete_title: 'このテナントは削除できません',
    cannot_delete_description:
      '申し訳ありませんが、現時点ではこのテナントを削除できません。無料プランに登録しており、未払いの請求がないことを確認してください。',
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
  signing_keys: {
    title: 'SIGNING KEYS',
    description: 'Securely manage signing keys in your tenant.',
    type: {
      private_key: 'OIDC private keys',
      cookie_key: 'OIDC cookie keys',
    },
    private_keys_in_use: 'Private keys in use',
    cookie_keys_in_use: 'Cookie keys in use',
    rotate_private_keys: 'Rotate private keys',
    rotate_cookie_keys: 'Rotate cookie keys',
    rotate_private_keys_description:
      'This action will create a new private signing key, rotate the current key, and remove your previous key. Your JWT tokens signed with the current key will remain valid until deletion or another round of rotation.',
    rotate_cookie_keys_description:
      'This action will create a new cookie key, rotate the current key, and remove your previous key. Your cookies with the current key will remain valid until deletion or another round of rotation.',
    select_private_key_algorithm: 'Select signing key algorithm for the new private key',
    rotate_button: 'Rotate',
    table_column: {
      id: 'ID',
      status: 'Status',
      algorithm: 'Signing key algorithm',
    },
    status: {
      current: 'Current',
      previous: 'Previous',
    },
    reminder: {
      rotate_private_key:
        'Are you sure you want to rotate the <strong>OIDC private keys</strong>? New issued JWT tokens will be signed by the new key. Existing JWT tokens stay valid until you rotate again.',
      rotate_cookie_key:
        'Are you sure you want to rotate the <strong>OIDC cookie keys</strong>? New cookies generated in sign-in sessions will be signed by the new cookie key. Existing cookies stay valid until you rotate again.',
      delete_private_key:
        'Are you sure you want to delete the <strong>OIDC private key</strong>? Existing JWT tokens signed with this private signing key will no longer be valid.',
      delete_cookie_key:
        'Are you sure you want to delete the <strong>OIDC cookie key</strong>? Older sign-in sessions with cookies signed with this cookie key will no longer be valid. A re-authentication is required for these users.',
    },
    messages: {
      rotate_key_success: 'Signing keys rotated successfully.',
      delete_key_success: 'Key deleted successfully.',
    },
  },
};

export default Object.freeze(tenants);
