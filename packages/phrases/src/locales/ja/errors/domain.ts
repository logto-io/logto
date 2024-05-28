const domain = {
  not_configured: 'Domain hostname provider が設定されていません。',
  cloudflare_data_missing: 'cloudflare_data が見つかりませんでした。確認してください。',
  cloudflare_unknown_error: 'Cloudflare API のリクエスト中に未知のエラーが発生しました。',
  cloudflare_response_error: 'Cloudflare から予期しない応答がありました。',
  limit_to_one_domain: 'カスタムドメインは1つしか持てません。',
  hostname_already_exists: 'サーバーには既にこのドメインが存在しています。',
  cloudflare_not_found: 'Cloudflare からホスト名が見つかりませんでした。',
  domain_is_not_allowed: 'このドメインは許可されていません。',
};

export default Object.freeze(domain);
