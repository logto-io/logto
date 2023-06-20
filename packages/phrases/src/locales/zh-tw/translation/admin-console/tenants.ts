const tenants = {
  create_modal: {
    title: '建立客戶',
    subtitle: '建立新租戶以區分資源和使用者。',
    create_button: '建立租戶',
    tenant_name: '租戶名稱',
    tenant_name_placeholder: '我的租戶',
    environment_tag: '環境標籤',
    environment_tag_description:
      '帶有不同標籤的服務完全相同。它充當後綴的作用,以幫助您的團隊區分不同的環境。',
    environment_tag_development: 'Dev',
    environment_tag_staging: 'Staging',
    environment_tag_production: 'Prod',
  },
  delete_modal: {
    title: '刪除租戶',
    description_line1:
      '您是否確定要刪除具有環境後綴標籤 "<span>{{tag}}</span>" 的租戶 "<span>{{name}}</span>"？這個動作是無法撤銷的，並會永久刪除您的所有資料和帳戶資訊。',
    description_line2:
      '在刪除帳戶之前，也許我們能提供幫助。<span><a>通過電子郵件與我們聯繫</a></span>',
    description_line3: '如果您確定要繼續，請輸入租戶名稱 "<span>{{name}}</span>" 以確認。',
    delete_button: '永久刪除',
  },
  tenant_landing_page: {
    title: '您尚未建立租戶',
    description:
      '要開始使用Logto配置您的項目，請創建一個新租戶。如果您需要登出或刪除您的帳戶，只需點擊右上角的頭像按鈕。',
    create_tenant_button: '創建租戶',
  },
};

export default tenants;
