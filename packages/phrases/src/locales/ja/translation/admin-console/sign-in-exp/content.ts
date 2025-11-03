const content = {
  terms_of_use: {
    title: 'TERMS',
    description: 'コンプライアンス要件を満たすために、利用規約とプライバシーを追加してください。',
    terms_of_use: '利用規約 URL',
    terms_of_use_placeholder: 'https://your.terms.of.use/',
    privacy_policy: 'プライバシーポリシー URL',
    privacy_policy_placeholder: 'https://your.privacy.policy/',
    agree_to_terms: '利用規約に同意する',
    agree_policies: {
      automatic: '自動的に利用規約に同意し続ける',
      manual_registration_only: '登録時のみチェックボックスで同意を求める',
      manual: '登録時およびサインイン時の両方でチェックボックスの同意を求める',
    },
  },
  languages: {
    title: '言語',
    enable_auto_detect: '自動検出を有効にする',
    description:
      'ソフトウェアがユーザーのロケール設定を検出し、ローカル言語に切り替えます。英語の UI を別の言語に翻訳して新しい言語を追加できます。',
    manage_language: '言語を管理',
    default_language: '既定の言語',
    default_language_description_auto:
      '検出されたユーザーの言語が現在の言語ライブラリにない場合、既定の言語が使用されます。',
    default_language_description_fixed:
      '自動検出をオフにすると、既定の言語だけが表示されます。言語を拡張するには自動検出をオンにしてください。',
  },
  support: {
    title: 'サポート',
    subtitle: 'エラーページにサポートチャンネルを表示して、迅速にユーザーを支援します。',
    support_email: 'サポートメール',
    support_email_placeholder: 'support@email.com',
    support_website: 'サポートウェブサイト',
    support_website_placeholder: 'https://your.website/support',
  },
  manage_language: {
    title: '言語を管理',
    subtitle:
      '言語と翻訳を追加して製品体験をローカライズします。あなたが提供した言語は既定の言語として設定できます。',
    add_language: '言語を追加',
    logto_provided: 'Logto 提供',
    key: 'キー',
    logto_source_values: 'Logto ソース値',
    custom_values: 'カスタム値',
    clear_all_tip: 'すべての値をクリア',
    unsaved_description: '保存せずにこのページを離れると、変更は保存されません。',
    deletion_tip: '言語を削除',
    deletion_title: '追加した言語を削除しますか？',
    deletion_description: '削除後、ユーザーはその言語で閲覧できなくなります。',
    default_language_deletion_title: '既定の言語は削除できません。',
    default_language_deletion_description:
      '{{language}} は既定の言語として設定されているため削除できません。',
  },
};

export default Object.freeze(content);
