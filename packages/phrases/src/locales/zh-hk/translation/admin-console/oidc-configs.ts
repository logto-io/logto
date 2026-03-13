const oidc_configs = {
  sessions_card_title: 'Logto 工作階段',
  sessions_card_description:
    '自訂由 Logto 授權伺服器儲存的工作階段政策。它會記錄使用者的全域驗證狀態，以啟用 SSO 並允許跨應用程式的靜默重新驗證。',
  session_max_ttl_in_days: '工作階段最長存活時間（TTL，以天計）',
  session_max_ttl_in_days_tip:
    '從建立工作階段起計的絕對存活期限上限。無論是否有活動，工作階段都會在此固定時長屆滿後結束。',
};

export default Object.freeze(oidc_configs);
