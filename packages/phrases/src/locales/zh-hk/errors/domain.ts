const domain = {
  not_configured: '域名主機供應商未設定。',
  cloudflare_data_missing: 'cloudflare_data 缺失，請檢查。',
  cloudflare_unknown_error: '獲取 Cloudflare API 時發生未知錯誤',
  cloudflare_response_error: '從 Cloudflare 獲取到意外的響應',
  limit_to_one_domain: '你只能擁有一個自訂域名。',
  hostname_already_exists: '此域名已存在於我們的伺服器中。',
  cloudflare_not_found: '無法在 Cloudflare 中找到主機名',
  domain_is_not_allowed: '這個域名不被允許。',
};

export default Object.freeze(domain);
