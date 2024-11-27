const cloud = {
  general: {
    onboarding: 'Başlatma',
  },
  create_tenant: {
    page_title: 'Kiracı oluştur',
    title: 'İlk kiracınızı oluşturun',
    description:
      'Bir kiracı, kullanıcı kimliklerini, uygulamaları ve diğer tüm Logto kaynaklarını yönetebileceğiniz izole bir ortamdır.',
    invite_collaborators: 'E-posta ile işbirlikçilerinizi davet edin',
  },
  social_callback: {
    title: 'Başarıyla giriş yaptınız',
    description:
      "Sosyal hesabınızı kullanarak başarılı bir şekilde giriş yaptınız. Logto'nun tüm özelliklerine sorunsuz entegrasyon ve erişim sağlamak için kendi sosyal konektörünüzü yapılandırmaya devam etmenizi öneririz.",
    /** UNTRANSLATED */
    notice:
      "Please avoid using the demo connector for production purposes. Once you've completed testing, kindly delete the demo connector and set up your own connector with your credentials.",
  },
  tenant: {
    create_tenant: 'Kiracı Oluştur',
  },
};

export default Object.freeze(cloud);
