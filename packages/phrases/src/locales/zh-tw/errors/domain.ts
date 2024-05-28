const domain = {
  not_configured: '域名主機名稱提供者未配置。',
  cloudflare_data_missing: 'cloudflare_data 缺失，請確認。',
  cloudflare_unknown_error: '在請求 Cloudflare API 時出現未知錯誤',
  cloudflare_response_error: '從 Cloudflare 收到意外回應',
  limit_to_one_domain: '您只能擁有一個自訂網域。',
  hostname_already_exists: '此網域名稱已經存在我們的伺服器中。',
  cloudflare_not_found: '無法找到 Cloudflare 中的主機名',
  domain_is_not_allowed: '這個網域不允許。',
};

export default Object.freeze(domain);
