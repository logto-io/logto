const tenants = {
  title: '設置',
  description: '高效管理租戶設定並自訂您的網域。',
  tabs: {
    settings: '設置',
    domains: '網域',
    subscription: '方案與計費',
    billing_history: '帳單歷史記錄',
  },
  settings: {
    title: '設定',
    /** UNTRANSLATED */
    description: 'Set the tenant name and view your data hosted region and tenant type.',
    tenant_id: '租戶 ID',
    tenant_name: '租戶名稱',
    tenant_region: '資料托管地區',
    tenant_region_tip: '您的租戶資源托管於 {{region}}。 <a>了解更多</a>',
    environment_tag_development: '開發',
    environment_tag_staging: '預置',
    environment_tag_production: '產品',
    /** UNTRANSLATED */
    tenant_type: 'Tenant type',
    /** UNTRANSLATED */
    development_description:
      "For testing only and shouldn't be used in production. No subscription is required. It has all the pro features but has limitations like a sign-in banner. <a>Learn more</a>",
    /** UNTRANSLATED */
    production_description:
      'Intended for apps that are being used by end-users and may require a paid subscription. <a>Learn more</a>',
    tenant_info_saved: '租戶資訊成功儲存。',
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
  create_modal: {
    title: '建立客戶',
    subtitle: '創建一個具有隔離資源和用戶的新租戶。數據托管的區域和租戶類型在創建後無法修改。',
    tenant_usage_purpose: '您希望將此租戶用於什麼目的？',
    /** UNTRANSLATED */
    development_description:
      "For testing only and shouldn't be used in production. No subscription is required.",
    /** UNTRANSLATED */
    development_hint: 'It has all the pro features but has limitations like a sign-in banner.',
    /** UNTRANSLATED */
    production_description: 'For use by end-users and may require a paid subscription.',
    available_plan: '可用方案：',
    create_button: '建立租戶',
    tenant_name_placeholder: '我的租戶',
  },
  dev_tenant_migration: {
    /** UNTRANSLATED */
    title:
      'You can now try our Hobby and Pro features for free by creating a new "Development tenant"!',
    /** UNTRANSLATED */
    affect_title: 'How does this affect you?',
    /** UNTRANSLATED */
    hint_1:
      'We are replacing the old <strong>environment tags</strong> with two new tenant types: <strong>“Development”</strong> and <strong>“Production”</strong>.',
    /** UNTRANSLATED */
    hint_2:
      'To ensure a seamless transition and uninterrupted functionality, all early-created tenants will be elevated to the <strong>Production</strong> tenant type along with your previous subscription.',
    /** UNTRANSLATED */
    hint_3: "Don't worry, all your other settings will remain the same.",
    /** UNTRANSLATED */
    about_tenant_type: 'About tenant type',
  },
  dev_tenant_notification: {
    /** UNTRANSLATED */
    title:
      'You can now access <a>all features of Logto Hobby and Pro</a> in your development tenant!',
    /** UNTRANSLATED */
    description: "It's completely free, with no trial period – forever!",
  },
  delete_modal: {
    title: '刪除租戶',
    description_line1:
      '您確定要刪除帶有環境標籤 "<span>{{tag}}</span>" 的租戶 "<span>{{name}}</span>"？此操作無法撤銷，並將永久刪除所有您的數據和帳戶信息。',
    description_line2:
      '在刪除帳戶前，也許我們能提供幫助。<span><a>通過電子郵件與我們聯繫</a></span>',
    description_line3: '如果您確定要繼續，請輸入租戶名稱 "<span>{{name}}</span>" 以確認。',
    delete_button: '永久刪除',
    cannot_delete_title: '無法刪除此租戶',
    cannot_delete_description:
      '抱歉，您現在無法刪除此租戶。請確保您處於免費方案並已支付所有未結賬單。',
  },
  tenant_landing_page: {
    title: '您尚未建立租戶',
    description:
      '要開始使用Logto配置您的項目，請創建一個新租戶。如果您需要登出或刪除您的帳戶，只需點擊右上角的頭像按鈕。',
    create_tenant_button: '創建租戶',
  },
  status: {
    mau_exceeded: '超過MAU限制',
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
  signing_keys: {
    title: '签名密钥',
    description: '在您的租戶中安全管理签名密钥。',
    type: {
      private_key: 'OIDC 私鑰',
      cookie_key: 'OIDC Cookie 密鑰',
    },
    private_keys_in_use: '正在使用的私鑰',
    cookie_keys_in_use: '正在使用的 Cookie 密鑰',
    rotate_private_keys: '輪換私鑰',
    rotate_cookie_keys: '輪換 Cookie 密鑰',
    rotate_private_keys_description:
      '此操作將創建一個新的私密簽名密鑰，輪換當前密鑰並刪除之前的密鑰。您的使用當前密鑰簽署的 JWT 憑證在刪除或另一輪輪換之前仍然有效。',
    rotate_cookie_keys_description:
      '此操作將創建一個新的 Cookie 密鑰，輪換當前密鑰並刪除之前的密鑰。使用當前密鑰簽署的 Cookie 將在刪除或另一輪輪換之前仍然有效。',
    select_private_key_algorithm: '選擇新私鑰的簽名演算法',
    rotate_button: '輪換',
    table_column: {
      id: 'ID',
      status: '狀態',
      algorithm: '簽名演算法',
    },
    status: {
      current: '當前的',
      previous: '之前的',
    },
    reminder: {
      rotate_private_key:
        '您確定要輪換<strong>OIDC私鑰</strong>嗎？新發放的 JWT 憑證將由新的密鑰簽署。現有的 JWT 憑證仍然有效，直到下一輪輪換或刪除。',
      rotate_cookie_key:
        '您確定要輪換<strong>OIDC Cookie 密鑰</strong>嗎？在登入會話中生成的新 Cookie 將由新的 Cookie 密鑰簽署。現有 Cookie 在下一輪輪換或刪除之前仍然有效。',
      delete_private_key:
        '您確定要刪除<strong>OIDC私鑰</strong>嗎？使用此私密簽名密鑰簽署的現有 JWT 憑證將不再有效。',
      delete_cookie_key:
        '您確定要刪除<strong>OIDC Cookie 密鑰</strong>嗎？用此 Cookie 密鑰簽署的舊登入會話將不再有效。這些使用者需要重新驗證。',
    },
    messages: {
      rotate_key_success: '密鑰輪換成功。',
      delete_key_success: '密鑰刪除成功。',
    },
  },
};

export default Object.freeze(tenants);
