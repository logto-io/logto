const others = {
  terms_of_use: {
    title: '利用規約',
    terms_of_use: '利用規約のURL',
    terms_of_use_placeholder: 'https://your.terms.of.use/',
    privacy_policy: 'プライバシーポリシーのURL',
    privacy_policy_placeholder: 'https://your.privacy.policy/',
  },
  languages: {
    title: '言語',
    enable_auto_detect: '自動検出を有効にする',
    description:
      'ユーザーのロケール設定を検出して、現地の言語に切り替えることができます。英語から他の言語へのUIの翻訳を追加することで、新しい言語を追加できます。',
    manage_language: '言語を管理する',
    default_language: '既定言語',
    default_language_description_auto:
      '既定の言語は、現在の言語ライブラリにカバーされていないユーザーの検出された言語がある場合に使用されます。',
    default_language_description_fixed:
      '自動検出がオフになっている場合、既定の言語がソフトウェアで表示される唯一の言語になります。言語拡張のために自動検出をオンにしてください。',
  },
  manage_language: {
    title: '言語を管理する',
    subtitle:
      '言語と翻訳を追加して、製品エクスペリエンスをローカライズします。あなたの貢献は、既定言語として設定することができます。',
    add_language: '言語を追加する',
    logto_provided: '提供されたログ',
    key: 'キー',
    logto_source_values: 'ログソース値',
    custom_values: 'カスタム値',
    clear_all_tip: 'すべての値をクリアする',
    unsaved_description: '保存せずにこのページを離れると、変更は保存されません。',
    deletion_tip: '言語を削除する',
    deletion_title: '追加された言語を削除しますか？',
    deletion_description: '削除後、ユーザーはその言語で閲覧できなくなります。',
    default_language_deletion_title: '既定言語は削除できません。',
    default_language_deletion_description:
      '{{language}}はあなたの既定言語として設定されており、削除できません。',
  },
  advanced_options: {
    title: '高度なオプション',
    enable_user_registration: 'ユーザー登録を有効にする',
    enable_user_registration_description:
      'ユーザー登録を有効または無効にします。無効にすると、管理コンソールでユーザーを追加できますが、ユーザーはもはやサインインUIを介してアカウントを確立できません。',
  },
};

export default others;
