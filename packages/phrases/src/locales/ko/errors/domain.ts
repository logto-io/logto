const domain = {
  not_configured: '도메인 호스트 이름 공급 업체가 구성되어 있지 않습니다.',
  cloudflare_data_missing: 'cloudflare_data 가 없습니다. 확인하십시오.',
  cloudflare_unknown_error: 'Cloudflare API 요청시 알 수 없는 오류 발생',
  cloudflare_response_error: 'Cloudflare 로부터 예상치 못한 응답을 받았습니다.',
  limit_to_one_domain: '하나의 맞춤 도메인만 사용할 수 있습니다.',
  hostname_already_exists: '이 도메인은 이미 서버에 존재합니다.',
  cloudflare_not_found: 'Cloudflare에서 호스트 이름을 찾을 수 없습니다.',
  domain_is_not_allowed: '이 도메인은 허용되지 않습니다.',
};

export default Object.freeze(domain);
