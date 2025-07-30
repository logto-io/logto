const verification_record = {
  not_found: 'Doğrulama kaydı bulunamadı.',
  permission_denied: 'İzin reddedildi, lütfen tekrar kimlik doğrulaması yapın.',
  not_supported_for_google_one_tap: "Bu API, Google One Tap'i desteklemiyor.",
  social_verification: {
    invalid_target: 'Geçersiz doğrulama kaydı. Beklenen {{expected}} ancak alınan {{actual}}.',
    token_response_not_found:
      'Jeton yanıtı bulunamadı. Lütfen sosyal bağlayıcı için jeton depolamanın desteklenip etkinleştirildiğini kontrol edin.',
  },
};

export default Object.freeze(verification_record);
