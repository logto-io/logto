const others = {
  terms_of_use: {
    title: '條款',
    terms_of_use: '使用條款 URL',
    terms_of_use_placeholder: 'https://your.terms.of.use/',
    privacy_policy: '隱私政策 URL',
    privacy_policy_placeholder: 'https://your.privacy.policy/',
  },
  languages: {
    title: '語言',
    enable_auto_detect: '開啟語言自動適配',
    description:
      '基於使用者自身的語言設定，產品將展示最符合使用者使用習慣的語言。你可以為產品添加翻譯內容、選擇語言代碼和設定自訂語言，來延展產品的本地化需求。',
    manage_language: '管理語言',
    default_language: '預設語言',
    default_language_description_auto:
      '語言自動適配已開啟，當使用者設定的語言無法匹配時，他們將看到預設語言。',
    default_language_description_fixed:
      '語言自動適配已關閉，你的應用將只展示預設語言。開啟自動適配即可定制語言。',
  },
  manage_language: {
    title: '管理語言',
    subtitle: '你可以為產品添加翻譯內容、選擇語言代碼和設定自訂語言，來延展產品的本地化需求。',
    add_language: '添加語言',
    logto_provided: 'Logto 提供',
    key: '鍵名',
    logto_source_values: 'Logto 源語言',
    custom_values: '翻譯文本',
    clear_all_tip: '清空',
    unsaved_description: '離開頁面前，記得保存你本次做的內容修改。',
    deletion_tip: '刪除',
    deletion_title: '你確定你要刪除新加的語言嗎？',
    deletion_description: '刪除後，你的使用者將無法使用該語言查看內容。',
    default_language_deletion_title: '你無法刪除預設語言',
    default_language_deletion_description:
      '你已設置 {{language}} 為你的預設語言，你無法刪除預設語言。',
  },
  advanced_options: {
    title: '高級選項',
    enable_user_registration: '啟用使用者註冊',
    enable_user_registration_description:
      '開啟或關閉使用者註冊功能。一旦關閉，使用者將無法通過登錄界面自行註冊帳號，但管理員仍可通過管理控制台添加使用者。',
  },
};

export default others;
