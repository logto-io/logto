const tenants = {
  title: 'Ayarlar',
  description: 'Kiracı ayarlarını verimli bir şekilde yönetin ve alan adınızı özelleştirin.',
  tabs: {
    settings: 'Ayarlar',
    domains: 'Alan adları',
    subscription: 'Plan ve faturalandırma',
    billing_history: 'Fatura geçmişi',
  },
  settings: {
    title: 'AYARLAR',
    description:
      'Kiracı adını ayarlayın ve verilerinizin barındığı bölgeyi ve ortam etiketinizi görüntüleyin.',
    tenant_id: 'Kiracı Kimliği',
    tenant_name: 'Kiracı Adı',
    /** UNTRANSLATED */
    tenant_region: 'Data hosted region',
    /** UNTRANSLATED */
    tenant_region_tip: 'Your tenant resources are hosted in {{region}}. <a>Learn more</a>',
    environment_tag: 'Çevre Etiketi',
    environment_tag_description:
      'Etiketler hizmeti değiştirmez. Sadece farklı ortamları ayırt etmek için rehberlik eder.',
    environment_tag_development: 'Geliş',
    environment_tag_staging: 'Staging',
    environment_tag_production: 'Prod',
    /** UNTRANSLATED */
    development_description:
      'Development environment is mainly used for testing and include all pro features but have watermarks in the sign in experience. <a>Learn more</a>',
    tenant_info_saved: 'Kiracı bilgileri başarıyla kaydedildi.',
  },
  full_env_tag: {
    /** UNTRANSLATED */
    development: 'Development',
    /** UNTRANSLATED */
    production: 'Production',
  },
  deletion_card: {
    title: 'SİL',
    tenant_deletion: 'Kiracıyı Sil',
    tenant_deletion_description:
      'Kiracının silinmesi, tüm ilişkili kullanıcı verilerinin ve yapılandırmalarının kalıcı olarak silinmesine neden olur. Lütfen dikkatli bir şekilde devam edin.',
    tenant_deletion_button: 'Kiracıyı Sil',
  },
  create_modal: {
    title: 'Kiracı Oluştur',
    subtitle: 'Kaynakları ve kullanıcıları ayırmak için yeni bir kiracı oluşturun.',
    /** UNTRANSLATED */
    subtitle_with_region:
      'Create a new tenant to separate resources and users. Region and environment tags can’t be modified after creation.',
    /** UNTRANSLATED */
    tenant_usage_purpose: 'What do you want to use this tenant for?',
    /** UNTRANSLATED */
    development_description:
      'Development environment is mainly used for testing and should not use in production environment.',
    /** UNTRANSLATED */
    development_hint:
      'Development environment is mainly used for testing and should not use in production environment.',
    /** UNTRANSLATED */
    production_description:
      'Production is where live software is used by end-users and may require a paid subscription.',
    /** UNTRANSLATED */
    available_plan: 'Available plan:',
    create_button: 'Kiracı oluştur',
    tenant_name_placeholder: 'Benim kiracım',
  },
  notification: {
    /** UNTRANSLATED */
    allow_pro_features_title:
      'You can now access <span>all features of Logto Pro</span> in your development tenant!',
    /** UNTRANSLATED */
    allow_pro_features_description: "It's completely free, with no trial period – forever!",
    /** UNTRANSLATED */
    explore_all_features: 'Explore all features',
    /** UNTRANSLATED */
    impact_title: 'Does this have any impact on me?',
    /** UNTRANSLATED */
    staging_env_hint:
      'Your tenant label has been updated from "<strong>Staging</strong>" to "<strong>Production</strong>", but this change will not impact your current setup.',
    /** UNTRANSLATED */
    paid_tenant_hint_1:
      'As you subscribe to the Logto Hobby plan, your previous "<strong>Development</strong>" tenant tag will switch to "<strong>Production</strong>", and this won\'t affect your existing setup.',
    /** UNTRANSLATED */
    paid_tenant_hint_2:
      "If you're still in the development stage, you can create a new development tenant to access more pro features.",
    /** UNTRANSLATED */
    paid_tenant_hint_3:
      "If you're in the production stage, or a production environment, you still need to subscribe to a specific plan so there's nothing you need to do at this moment.",
    /** UNTRANSLATED */
    paid_tenant_hint_4:
      "Don't hesitate to reach out if you require help! Thank you for choosing Logto!",
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
    cannot_delete_title: 'Bu kiracı silinemez',
    cannot_delete_description:
      'Üzgünüm, bu kiracıyı şu anda silemezsiniz. Ücretsiz Plan üzerinde olduğunuzdan ve tüm ödenmemiş faturaları ödediğinizden emin olun.',
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
      'Üzülerek bildirmekten üzüntü duyuyoruz, kiracı hesabınız şu anda geçici olarak askıya alınmıştır. Bunun nedeni, MAU sınırlarını aşmak, gecikmiş ödemeler veya diğer izinsiz işlemler gibi yanlış kullanımdır.',
    description_2:
      'Daha fazla açıklama, endişeleriniz veya işlevselliği tamamen geri yüklemek ve kiracılarınızı engellemek isterseniz, lütfen derhal bizimle iletişime geçmekten çekinmeyin.',
  },
  signing_keys: {
    /** UNTRANSLATED */
    title: 'SIGNING KEYS',
    /** UNTRANSLATED */
    description: 'Securely manage signing keys in your tenant.',
    type: {
      /** UNTRANSLATED */
      private_key: 'OIDC private keys',
      /** UNTRANSLATED */
      cookie_key: 'OIDC cookie keys',
    },
    /** UNTRANSLATED */
    private_keys_in_use: 'Private keys in use',
    /** UNTRANSLATED */
    cookie_keys_in_use: 'Cookie keys in use',
    /** UNTRANSLATED */
    rotate_private_keys: 'Rotate private keys',
    /** UNTRANSLATED */
    rotate_cookie_keys: 'Rotate cookie keys',
    /** UNTRANSLATED */
    rotate_private_keys_description:
      'This action will create a new private signing key, rotate the current key, and remove your previous key. Your JWT tokens signed with the current key will remain valid until deletion or another round of rotation.',
    /** UNTRANSLATED */
    rotate_cookie_keys_description:
      'This action will create a new cookie key, rotate the current key, and remove your previous key. Your cookies with the current key will remain valid until deletion or another round of rotation.',
    /** UNTRANSLATED */
    select_private_key_algorithm: 'Select signing key algorithm for the new private key',
    /** UNTRANSLATED */
    rotate_button: 'Rotate',
    table_column: {
      /** UNTRANSLATED */
      id: 'ID',
      /** UNTRANSLATED */
      status: 'Status',
      /** UNTRANSLATED */
      algorithm: 'Signing key algorithm',
    },
    status: {
      /** UNTRANSLATED */
      current: 'Current',
      /** UNTRANSLATED */
      previous: 'Previous',
    },
    reminder: {
      /** UNTRANSLATED */
      rotate_private_key:
        'Are you sure you want to rotate the <strong>OIDC private keys</strong>? New issued JWT tokens will be signed by the new key. Existing JWT tokens stay valid until you rotate again.',
      /** UNTRANSLATED */
      rotate_cookie_key:
        'Are you sure you want to rotate the <strong>OIDC cookie keys</strong>? New cookies generated in sign-in sessions will be signed by the new cookie key. Existing cookies stay valid until you rotate again.',
      /** UNTRANSLATED */
      delete_private_key:
        'Are you sure you want to delete the <strong>OIDC private key</strong>? Existing JWT tokens signed with this private signing key will no longer be valid.',
      /** UNTRANSLATED */
      delete_cookie_key:
        'Are you sure you want to delete the <strong>OIDC cookie key</strong>? Older sign-in sessions with cookies signed with this cookie key will no longer be valid. A re-authentication is required for these users.',
    },
    messages: {
      /** UNTRANSLATED */
      rotate_key_success: 'Signing keys rotated successfully.',
      /** UNTRANSLATED */
      delete_key_success: 'Key deleted successfully.',
    },
  },
};

export default Object.freeze(tenants);
