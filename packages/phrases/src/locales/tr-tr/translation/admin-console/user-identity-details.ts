const user_identity_details = {
  social_identity_page_title: 'Sosyal kimlik bilgileri',
  back_to_user_details: 'Kullanıcı detaylarına geri dön',
  delete_identity: `Kimlik bağlantısını kaldır`,
  social_account: {
    title: 'Sosyal hesap',
    description:
      '{{connectorName}} hesabından senkronize edilen kullanıcı verilerini ve profil bilgilerini görüntüleyin.',
    provider_name: 'Sosyal kimlik sağlayıcı adı',
    identity_id: 'Sosyal kimlik ID',
    user_profile: 'Sosyal kimlik sağlayıcıdan senkronize edilen kullanıcı profili',
  },
  sso_account: {
    title: 'Kurumsal SSO hesap',
    description:
      '{{connectorName}} hesabından senkronize edilen kullanıcı verilerini ve profil bilgilerini görüntüleyin.',
    provider_name: 'Kurumsal SSO kimlik sağlayıcı adı',
    identity_id: 'Kurumsal SSO kimlik ID',
    user_profile: 'Kurumsal SSO kimlik sağlayıcıdan senkronize edilen kullanıcı profili',
  },
  token_storage: {
    title: 'Erişim belirteci',
    description:
      "{{connectorName}}'ten erişim ve yenileme belirteçlerini Gizli Kasada depolayın. Tekrarlanan kullanıcı onayı olmadan otomatik API çağrıları yapılmasına izin verir.",
  },
  access_token: {
    title: 'Erişim belirteci',
    description_active:
      "Erişim belirteci aktif ve Gizli Kasada güvenli bir şekilde saklanmıştır. Ürününüz, {{connectorName}} API'lerine erişmek için kullanabilir.",
    description_inactive:
      'Bu erişim belirteci etkin değil (örneğin, iptal edilmiş). Kullanıcılar işlevselliği geri yüklemek için erişimi yeniden yetkilendirmelidir.',
    description_expired:
      'Bu erişim belirtecinin süresi dolmuştur. Yenileme, yenileme belirteci kullanılarak bir sonraki API isteğinde otomatik olarak gerçekleşir. Yenileme belirteci yoksa, kullanıcı yeniden kimlik doğrulaması gereklidir.',
  },
  refresh_token: {
    available:
      'Yenileme belirteci mevcut. Erişim belirtecinin süresi dolduğunda, yenileme belirteci kullanılarak otomatik olarak yenilenecektir.',
    not_available:
      'Yenileme belirteci mevcut değil. Erişim belirtecinin süresi dolduktan sonra, kullanıcılar yeni belirteçler almak için yeniden kimlik doğrulaması yapmalıdır.',
  },
  token_status: 'Belirteç durumu',
  created_at: 'Oluşturulma tarihi',
  updated_at: 'Güncellenme tarihi',
  expires_at: 'Sona erme tarihi',
  scopes: 'Kapsamlar',
  delete_tokens: {
    title: 'Belirteçleri sil',
    description:
      'Saklanan belirteçleri silin. Kullanıcılar işlevselliği geri yüklemek için erişimi yeniden yetkilendirmelidir.',
    confirmation_message:
      'Belirteçleri silmek istediğinizden emin misiniz? Logto Gizli Kasa saklanan {{connectorName}} erişim ve yenileme belirteçlerini kaldıracaktır. Bu kullanıcı, {{connectorName}} API erişimini geri yüklemek için yeniden yetkilendirmelidir.',
  },
  token_storage_disabled: {
    title: 'Bu bağlayıcı için belirteç saklama devre dışı bırakıldı',
    description:
      "Kullanıcılar şu anda {{connectorName}} kullanarak yalnızca oturum açmak, hesapları bağlamak veya her izin akışında profilleri senkronize etmek için kullanabilirler. {{connectorName}} API'lerine erişmek ve kullanıcılar adına işlemler yapmak için belirteç saklamayı etkinleştirin",
  },
};

export default Object.freeze(user_identity_details);
