const protected_app = {
  name: 'Korunaklı Uygulama',
  title: 'Korunaklı Bir Uygulama Oluştur: Kimlik doğrulamayı basitlik ve epik hızla ekleyin',
  fast_create: 'Hızlı oluştur',
  modal_title: 'Korunaklı Uygulama Oluştur',
  modal_subtitle:
    'Tıklamalarla güvenli ve hızlı koruma etkinleştirin. Mevcut web uygulamanıza kolayca kimlik doğrulama ekleyin.',
  form: {
    url_field_label: "Orijin URL'iniz",
    url_field_placeholder: 'https://domain.com/',
    url_field_description: 'Kimlik doğrulama koruması gereken uygulamanızın adresini sağlayın.',
    url_field_modification_notice:
      "Orijin URL'sinde yapılan değişiklikler, küresel ağ konumlarında etkin olmak için 1-2 dakika sürebilir.",
    url_field_tooltip:
      "Uygulamanızın adresini sağlayın, '/dizinadı' hariç. Oluşturduktan sonra, rotanızın kimlik doğrulama kurallarını özelleştirebilirsiniz.\n\nNot: Orijinal URL kendisi kimlik doğrulamayı gerektirmiyor; koruma yalnızca belirlenmiş uygulama alanı üzerinden erişimlere uygulanır.",
    domain_field_label: 'Uygulama alanı',
    domain_field_placeholder: 'alan-adınız',
    domain_field_description:
      'Bu URL, orijinal URL için bir kimlik doğrulama koruma proxyi olarak hizmet verir. Özel alan oluşturulduktan sonra uygulanabilir.',
    domain_field_description_short:
      'Bu URL, orijinal URL için bir kimlik doğrulama koruma proxyi olarak hizmet verir.',
    domain_field_tooltip:
      "Logto tarafından korunan uygulamalar varsayılan olarak 'alan-adınız.{{domain}}' şeklinde barındırılacaktır. Özel alan oluşturulduktan sonra uygulanabilir.",
    create_application: 'Uygulama oluştur',
    create_protected_app: 'Hızlı oluştur',
    errors: {
      domain_required: 'Alan adınız gereklidir.',
      domain_in_use: 'Bu alt alan adı zaten kullanılıyor.',
      invalid_domain_format:
        "Geçersiz alt alan adı formatı: sadece küçük harfler, sayılar ve kısa çizgiler '-' kullanın.",
      url_required: "Orijin URL'si gereklidir.",
      invalid_url:
        "Geçersiz orijin URL formatı: http:// veya https:// kullanın. Not: '/dizinadı' şu anda desteklenmiyor.",
      localhost:
        'Lütfen önce yerel sunucunuzu internete açın. <a>Yerel geliştirme</a> hakkında daha fazla bilgi edinin.',
    },
  },
  id_token_claims: {
    card_title: 'ID token claimleri',
    card_description:
      "Korumalı uygulamada oturum açarken etkinleştirilen genişletilmiş claimleri iletilen ID token'a dahil etmek için ek kullanıcı scope'larını isteyin.",
    field_title: "Ek scope'lar",
    field_description:
      "Claimler yalnızca <a>Custom JWT > ID token</a> üzerinde etkinleştirildiğinde ve burada eşleşen scope'un istenmesi durumunda dahil edilir.",
    table_column_scope: 'Scope',
    table_column_claims_forwarded: 'İletilen claimler',
    disabled_claims_hint:
      "Gri renkli claimler henüz iletilmiyor. ID token'a dahil etmek için <a>Custom JWT > ID token</a> üzerinde etkinleştirin.",
  },
  success_message:
    '🎉 Uygulama kimlik doğrulaması başarıyla etkinleştirildi! Web sitenizin yeni deneyimini keşfedin.',
};

export default Object.freeze(protected_app);
