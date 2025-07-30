const verification_record = {
  not_found: '未找到验证记录。',
  permission_denied: '权限被拒绝，请重新验证。',
  not_supported_for_google_one_tap: '此 API 不支持 Google One Tap。',
  social_verification: {
    invalid_target: '无效的验证记录。预期为 {{expected}}，但得到的是 {{actual}}。',
    token_response_not_found: '未找到令牌响应。请检查社交连接器是否支持并启用了令牌存储。',
  },
};

export default Object.freeze(verification_record);
