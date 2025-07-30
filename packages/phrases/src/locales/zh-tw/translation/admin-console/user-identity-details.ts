const user_identity_details = {
  social_identity_page_title: '社交身份詳情',
  back_to_user_details: '返回用戶詳情',
  delete_identity: `移除身份連接`,
  social_account: {
    title: '社交帳戶',
    description: '查看從連接的 {{connectorName}} 帳戶同步的用戶數據和個人資料信息。',
    provider_name: '社交身份提供者名稱',
    identity_id: '社交身份 ID',
    user_profile: '從社交身份提供者同步的用戶資料',
  },
  sso_account: {
    title: '企業單點登錄帳戶',
    description: '查看從連接的 {{connectorName}} 帳戶同步的用戶數據和個人資料信息。',
    provider_name: '企業單點登錄身份提供者名稱',
    identity_id: '企業單點登錄身份 ID',
    user_profile: '從企業單點登錄身份提供者同步的用戶資料',
  },
  token_storage: {
    title: '訪問令牌',
    description:
      '將 {{connectorName}} 的訪問和刷新令牌存儲在密鑰庫中。允許自動 API 調用而無需重複用戶同意。',
  },
  access_token: {
    title: '訪問令牌',
    description_active:
      '訪問令牌是活躍且安全地存儲在密鑰庫中。你的產品可以使用它訪問 {{connectorName}} API。',
    description_inactive: '此訪問令牌為非活躍（如被撤銷）。用戶必須重新授權以恢復功能。',
    description_expired:
      '此訪問令牌已過期。在下一次 API 請求時將自動使用刷新令牌進行更新。如果刷新令牌不可用，則需要用戶重新身份驗證。',
  },
  refresh_token: {
    available: '刷新令牌可用。如果訪問令牌過期，將自動使用刷新令牌進行刷新。',
    not_available: '刷新令牌不可用。訪問令牌過期後，用戶必須重新身份驗證以獲得新的令牌。',
  },
  token_status: '令牌狀態',
  created_at: '創建於',
  updated_at: '更新於',
  expires_at: '過期於',
  scopes: '範圍',
  delete_tokens: {
    title: '刪除令牌',
    description: '刪除已存儲的令牌。用戶必須重新授權以恢復功能。',
    confirmation_message:
      '你確定要刪除令牌嗎？Logto 密鑰庫將移除存儲的 {{connectorName}} 訪問和刷新令牌。此用戶必須重新授權以恢復 {{connectorName}} API 訪問。',
  },
  token_storage_disabled: {
    title: '此連接器的令牌存儲已禁用',
    description:
      '用戶目前只能使用 {{connectorName}} 進行登錄、鏈接帳戶或在每次同意流程中同步個人資料。要訪問 {{connectorName}} API 並代表用戶執行操作，請在中啟用令牌存儲',
  },
};

export default Object.freeze(user_identity_details);
