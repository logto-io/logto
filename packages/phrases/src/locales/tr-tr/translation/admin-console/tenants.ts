const tenants = {
  create_modal: {
    title: 'Kiracı Oluştur',
    subtitle: 'Kaynakları ve kullanıcıları ayırmak için yeni bir kiracı oluşturun.',
    create_button: 'Kiracı oluştur',
    tenant_name_placeholder: 'Benim kiracım',
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
  tenant_landing_page: {
    title: 'Henüz bir kiracı oluşturmadınız',
    description:
      'Logto ile projenizi yapılandırmaya başlamak için lütfen yeni bir kiracı oluşturun. Hesabınızdan çıkış yapmanız veya hesabınızı silmeniz gerekiyorsa, sağ üst köşedeki avatar düğmesine tıklayın.',
    create_tenant_button: 'Kiracı oluştur',
  },
  tenant_created: "Kiracı '{{name}}' başarıyla oluşturuldu.",
};

export default tenants;
