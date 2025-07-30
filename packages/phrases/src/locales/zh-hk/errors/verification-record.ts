const verification_record = {
  not_found: '未能找到驗證記錄。',
  permission_denied: '沒有權限，請重新驗證。',
  not_supported_for_google_one_tap: '此 API 不支持 Google One Tap。',
  social_verification: {
    invalid_target: '驗證記錄無效。預期 {{expected}}，但獲得 {{actual}}。',
    token_response_not_found: '找不到令牌響應。請檢查社交連接器是否支持並啟用了令牌存儲。',
  },
};

export default Object.freeze(verification_record);
