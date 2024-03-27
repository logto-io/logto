const tenants = {
  title: 'Ayarlar',
  description: 'Kiracı ayarlarını verimli bir şekilde yönetin ve alan adınızı özelleştirin.',
  tabs: {
    settings: 'Ayarlar',
    /** UNTRANSLATED */
    members: 'Members',
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
    /** UNTRANSLATED */
    title: 'LEAVE',
    /** UNTRANSLATED */
    leave_tenant: 'Leave tenant',
    /** UNTRANSLATED */
    leave_tenant_description:
      'Any resources in the tenant will remain but you no longer have access to this tenant.',
    /** UNTRANSLATED */
    last_admin_note: 'To leave this tenant, ensure at least one more member has the Admin role.',
  },
  create_modal: {
    title: 'Kiracı Oluştur',
    subtitle:
      'İzole kaynaklara ve kullanıcılara sahip yeni bir kiracı oluşturun. Verilerin barındırıldığı bölge ve kiracı türleri oluşturulduktan sonra değiştirilemez.',
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
      '"{{name}}" adlı kiracınızı "{{tag}}" ortam etiketiyle silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm verilerinizin ve hesap bilgilerinizin kalıcı olarak silinmesine neden olur.',
    description_line2:
      'Hesabınızı silmeden önce size yardımcı olabiliriz. <span><a>E-posta yoluyla bize ulaşın</a></span>',
    description_line3: 'Devam etmek isterseniz, "{{name}}" kiracı adını onaylamak için yazın.',
    delete_button: 'Kalıcı olarak sil',
    cannot_delete_title: 'Bu kiracı silinemez',
    cannot_delete_description:
      'Üzgünüm, bu kiracıyı şu anda silemezsiniz. Ücretsiz Plan üzerinde olduğunuzdan ve tüm ödenmemiş faturaları ödediğinizden emin olun.',
  },
  leave_tenant_modal: {
    /** UNTRANSLATED */
    description: 'Are you sure you want to leave this tenant?',
    /** UNTRANSLATED */
    leave_button: 'Leave',
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
