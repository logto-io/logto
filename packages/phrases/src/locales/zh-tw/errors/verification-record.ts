const verification_record = {
  not_found: '找不到驗證紀錄。',
  permission_denied: '權限被拒，請重新驗證身份。',
  not_supported_for_google_one_tap: '此 API 不支援 Google One Tap。',
  social_verification: {
    invalid_target: '驗證紀錄無效。預期為 {{expected}}，但收到的是 {{actual}}。',
    token_response_not_found: '找不到令牌回應。請檢查社交連接器是否支援並啟用了令牌存儲。',
  },
};

export default Object.freeze(verification_record);
