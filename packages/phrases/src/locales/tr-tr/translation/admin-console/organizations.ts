const organizations = {
  page_title: 'Kuruluşlar',
  title: 'Kuruluşlar',
  subtitle: 'Uygulamalarınıza erişen ekipleri, iş müşterilerini ve ortak şirketleri temsil edin.',
  organization_id: 'Kuruluş Kimliği',
  members: 'Üyeler',
  create_organization: 'Kuruluş oluştur',
  setup_organization: 'Kuruluşunuzu ayarlayın',
  organization_list_placeholder_title: 'Kuruluş',
  organization_list_placeholder_text:
    'Kuruluş genellikle SaaS veya SaaS benzeri çok kiracılı uygulamalarda kullanılır. Kuruluşlar özelliği, B2B müşterilerinizin ortaklarını ve müşterilerini daha iyi yönetmelerine ve son kullanıcıların uygulamalarına erişim şekillerini özelleştirmelerine izin verir.',
  organization_name_placeholder: 'Benim kuruluşum',
  organization_description_placeholder: 'Kuruluşun kısa açıklaması',
  organization_permission: 'Kuruluş izni',
  organization_permission_other: 'Kuruluş izinleri',
  organization_permission_description:
    'Kuruluş izni, kuruluş bağlamında bir kaynağa erişim izni anlamına gelir. Bir kuruluş izni anlamlı bir dize olarak temsil edilmeli ve aynı zamanda adı ve benzersiz tanımlayıcısı olarak hizmet etmelidir.',
  organization_permission_delete_confirm:
    'Bu izin silinirse, bu izni içeren tüm kuruluş rolleri bu izni kaybedecek ve bu izne sahip olan kullanıcılar bu izinle sağlanan erişimi kaybedecek.',
  create_permission_placeholder: 'Randevu geçmişini oku',
  permission: 'İzin',
  permission_other: 'İzinler',
  organization_role: 'Kuruluş rolü',
  organization_role_other: 'Kuruluş rolleri',
  organization_role_description:
    'Kuruluş rolü, kullanıcılara atanabilen izinlerin bir gruplamasıdır. İzinler önceden tanımlanmış kuruluş izinlerinden gelmelidir.',
  organization_role_delete_confirm:
    'Bunu yapmak, etkilenen kullanıcılardan bu role ilişkilendirilmiş izinleri kaldıracak ve kuruluş rolleri arasındaki ilişkileri ve kuruluş izinleri arasındaki ilişkileri silecektir.',
  role: 'Rol',
  create_role_placeholder: 'Yalnızca görünüm izinleri olan kullanıcılar',
  search_placeholder: 'Kuruluş adı veya kimliğine göre ara',
  search_permission_placeholder: 'İzinleri arayın ve seçin',
  search_role_placeholder: 'Rolleri arayın ve seçin',
  guide: {
    title: 'Kılavuzlarla başlayın',
    subtitle: 'Kılavuzlarımızla uygulama geliştirme sürecinize hızlı bir başlangıç yapın',
    introduction: {
      section_1: {
        title: "İlk olarak, kuruluşların Logto'da nasıl çalıştığını anlayalım",
        description:
          'Çok kiracılı SaaS uygulamalarında genellikle aynı izin ve roller kümesine sahip birkaç organizasyon yapıyoruz, ancak bir organizasyon bağlamında farklı erişim düzeylerini denetlemek önemli bir rol oynayabilir. Her kiracıyı bir Logto kuruluşu gibi düşünün ve doğal olarak aynı erişim kontrol "şablonunu" paylaşırlar. Buna "kuruluş şablonu" diyoruz.',
      },
      section_2: {
        title: 'Kuruluş şablonu iki parçadan oluşur',
        organization_permission_description:
          'Kuruluş izni, kuruluş bağlamında bir kaynağa erişim izni anlamına gelir. Bir kuruluş izni anlamlı bir dize olarak temsil edilmeli ve aynı zamanda adı ve benzersiz tanımlayıcısı olarak hizmet etmelidir.',
        organization_role_description:
          'Kuruluş rolü, kullanıcılara atanabilen izinlerin bir gruplamasıdır. İzinler önceden tanımlanmış kuruluş izinlerinden gelmelidir.',
      },
      section_3: {
        title: 'Her şeyin nasıl bağlandığını görmek için illüstrasyonla etkileşim',
        description:
          'Bir örnek alalım. John, Sarah ve Tony farklı organizasyonlara farklı rollerle dahil olan kullanıcılardır. Farklı modüllerin üzerine gelerek ne olacağını görün.',
      },
    },
    step_1: 'Adım 1: Kuruluş izinlerini tanımlayın',
    step_2: 'Adım 2: Kuruluş rollerini tanımlayın',
    step_2_description:
      '"Kuruluş rolleri", her kuruluşa başlangıçta verilen bir dizi role karşılık gelir. Bu roller, önceki ekranda belirlediğiniz genel izinler tarafından belirlenir. Kuruluş izni ile benzer şekilde, bunu ilk kez ayarladıktan sonra her yeni kuruluş oluşturduğunuzda bunu her seferinde yapmanıza gerek kalmayacaksınız.',
    step_3: 'Adım 3: İlk kuruluşunuzu oluşturun',
    step_3_description:
      'İlk kuruluşunuzu oluşturalım. Benzersiz bir kimlikle gelir ve ortaklar, müşteriler ve onların erişim kontrolü gibi çeşitli daha fazla işe yönelik kimliklerle başa çıkmak için bir konteyner görevi görür.',
    more_next_steps: 'Daha fazla sonraki adımlar',
    add_members: 'Kuruluşunuza üyeler ekleyin',
    add_members_action: 'Toplu üyeleri ekleyin ve roller atayın',
    add_enterprise_connector: 'Kurumsal SSO ekleyin',
    add_enterprise_connector_action: "Kurumsal SSO'yu yapılandırın",
    organization_permissions: 'Kuruluş izinleri',
    permission_name: 'İzin adı',
    permissions: 'İzinler',
    organization_roles: 'Kuruluş rolleri',
    role_name: 'Rol adı',
    organization_name: 'Kuruluş adı',
    admin: 'Yönetici',
    admin_description:
      'Yönetici rolü, farklı organizasyonlar arasında aynı kuruluş şablonunu paylaşır.',
    member: 'Üye',
    member_description:
      'Üye rolü, farklı organizasyonlar arasında aynı kuruluş şablonunu paylaşır.',
    guest: 'Misafir',
    guest_description:
      'Misafir rolü, farklı organizasyonlar arasında aynı kuruluş şablonunu paylaşır.',
    create_more_roles:
      'Kuruluş şablonu ayarlarında daha fazla rol oluşturabilirsiniz. Bu kuruluş rolleri farklı organizasyonlara uygulanacaktır.',
    read_resource: 'kaynağı oku',
    edit_resource: 'kaynağı düzenle',
    delete_resource: 'kaynağı sil',
    ellipsis: '……',
    johnny:
      'Johny, "john@email.com" e-posta adresine sahip tek bir tanımlayıcı olarak iki organizasyona aittir. O, organizasyon A\'nın yöneticisi ve aynı zamanda organizasyon B\'nin misafiridir.',
    sarah:
      'Sarah, "sarah@email.com" e-posta adresine sahip tek bir tanımlayıcı olarak bir organizasyona aittir. O, organizasyon B\'nin yöneticisidir.',
    tony: 'Tony, "tony@email.com" e-posta adresine sahip tek bir tanımlayıcı olarak bir organizasyona aittir. O, organizasyon C\'nin üyesidir.',
  },
};

export default Object.freeze(organizations);
