const tenants = {
  title: '設置',
  description: '高效管理租戶設置並自訂您的域名。',
  tabs: {
    settings: '設定',
    domains: '網域',
    subscription: '方案與計費',
    billing_history: '帳單記錄',
  },
  settings: {
    title: '設定',
    tenant_id: '租户ID',
    tenant_name: '租户名称',
    environment_tag: '環境標識',
    environment_tag_description: '標籤不會改變服務。它們只是協助您區分不同的環境。',
    environment_tag_development: '開發',
    environment_tag_staging: '預備',
    environment_tag_production: '產品',
    tenant_info_saved: '租戶信息成功保存。',
  },
  deletion_card: {
    title: '刪除',
    tenant_deletion: '刪除租戶',
    tenant_deletion_description: '刪除租戶將導致永久刪除所有相關的用戶數據和配置。請謹慎操作。',
    tenant_deletion_button: '刪除租戶',
  },
  create_modal: {
    title: '創建租戶',
    subtitle: '創建新租戶來區分資源及使用者。',
    create_button: '創建租戶',
    tenant_name_placeholder: '我的租戶',
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
  tenant_landing_page: {
    title: '您尚未建立租戶',
    description:
      '要開始使用 Logto 配置您的項目，請創建一個新的租戶。如果您需要退出或刪除您的帳戶，只需單擊右上角的頭像按鈕。',
    create_tenant_button: '創建租戶',
  },
  status: {
    mau_exceeded: '超出 MAU 限制',
    suspended: '已暫停',
    overdue: '逾期未付款',
  },
  tenant_suspended_page: {
    title: '租戶已暫停。請聯繫我們恢復訪問。',
    description_1:
      '很遺憾地通知您，由於不當使用（包括超出 MAU 限制、逾期付款或其他未經授權的操作等），您的租戶帳戶已被暫時停用。',
    description_2:
      '如果您需要進一步了解，有任何疑慮或希望恢復完整功能並解鎖您的租戶，請立即與我們聯繫。',
    contact_us: '聯繫我們',
  },
};

export default tenants;
