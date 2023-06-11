const tenants = {
  create_modal: {
    title: '建立客戶',
    subtitle: '建立新租戶以區分資源和使用者。',
    create_button: '建立租戶',
    tenant_name: '租戶名稱',
    tenant_name_placeholder: '我的租戶',
    environment_tag: '環境標籤',
    environment_tag_description: '使用標籤區分租戶使用環境，每個標籤的服務相同，確保一致性。',
    environment_tag_development: '開發',
    environment_tag_staging: '測試',
    environment_tag_production: '生產',
  },
  delete_modal: {
    title: '刪除租戶',
    description_line1:
      '您是否確定要刪除具有環境後綴標籤 "<span>{{tag}}</span>" 的租戶 "<span>{{name}}</span>"？這個動作是無法撤銷的，並會永久刪除您的所有資料和帳戶資訊。',
    description_line2:
      '在刪除帳戶之前，也許我們能提供幫助。 <span><a>通過電子郵件與我們聯繫</a></span>',
    description_line3: '如果您確定要繼續，請輸入租戶名稱 "<span>{{name}}</span>" 以確認。',
    delete_button: '永久刪除',
  },
  tenant_created: "租戶 '{{name}}' 成功建立。",
};

export default tenants;
