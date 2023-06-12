const tenants = {
  create_modal: {
    title: '創建租戶',
    subtitle: '創建新租戶來區分資源及使用者。',
    create_button: '創建租戶',
    tenant_name: '租戶名稱',
    tenant_name_placeholder: '我的租戶',
    environment_tag: '環境標籤',
    environment_tag_description: '使用標籤區分租戶環境。每個標籤中的服務均相同，確保一致性。',
    environment_tag_development: '開發',
    environment_tag_staging: '測試',
    environment_tag_production: '生產',
  },
  delete_modal: {
    title: '刪除租戶',
    description_line1:
      '您確定要刪除帶有環境標記 "<span>{{tag}}</span>" 的 "<span>{{name}}</span>" 租戶嗎？此操作無法撤銷，且會永久刪除您的所有數據和帳戶信息。',
    description_line2:
      '在刪除帳戶之前，也許我們可以為您提供幫助。<span><a>通過電子郵件與我們聯繫</a></span>',
    description_line3: '如果您確定要繼續，請輸入租戶名稱 "<span>{{name}}</span>" 以進行確認。',
    delete_button: '永久刪除',
  },
  tenant_created: '成功創建租戶「{{name}}」。',
};

export default tenants;
