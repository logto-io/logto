const profile = {
  page_title: 'Hesap Ayarları',
  title: 'Hesap Ayarları',
  description:
    'Hesap güvenliğinizi sağlamak için hesap ayarlarınızı değiştirin ve kişisel bilgilerinizi yönetin.',
  settings: {
    title: 'PROFİL AYARLARI',
    profile_information: 'Profil bilgisi',
    avatar: 'Avatar',
    name: 'İsim',
    username: 'Kullanıcı adı',
  },
  link_account: {
    title: 'HESABI BAĞLA',
    email_sign_in: 'E-posta ile giriş',
    email: 'E-posta',
    social_sign_in: 'Sosyal medya hesabıyla giriş',
    link_email: 'E-postayı bağla',
    link_email_subtitle:
      'Giriş yapmak veya hesap kurtarımında yardımcı olmak için e-postanızı bağlayın.',
    email_required: 'E-posta gerekli',
    invalid_email: 'Geçersiz e-posta adresi',
    identical_email_address: 'Girilen e-posta adresi mevcut olanla aynı',
    anonymous: 'Anonim',
  },
  password: {
    title: 'ŞİFRE VE GÜVENLİK',
    password: 'Şifre',
    password_setting: 'Şifre ayarları',
    new_password: 'Yeni şifre',
    confirm_password: 'Şifreyi onayla',
    enter_password: 'Şifre girin',
    enter_password_subtitle: 'Hesap güvenliğinizi korumak için siz olduğunuzu doğrulayın.',
    set_password: 'Şifre oluştur',
    verify_via_password: 'Şifre ile doğrula',
    show_password: 'Şifreyi göster',
    required: 'Şifre gerekli',
    min_length: 'Şifre en az {{min}} karakterden oluşmalıdır',
    do_not_match: 'Şifreler eşleşmiyor. Tekrar deneyin.',
  },
  code: {
    enter_verification_code: 'Doğrulama kodu girin',
    enter_verification_code_subtitle:
      'Doğrulama kodu, <strong>{{target}}</strong> adresine gönderildi.',
    verify_via_code: 'Doğrulama kodu ile doğrula',
    resend: 'Doğrulama kodunu tekrar gönder',
    resend_countdown: '{{countdown}} saniye içinde tekrar gönder',
  },
  delete_account: {
    title: 'HESABI SİL',
    label: 'Hesabı sil',
    description:
      'Hesabınızın tüm kişisel bilgileri, kullanıcı verileri ve yapılandırması silinecektir. Bu işlem geri alınamaz.',
    button: 'Hesabı sil',
    dialog_paragraph_1:
      'Hesabınızı silmek istediğinize üzgünüz. Hesabınız kalıcı olarak tüm verileri, kullanıcı bilgileri, kayıtlar ve ayarlar dahil olmak üzere silinecektir ve bu işlem geri alınamaz. Bu nedenle, devam etmeden önce önemli verilerinizi yedeklediğinizden emin olun.',
    dialog_paragraph_2:
      'Hesap silme işlemine devam etmek için, lütfen destek ekibimize, <a>mail</a> adresine “Hesap Silme İsteği” konulu e-posta gönderin. Size yardımcı olacağız ve tüm verilerinizin sistemimizden uygun şekilde silineceğinden emin olacağız.',
    dialog_paragraph_3:
      'Logto Cloud’u tercih ettiğiniz için teşekkür ederiz. Herhangi bir sorunuz veya endişeniz varsa, bizimle iletişime geçmekten çekinmeyin.',
  },
  set: 'Ayarla',
  change: 'Değiştir',
  link: 'Bağla',
  unlink: 'Bağlantıyı kes',
  not_set: 'Belirtilmemiş',
  change_avatar: 'Avatarı değiştir',
  change_name: 'İsmi değiştir',
  change_username: 'Kullanıcı adını değiştir',
  set_name: 'İsmi ayarla',
  email_changed: 'E-posta değiştirildi!',
  password_changed: 'Şifre değiştirildi!',
  updated: '{{target}} güncellendi!',
  linked: '{{target}} bağlandı!',
  unlinked: '{{target}} bağlantısı kesildi!',
  email_exists_reminder:
    'Bu e-posta {{email}}, mevcut bir hesapla ilişkilendirilmiştir. Başka bir e-posta bağlayın.',
  unlink_confirm_text: 'Evet, bağlantıyı kes',
  unlink_reminder:
    'Bağlantıyı keserseniz, kullanıcılar <span></span> hesabıyla giriş yapamazlar. Devam etmek istediğinizden emin misiniz?',
};

export default profile;
