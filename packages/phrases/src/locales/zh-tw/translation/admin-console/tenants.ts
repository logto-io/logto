const tenants = {
  title: '設置',
  description: '高效管理租戶設定並自訂您的網域。',
  oss_description: '請在此變更帳戶設定並管理您的個人資料，以確保帳戶安全。',
  tabs: {
    settings: '設置',
    members: '成員',
    domains: '網域',
    oidc_configs: 'OIDC 設定',
    subscription: '方案與計費',
    billing_history: '帳單歷史記錄',
    license: '授權',
  },
  license: {
    purchase_title: '自託管方案',
    purchase_description:
      '自託管專業方案與企業方案可在你自己的執行個體上解鎖付費功能，例如隱藏 Logto 品牌標誌、使用自訂 UI、由 IdP 發起的 SSO、主控台多人協作以及不限數量的 SAML 應用。購買方案即可取得授權金鑰。',
    purchase_button: '查看自託管方案',
    install_title: '安裝授權',
    install_description: '貼上你購買自託管方案後取得的授權金鑰。',
    install_button: '安裝授權',
    key_field: '授權金鑰',
    key_field_description:
      '金鑰會在你的執行個體上驗證，不會離開執行個體。如果現有金鑰已過期，請到 Logto 帳戶取得新的金鑰。',
    key_placeholder: '在此貼上你的授權金鑰',
    installed_toast: '授權安裝成功。',
    details_title: '授權',
    details_description: '此執行個體上已安裝的授權及其授予的權益。',
    plan_field: '方案',
    environment_field: '環境',
    environment_production: '生產',
    environment_non_production: '非生產',
    expires_at_field: '到期日',
    installed_at_field: '安裝日期',
    last_refreshed_at_field: '上次更新時間',
    grace_ends_at_field: '寬限期結束日期',
    refresh_expired_description:
      '授權金鑰已於 {{expiresAt}} 到期。Logto 嘗試更新金鑰期間，授權功能仍可使用至 {{graceEndsAt}}。',
    refresh_refused_description:
      '授權更新被拒絕，因為授權已{{reason}}。授權功能仍可使用至 {{graceEndsAt}}。',
    refusal_reason_canceled: '取消',
    refusal_reason_unpaid: '未付款',
    refusal_reason_expired: '到期',
    refusal_reason_revoked: '撤銷',
    refusal_reason_unknown: '不可用',
    grace_expired_description:
      '授權寬限期已於 {{graceEndsAt}} 結束。此執行個體已恢復為 OSS 預設值。請從 Logto Cloud 取得新的授權金鑰並重新安裝。',
    get_fresh_key_button: '取得新的授權金鑰',
    replace_button: '更換授權',
  },
  members: {
    card_title: '透過 Logto Cloud 更安全地管理租戶',
    card_description: '無需共用單一管理員帳號，也能為你的租戶新增管理員或協作者。',
    card_action: '探索 Logto Cloud',
    self_hosted_card_title: '透過自託管方案更安全地管理租戶',
    self_hosted_card_description: '無需共用單一管理員帳號，也能為你的租戶新增管理員或協作者。',
    self_hosted_card_action: '探索自託管方案',
  },
  settings: {
    title: '設定',
    description: '設定租戶名稱並查看您的資料托管區域和租戶類型。',
    tenant_id: '租戶 ID',
    tenant_name: '租戶名稱',
    tenant_instance: '選擇你的實例',
    tenant_instance_description:
      '選擇租戶將托管的位置。選擇 Logto Cloud 的公共共享基礎設施，或選擇專用實例以獲得專屬資源。',
    tenant_region: '資料托管地區',
    tenant_region_description: '您的租戶資源（使用者、應用程式等）所在的實體位置。建立後無法更改。',
    tenant_region_tip: '您的租戶資源托管於 {{region}}。 <a>了解更多</a>',
    environment_tag_development: '開發',
    environment_tag_production: '產品',
    tenant_type: '租戶類型',
    development_description:
      '僅供測試，不應在生產環境中使用。無需訂閱。它擁有所有專業功能，但存在限制，如登入橫幅。',
    production_description: '旨在供最終用戶使用，可能需要付費訂閱。',
    tenant_info_saved: '租戶資訊成功儲存。',
    tenant_mfa: '多因素驗證',
    tenant_mfa_description: '要求成員設定多因素驗證才能存取此租戶。',
    enterprise_sso: '企業 SSO',
    enterprise_sso_description:
      '僅限付費方案。聯繫我們啟用企業 SSO，讓所有成員可以使用您組織的身分提供者登入 Logto Cloud 控制台。',
  },
  full_env_tag: {
    development: '開發',
    production: '產品',
  },
  deletion_card: {
    title: '刪除',
    tenant_deletion: '刪除租戶',
    tenant_deletion_description: '刪除租戶將導致所有相關的使用者資料和設定永久移除。請謹慎進行。',
    tenant_deletion_button: '刪除租戶',
  },
  leave_tenant_card: {
    title: '離開',
    leave_tenant: '離開租戶',
    leave_tenant_description: '在租戶中的任何資源將保留，但您將不再有權訪問此租戶。',
    last_admin_note: '要離開此租戶，請確保至少還有一位成員具有管理員角色。',
  },
  create_modal: {
    title: '建立客戶',
    subtitle: '建立一個具有獨立資源和使用者的新租戶。',
    tenant_id: '租戶 ID',
    tenant_usage_purpose: '您希望將此租戶用於什麼目的？',
    development_description: '僅供測試，不應在生產環境中使用。無需訂閱。',
    development_description_for_private_regions: '僅供測試，不應在生產環境中使用。',
    development_hint: '它擁有所有專業功能，但存在限制，如登入橫幅。',
    production_description: '供最終用戶使用，可能需要付費訂閱。',
    available_plan: '可用方案：',
    create_button: '建立租戶',
    tenant_name_placeholder: '我的租戶',
    tenant_created: '租戶建立成功。',
    invitation_failed: '某些邀請發送失敗。請稍後在設置 -> 成員中再試。',
    tenant_type_description: '這一點在建立後無法更改。',
    tenant_id_invalid: '租戶 ID 只能包含小寫字母、數字和連字符，且不能超過 {{max}} 個字元。',
    tenant_id_placeholder: '你的租戶 ID',
    tenant_id_tip: '自訂租戶 ID。如果留空，Logto 將產生預設 ID。租戶 ID 在建立後無法更改。',
  },
  dev_tenant_migration: {
    title: '您現在可以通過創建新的 "開發租戶" 免費試用我們的專業功能！',
    affect_title: '這對您有什麼影響？',
    hint_1:
      '我們正將舊的<strong>環境標籤</strong>替換為兩種新的租戶類型：<strong>“開發</strong>”和<strong>“產品</strong>”。',
    hint_2:
      '為確保無縫過渡和不間斷的功能，所有早期創建的租戶將提升為<strong>產品</strong>租戶類型，並附上先前的訂閱。',
    hint_3: '別擔心，您的其他設置將保持不變。',
    about_tenant_type: '關於租戶類型',
  },
  delete_modal: {
    title: '刪除租戶',
    description_line1:
      '您確定要刪除您的租戶 "<span>{{name}}</span>" 以及環境標籤 "<span>{{tag}}</span>" 嗎？此操作無法撤銷，並將導致永久刪除所有資料和租戶資訊。',
    description_line2:
      '在刪除租戶之前，也許我們可以幫助您。 <span><a>透過電子郵件與我們聯繫</a></span>',
    description_line3: '如果確定要繼續，請輸入租戶名稱 "<span>{{name}}</span>" 以確認。',
    delete_button: '永久刪除',
    cannot_delete_title: '無法刪除此租戶',
    cannot_delete_description:
      '抱歉，您現在無法刪除此租戶。請確保您處於免費方案並已支付所有未結賬單。',
  },
  leave_tenant_modal: {
    description: '您確定要離開此租戶？',
    leave_button: '離開',
  },
  tenant_landing_page: {
    title: '您尚未建立租戶',
    description:
      '要開始使用 Logto 配置您的項目，請創建一個新租戶。如果您需要登出或刪除您的帳戶，只需點擊右上角的頭像按鈕。',
    create_tenant_button: '創建租戶',
  },
  status: {
    mau_exceeded: '超過 MAU 限制',
    token_exceeded: '超過 Token 限制',
    suspended: '暫停',
    overdue: '逾期',
  },
  tenant_suspended_page: {
    title: '租戶暫停。聯繫我們以恢復存取。',
    description_1:
      '很抱歉通知您，由於不當使用，包括超過 MAU 限制、逾期付款或其他未經授權的操作，您的租戶帳戶已被暫時停用。',
    description_2:
      '如果您需要進一步的說明、有任何疑慮或希望恢復全部功能並解鎖您的租戶，請立即聯絡我們。',
  },
  production_tenant_notification: {
    text: '你正在一個開發租戶中免費測試。創建一個產品租戶來上線。',
    action: '創建租戶',
  },
};

export default Object.freeze(tenants);
