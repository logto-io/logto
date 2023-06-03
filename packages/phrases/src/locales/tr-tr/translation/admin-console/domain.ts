const domain = {
  status: {
    connecting: 'Bağlanıyor',
    in_used: 'Kullanımda',
    failed_to_connect: 'Bağlantı başarısız oldu',
  },
  update_endpoint_alert: {
    description:
      'Özel alan adınız başarıyla yapılandırıldı. Aşağıdaki kaynakları yapılandırmışsanız, <span>{{domain}}</span> kullanmış olduğunuz alan adını da güncellemeniz gerekiyor.',
    endpoint_url: "<a>{{link}}</a> uç nokta URL'si",
    application_settings_link_text: 'Uygulama Ayarları',
    callback_url: "<a>{{link}}</a> geri çağrı URL'si",
    social_connector_link_text: 'Sosyal Bağlayıcı',
    api_identifier: '<a>{{link}}</a> API tanımlayıcısı',
    uri_management_api_link_text: "URI Yönetimi API'si",
    tip: 'Ayarları değiştirdikten sonra, deneyimimizde Test edebilirsiniz <a>{{link}}</a>.',
  },
  custom: {
    custom_domain: 'Özel Alan Adı',
    custom_domain_description:
      'Varsayılan alan adını kendi alan adınızla değiştirerek markanızla tutarlılık sağlayın ve kullanıcılarınız için oturum açma deneyimini kişiselleştirin.',
    custom_domain_field: 'Özel alan adı',
    custom_domain_placeholder: 'alan_adınız.com',
    add_domain: 'Alan Adı Ekle',
    invalid_domain_format:
      'Geçersiz alt alan adı biçimi. Lütfen en az üç parçadan oluşan bir alt alan adı girin.',
    verify_domain: 'Alan adınızı doğrulayın',
    enable_ssl: "SSL'i etkinleştir",
    checking_dns_tip:
      'DNS kayıtlarını yapılandırdıktan sonra, işlem otomatik olarak çalışır ve 24 saate kadar sürebilir. Bu arayüzden ayrılabilirsiniz.',
    generating_dns_records: 'DNS kayıtları oluşturuluyor...',
    add_dns_records: 'Lütfen bu DNS kayıtlarını DNS sağlayıcınıza ekleyin.',
    dns_table: {
      type_field: 'Tip',
      name_field: 'İsim',
      value_field: 'Değer',
    },
    deletion: {
      delete_domain: 'Alan Adını Sil',
      reminder: 'Özel Alan Adını Sil',
      description: 'Bu özel alan adını silmek istediğinizden emin misiniz?',
      in_used_description:
        'Bu özel alan adını "<span>{{domain}}</span>" silmek istediğinizden emin misiniz?',
      in_used_tip:
        'Bu özel alan adını önce sosyal bağlantı sağlayıcınızda veya uygulama uç noktasında yapılandırdıysanız, URI\'yi önce Logto varsayılan alan adı olan "<span>{{domain}}</span>" olarak değiştirmeniz gerekir. Bu, sosyal giriş düğmesinin düzgün çalışması için gereklidir.',
      deleted: 'Özel alan adı başarıyla silindi!',
    },
  },
  default: {
    default_domain: 'Varsayılan Alan Adı',
    default_domain_description:
      'Hemen kullanılabilecek bir varsayılan alan adı sağlıyoruz. Özelleştirilmiş bir alan adına geçerseniz bile her zaman kullanılabilir, bu da uygulamanıza her zaman oturum açma imkanı verir.',
    default_domain_field: 'Logto varsayılan alan adı',
  },
};

export default domain;
