const oidc_configs = {
  sessions_card_title: 'Logto oturumları',
  sessions_card_description:
    'Logto yetkilendirme sunucusunda saklanan oturum politikasını özelleştirin. Kullanıcının genel kimlik doğrulama durumunu kaydeder; böylece SSO etkinleşir ve uygulamalar arasında sessiz yeniden kimlik doğrulama sağlanır.',
  session_max_ttl_in_days: 'Oturum için gün cinsinden azami yaşam süresi (TTL)',
  session_max_ttl_in_days_tip:
    'Oturum oluşturulduğu andan itibaren mutlak bir ömür sınırıdır. Etkinlikten bağımsız olarak bu sabit süre dolduğunda oturum sona erer.',
  oss_notice:
    'Logto OSS için, değişikliklerin geçerli olması amacıyla herhangi bir OIDC yapılandırmasını (oturum ayarları ve <keyRotationsLink>anahtar rotasyonu</keyRotationsLink> dahil) güncelledikten sonra örneğinizi yeniden başlatın. Tüm OIDC yapılandırma güncellemelerini hizmeti yeniden yüklemeden otomatik uygulamak için <centralCacheLink>merkezi önbelleği etkinleştirin</centralCacheLink>.',
};

export default Object.freeze(oidc_configs);
