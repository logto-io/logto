const content = {
  terms_of_use: {
    title: 'TERMS',
    description: '添加條款和隱私以滿足合規要求。',
    terms_of_use: 'Terms of use URL',
    terms_of_use_placeholder: 'https://your.terms.of.use/',
    privacy_policy: 'Privacy policy URL',
    privacy_policy_placeholder: 'https://your.privacy.policy/',
    agree_to_terms: '同意條款',
    agree_policies: {
      automatic: '繼續自動同意條款',
      manual_registration_only: '只在註冊時要求勾選同意',
      manual: '在註冊和登錄時都需要勾選同意',
    },
  },
  languages: {
    title: 'LANGUAGES',
    enable_auto_detect: 'Enable auto-detect',
    description:
      '你的軟件會檢測用戶的地區設置並切換到當地語言。你可以通過將 UI 從英語翻譯成其他語言來添加新語言。',
    manage_language: 'Manage language',
    default_language: 'Default language',
    default_language_description_auto: '當當前語言庫中不涵蓋檢測到的用戶語言時，將使用默認語言。',
    default_language_description_fixed:
      '當自動檢測關閉時，默認語言是你的軟件將顯示的唯一語言。啟用自動檢測以拓展語言範圍。',
  },
  support: {
    title: '支援',
    subtitle: '在錯誤頁面上顯示你的支援渠道以便用戶快速獲得幫助。',
    support_email: '支援電郵',
    support_email_placeholder: 'support@email.com',
    support_website: '支援網站',
    support_website_placeholder: 'https://your.website/support',
  },
  manage_language: {
    title: 'Manage language',
    subtitle: '通過添加語言和翻譯來本地化產品體驗。你的貢獻可以設置為默認語言。',
    add_language: 'Add Language',
    logto_provided: 'Logto provided',
    key: 'Key',
    logto_source_values: 'Logto source values',
    custom_values: 'Custom values',
    clear_all_tip: 'Clear all values',
    unsaved_description: '如果你未保存就離開此頁面，則更改將不會保存。',
    deletion_tip: 'Delete the language',
    deletion_title: '你想刪除添加的語言嗎？',
    deletion_description: '刪除後，你的用戶將無法再次以該語言瀏覽。',
    default_language_deletion_title: '默認語言不能被刪除。',
    default_language_deletion_description: '{{language}} 已設定為默認語言，不能被刪除。',
  },
};

export default Object.freeze(content);
