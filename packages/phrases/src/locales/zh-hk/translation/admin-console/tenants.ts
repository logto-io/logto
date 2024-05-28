const tenants = {
  title: '設置',
  description: '高效管理租戶設置並自訂您的域名。',
  tabs: {
    settings: '設定',
    members: '成員',
    domains: '網域',
    subscription: '方案與計費',
    billing_history: '帳單記錄',
  },
  settings: {
    title: '設定',
    description: '設置租戶名稱並查看您的數據托管區域和租戶類型。',
    tenant_id: '租戶ID',
    tenant_name: '租戶名稱',
    tenant_region: '數據托管區域',
    tenant_region_tip: '您的租戶資源托管在{{region}}。 <a>了解更多</a>',
    environment_tag_development: '開發',
    environment_tag_production: '生產',
    tenant_type: '租戶類型',
    development_description:
      '僅供測試使用，不應在生產中使用。無需訂閱。它具有所有專業功能，但存在限制，例如登錄橫幅。<a>了解更多</a>',
    production_description: '用於最終用戶使用並可能需要付費訂閱。<a>了解更多</a>',
    tenant_info_saved: '租戶信息成功保存。',
  },
  full_env_tag: {
    development: '開發',
    production: '生產',
  },
  deletion_card: {
    title: '刪除',
    tenant_deletion: '刪除租戶',
    tenant_deletion_description: '刪除租戶將導致永久刪除所有相關的用戶數據和配置。請謹慎操作。',
    tenant_deletion_button: '刪除租戶',
  },
  leave_tenant_card: {
    title: '離開',
    leave_tenant: '離開租戶',
    leave_tenant_description: '租戶內的任何資源將保留，但您將無法再訪問此租戶。',
    last_admin_note: '要離開此租戶，請確保至少還有一個成員具有管理員角色。',
  },
  create_modal: {
    title: '創建租戶',
    subtitle: '創建一個具有隔離資源和使用者的新租戶。數據托管的區域和租戶類型在創建後無法修改。',
    tenant_usage_purpose: '您希望使用此租戶做什麼？',
    development_description: '僅供測試使用，不應在生產中使用。無需訂閱。',
    development_hint: '它具有所有專業功能，但存在限制，例如登錄橫幅。',
    production_description: '用於最終用戶使用並可能需要付費訂閱。',
    available_plan: '可用方案：',
    create_button: '創建租戶',
    tenant_name_placeholder: '我的租戶',
  },
  dev_tenant_migration: {
    title: '現在，您可以通過創建新的“開發租戶”免費試用我們的專業功能！',
    affect_title: '這對您有什麼影響？',
    hint_1:
      '我們正在將舊的<strong>環境標籤</strong>替換為兩種新的租戶類型：<strong>“開發”</strong>和<strong>“生產”</strong>。',
    hint_2:
      '為確保平滑過渡和功能不中斷，所有早期創建的租戶將晉升為<strong>生產</strong>租戶類型，您的以前的訂閱也將保留。',
    hint_3: '別擔心，您的其他設置將保持不變。',
    about_tenant_type: '關於租戶類型',
  },
  delete_modal: {
    title: '刪除租戶',
    description_line1:
      '您確定要刪除您的租戶“<span>{{name}}</span>”和環境後綴標記“<span>{{tag}}</span>” 嗎？此操作無法撤銷，將永久刪除所有您的數據和租戶信息。',
    description_line2:
      '在刪除租戶之前，也許我們可以幫助您。<span><a>通過電子郵件與我們聯繫</a></span>',
    description_line3: '如果您確定要繼續，請輸入租戶名“<span>{{name}}</span>” 以進行確認。',
    delete_button: '永久刪除',
    cannot_delete_title: '無法刪除此租戶',
    cannot_delete_description:
      '抱歉，您現在無法刪除此租戶。請確保您處於免費計劃並已支付所有未結賬單。',
  },
  leave_tenant_modal: {
    description: '您確定要離開此租戶？',
    leave_button: '離開',
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
  },
};

export default Object.freeze(tenants);
