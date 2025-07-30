const user_identity_details = {
  social_identity_page_title: '社交身份詳情',
  back_to_user_details: '返回用戶詳情',
  delete_identity: `移除身份連接`,
  social_account: {
    title: '社交賬戶',
    description: '查看從已連接的 {{connectorName}} 賬戶同步的用戶數據和個人資料信息。',
    provider_name: '社交身份提供者名稱',
    identity_id: '社交身份 ID',
    user_profile: '從社交身份提供者同步的用戶簡介',
  },
  sso_account: {
    title: '企業 SSO 賬戶',
    description: '查看從已連接的 {{connectorName}} 賬戶同步的用戶數據和個人資料信息。',
    provider_name: '企業 SSO 身份提供者名稱',
    identity_id: '企業 SSO 身份 ID',
    user_profile: '從企業 SSO 身份提供者同步的用戶簡介',
  },
  token_storage: {
    title: '訪問令牌',
    description:
      '將來自 {{connectorName}} 的訪問和刷新令牌存儲在 Secret Vault 中。允許自動 API 調用而無需反覆獲得用戶同意。',
  },
  access_token: {
    title: '訪問令牌',
    description_active:
      '訪問令牌是活躍的，並安全地存儲在 Secret Vault 中。你的產品可以使用它來訪問 {{connectorName}} 的 API。',
    description_inactive: '此訪問令牌不活躍（例如，被撤銷）。用戶必須重新授權以恢復功能。',
    description_expired:
      '此訪問令牌已過期。在刷新令牌的下一個 API 請求時自動更新。如果刷新令牌不可用，需重新進行用戶身份驗證。',
  },
  refresh_token: {
    available: '刷新令牌可用。如果訪問令牌過期，將自動使用刷新令牌進行刷新。',
    not_available: '刷新令牌不可用。在訪問令牌過期後，用戶必須重新進行身份驗證以獲取新令牌。',
  },
  token_status: '令牌狀態',
  created_at: '創建於',
  updated_at: '更新於',
  expires_at: '到期於',
  scopes: '範圍',
  delete_tokens: {
    title: '刪除令牌',
    description: '刪除已存儲的令牌。用戶必須重新授權以恢復功能。',
    confirmation_message:
      '你確定要刪除令牌嗎？Logto Secret Vault 將刪除存儲的 {{connectorName}} 訪問和刷新令牌。此用戶必須重新授權以恢復 {{connectorName}} API 訪問。',
  },
  token_storage_disabled: {
    title: '此連接器的令牌存儲已禁用',
    description:
      '用戶目前僅能在每次同意流期間使用 {{connectorName}} 進行登錄、鏈接賬戶或同步簡介。要訪問 {{connectorName}} API 並代表用戶執行操作，請在中啟用令牌存儲。',
  },
};

export default Object.freeze(user_identity_details);
