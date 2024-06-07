const tenants = {
  title: 'Ayarlar',
  description: 'Kiracı ayarlarını verimli bir şekilde yönetin ve alan adınızı özelleştirin.',
  tabs: {
    settings: 'Ayarlar',
    members: 'Üyeler',
    domains: 'Alan adları',
    subscription: 'Plan ve faturalandırma',
    billing_history: 'Fatura geçmişi',
  },
  settings: {
    title: 'AYARLAR',
    description: 'Kiracı adını ayarlayın ve verilerinizin barındırıldığı bölgeyi görüntüleyin.',
    tenant_id: 'Kiracı Kimliği',
    tenant_name: 'Kiracı Adı',
    tenant_region: 'Veriler barındırılan bölge',
    tenant_region_tip:
      'Kiracı kaynaklarınız {{region}} bölgesinde barındırılır. <a>Daha fazla bilgi</a>',
    environment_tag_development: 'Geliş',
    environment_tag_production: 'Prod',
    tenant_type: 'Kiracı türü',
    development_description:
      "Yalnızca test amacıyla ve üretimde kullanılmamalıdır. Abonelik gerekli değildir. Tüm pro özelliklere sahiptir ancak giriş banner'ı gibi bazı sınırlamaları bulunmaktadır. <a>Daha fazla bilgi</a>",
    production_description:
      'Son kullanıcılar tarafından kullanılan uygulamalar için tasarlanmıştır ve ücretli abonelik gerektirebilir. <a>Daha fazla bilgi</a>',
    tenant_info_saved: 'Kiracı bilgileri başarıyla kaydedildi.',
  },
  full_env_tag: {
    development: 'Geliştirme',
    production: 'Prod',
  },
  deletion_card: {
    title: 'SİL',
    tenant_deletion: 'Kiracıyı Sil',
    tenant_deletion_description:
      'Kiracının silinmesi, tüm ilişkili kullanıcı verilerinin ve yapılandırmalarının kalıcı olarak silinmesine neden olur. Lütfen dikkatli bir şekilde devam edin.',
    tenant_deletion_button: 'Kiracıyı Sil',
  },
  leave_tenant_card: {
    title: 'AYRIL',
    leave_tenant: 'Kiracıyı Ayrıl',
    leave_tenant_description:
      'Kiracıda kalan tüm kaynaklarınız kalır, ancak artık bu kiracıya erişiminiz olmaz.',
    last_admin_note:
      'Bu kiracıdan ayrılmak için, en az bir başka üyenin Yönetici rolüne sahip olduğundan emin olun.',
  },
  create_modal: {
    title: 'Kiracı Oluştur',
    tenant_usage_purpose: 'Bu kiracıyı ne için kullanmak istiyorsunuz?',
    development_description:
      'Yalnızca test amacıyla ve üretimde kullanılmamalıdır. Abonelik gerekli değildir.',
    development_hint:
      'Tüm pro özelliklere sahiptir ancak giriş bannerı gibi bazı sınırlamaları bulunmaktadır.',
    production_description:
      'Son kullanıcılar tarafından kullanılmak üzere tasarlanmıştır ve ücretli bir abonelik gerekebilir.',
    available_plan: 'Mevcut plan:',
    create_button: 'Kiracı oluştur',
    tenant_name_placeholder: 'Benim kiracım',
  },
  dev_tenant_migration: {
    title:
      'Pro özelliklerimizi ücretsiz olarak deneyebilirsiniz, yeni "Geliştirme kiracısı" oluşturarak!',
    affect_title: 'Bunu denemenin sizin için bir etkisi var mı?',
    hint_1:
      'Eski <strong>ortam etiketlerini</strong> iki yeni kiracı türü ile değiştiriyoruz: <strong>“Gelişme”</strong> ve <strong>“Prod”</strong>.',
    hint_2:
      'Sorunsuz bir geçiş ve kesintisiz işlevsellik sağlamak için, tüm erken oluşturulan kiracılarınız önceki aboneliğinizle birlikte <strong>Prod</strong> kiracı türüne yükseltilecektir.',
    hint_3: 'Endişelenmeyin, diğer tüm ayarlarınız aynı kalacak.',
    about_tenant_type: 'Kiracı türü hakkında',
  },
  delete_modal: {
    title: 'Kiracıyı Sil',
    description_line1:
      'Kiracınız "<span>{{name}}</span>" ve ortam ek etiketi "<span>{{tag}}</span>" ile kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve tüm veri ve kiracı bilgilerinizin kalıcı olarak silinmesine neden olacaktır.',
    description_line2:
      'Kiracıyı silmeden önce size yardımcı olabiliriz. <span><a>E-posta yoluyla bizimle iletişime geçin</a></span>',
    description_line3: '"{{name}}" kiracı adını doğrulamak için devam edin',
    delete_button: 'Kalıcı olarak sil',
    cannot_delete_title: 'Bu kiracı silinemez',
    cannot_delete_description:
      'Üzgünüm, şu anda bu kiracıyı silemezsiniz. Ücretsiz aboneliğinizde olmadığınızdan ve tüm faturalarınızın ödendiğinden emin olun.',
  },
  leave_tenant_modal: {
    description: 'Bu kiracıdan ayrılmak istediğinize emin misiniz?',
    leave_button: 'Ayrıl',
  },
  tenant_landing_page: {
    title: 'Henüz bir kiracı oluşturmadınız',
    description:
      'Logto ile projenizi yapılandırmaya başlamak için lütfen yeni bir kiracı oluşturun. Hesabınızdan çıkış yapmanız veya hesabınızı silmeniz gerekiyorsa, sağ üst köşedeki avatar düğmesine tıklayın.',
    create_tenant_button: 'Kiracı oluştur',
  },
  status: {
    mau_exceeded: 'MAU Sınırı Aşıldı',
    suspended: 'Askıya Alındı',
    overdue: 'Geçmişte',
  },
  tenant_suspended_page: {
    title: 'Kiracı Askıya Alındı. Erişimi geri yüklemek için bizimle iletişime geçin.',
    description_1:
      'Üzülerek bildirmekten üzüntü duyoyruz, kiracı hesabınız şu anda geçici olarak askıya alınmıştır. Bunun nedeni, MAU sınırlarını aşmak, gecikmiş ödemeler veya diğer izinsiz işlemler gibi yanlış kullanımdır.',
    description_2:
      'Daha fazla açıklama, endişeleriniz veya işlevselliği tamamen geri yüklemek ve kiracılarınızı engellemek isterseniz, lütfen derhal bizimle iletişime geçmekten çekinmeyin.',
  },
};

export default Object.freeze(tenants);
