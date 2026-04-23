const oidc_configs = {
  sessions_card_title: 'Logto 工作階段',
  sessions_card_description:
    '自訂由 Logto 授權伺服器儲存的工作階段政策。它會記錄使用者的全域驗證狀態，以啟用 SSO 並允許跨應用程式的靜默重新驗證。',
  session_max_ttl_in_days: '工作階段最長存活時間（TTL，以天計）',
  session_max_ttl_in_days_tip:
    '自建立工作階段起算的絕對存活期限上限。無論是否有活動，工作階段都會在此固定時長到期後結束。',
  oss_notice:
    '對於 Logto OSS，更新任何 OIDC 設定（包括工作階段設定與<keyRotationsLink>金鑰輪替</keyRotationsLink>）後，都需要重新啟動執行個體才會生效。若要在不重新載入服務的情況下自動套用所有 OIDC 設定更新，請<centralCacheLink>啟用中央快取</centralCacheLink>。',
  cloud_private_key_rotation_notice: '在 Logto Cloud 中，私鑰輪換會在 4 小時的寬限期後生效。',
};

export default Object.freeze(oidc_configs);
