const domain = {
  not_configured: 'Alan adı ana bilgisayar sağlayıcısı yapılandırılmamış.',
  cloudflare_data_missing: 'cloudflare_data eksik, lütfen kontrol edin.',
  cloudflare_unknown_error: 'Cloudflare API isteği yapılırken bilinmeyen bir hata oluştu.',
  cloudflare_response_error: 'Cloudflare’dan beklenmeyen bir yanıt alındı.',
  limit_to_one_domain: 'Sadece bir özel alan adınız olabilir.',
  hostname_already_exists: 'Bu alan adı sunucumuzda zaten mevcut.',
  cloudflare_not_found: "Cloudflare'da alan adı bulunamadı.",
  domain_is_not_allowed: 'Bu alan adı izin verilen değildir.',
};

export default Object.freeze(domain);
