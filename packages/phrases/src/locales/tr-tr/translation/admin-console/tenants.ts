const tenants = {
  create_modal: {
    title: 'Kiracı Oluştur',
    subtitle: 'Kaynakları ve kullanıcıları ayırmak için yeni bir kiracı oluşturun.',
    create_button: 'Kiracı oluştur',
    tenant_name: 'Kiracı Adı',
    tenant_name_placeholder: 'Benim kiracım',
    environment_tag: 'Çevre Etiketi',
    environment_tag_description:
      'Kiracı kullanım ortamlarını ayırt etmek için etiketleri kullanın. Her etiket içindeki hizmetler aynıdır, tutarlılığı sağlar.',
    environment_tag_development: 'Geliştirme',
    environment_tag_staging: 'Daha Yüksek Birlik',
    environment_tag_production: 'Üretim',
  },
  delete_modal: {
    title: 'Kiracıyı Sil',
    description_line1:
      'Ortam etiketi "<span>{{tag}}</span>" olan "<span>{{name}}</span>" kiracınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm verilerinizin ve hesap bilgilerinizin kalıcı olarak silinmesine neden olur.',
    description_line2:
      'Hesabınızı silmeden önce size yardımcı olabiliriz. <span><a>E-posta yoluyla bize ulaşın</a></span>',
    description_line3:
      'Devam etmek isterseniz, "<span>{{name}}</span>" kiracı adını onaylamak için yazın.',
    delete_button: 'Kalıcı olarak sil',
  },
  tenant_created: "Kiracı '{{name}}' başarıyla oluşturuldu.",
};

export default tenants;
