const content = {
  terms_of_use: {
    title: 'TERMS',
    description: '添加條款和隱私以滿足合規要求。',
    terms_of_use: '使用條款 URL',
    terms_of_use_placeholder: 'https://your.terms.of.use/',
    privacy_policy: '私隱政策 URL',
    privacy_policy_placeholder: 'https://your.privacy.policy/',
    agree_to_terms: '同意條款',
    agree_policies: {
      automatic: '繼續自動同意條款',
      manual_registration_only: '只在註冊時要求勾選同意',
      manual: '在註冊和登錄時都需要勾選同意',
    },
  },
  languages: {
    title: '語言',
    enable_auto_detect: '啟用自動偵測',
    description:
      '你的軟件會偵測用戶的地區語言設定並切換至本地語言。你可以把介面由英文翻譯成其他語言以加入新語言。',
    manage_language: '管理語言',
    default_language: '預設語言',
    default_language_description_auto: '當偵測到的用戶語言未涵蓋於現有語言庫時，會使用預設語言。',
    default_language_description_fixed:
      '關閉自動偵測時，預設語言是你的軟件唯一會顯示的語言。開啟自動偵測以擴展語言。',
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
    title: '管理語言',
    subtitle: '透過加入語言與翻譯來本地化產品體驗。你的貢獻可以設為預設語言。',
    add_language: '新增語言',
    logto_provided: '由 Logto 提供',
    key: '鍵值',
    logto_source_values: 'Logto 原始值',
    custom_values: '自訂值',
    clear_all_tip: '清除所有值',
    unsaved_description: '若你離開此頁而未儲存，更改將不會被儲存。',
    deletion_tip: '刪除語言',
    deletion_title: '你想刪除新增的語言嗎？',
    deletion_description: '刪除後，用戶將無法再以該語言瀏覽。',
    default_language_deletion_title: '預設語言無法刪除。',
    default_language_deletion_description: '{{language}} 已被設為預設語言，無法刪除。',
  },
};

export default Object.freeze(content);
