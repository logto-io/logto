const organizations = {
  organization: 'Kuruluş',
  page_title: 'Kuruluşlar',
  title: 'Kuruluşlar',
  subtitle:
    'Bir kuruluş, uygulamalarını kullanan ekipleri, iş müşterilerini ve iş ortaklarını içeren bir kullanıcı koleksiyonudur.',
  organization_template: 'Kuruluş şablonu',
  organization_id: 'Kuruluş Kimliği',
  members: 'Üyeler',
  create_organization: 'Kuruluş oluştur',
  setup_organization: 'Kuruluşunuzu ayarlayın',
  organization_list_placeholder_title: 'Kuruluş',
  organization_list_placeholder_text:
    'Kuruluşlar genellikle SaaS veya benzeri çok kiracılı uygulamalarda kullanılır. B2B müşterilerinizin ortaklarını ve müşterilerini daha iyi yönetmelerine ve son kullanıcıların uygulamalarına erişim şekillerini özelleştirmelerine izin verir.',
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
  empty_placeholder: '\uD83E\uDD14 Herhangi bir {{entity}} henüz ayarlanmamış.',
  organization_and_member: 'Kuruluş ve üye',
  organization_and_member_description:
    'Kuruluş, kullanıcı gruplarıdır ve ekipleri, iş müşterilerini ve iş ortaklarını temsil edebilir. Her kullanıcı bir "Üye" olabilir. Bunlar, çok kiracılı gereksinimlerinizi ele almak için temel varlıklar olabilir.',
  guide: {
    title: 'Kılavuzlarla başlayın',
    subtitle: 'Kılavuzlarımızla kuruluş ayarlarınızı hızlandırın',
    introduction: {
      title: "Logto'da kuruluşun nasıl çalıştığını anlayalım",
      section_1: {
        title: 'Kuruluş, bir kullanıcı (kimlik) grubudur',
      },
      section_2: {
        title: 'Kuruluş şablonu, çok kiracılı uygulamaların erişim denetimleri için tasarlanmıştır',
        description:
          'Çok kiracılı SaaS uygulamalarında, birden çok kuruluş genellikle aynı erişim kontrol şablonunu paylaşır; bu şablon izinleri ve rolleri içerir. Logto\'da buna "kuruluş şablonu" diyoruz.',
        permission_description:
          'Kuruluş izni, kuruluş bağlamında bir kaynağa erişim izni anlamına gelir.',
        role_description:
          'Kuruluş rolü, kullanıcılara atanabilen kuruluş izinlerinin bir gruplamasıdır.',
      },
      section_3: {
        title: 'Her şeyin nasıl bağlandığını görmek için illüstrasyonla etkileşim',
        description:
          'Örnek alalım. John, Sarah farklı kuruluşlara farklı rollerle farklı kuruluş bağlamlarında bulunmaktadır. Farklı modüllerin üzerine gelerek neler olduğunu görebilirsiniz.',
      },
    },
    step_1: 'Adım 1: Kuruluş izinlerini tanımlayın',
    step_2: 'Adım 2: Kuruluş rollerini tanımlayın',
    step_3: 'Adım 3: İlk kuruluşunuzu oluşturun',
    step_3_description:
      'İlk kuruluşunuzu oluşturma zamanı geldi. Bu kuruluş benzersiz bir kimliğe sahip olacak ve çeşitli işe yönelik kimlikleri işleme koymak için bir kap olarak hizmet verecektir.',
    more_next_steps: 'Daha fazla adım',
    add_members: 'Kuruluşunuza üyeler ekleyin',
    /** UNTRANSLATED */
    config_organization: 'Configure organization',
    organization_permissions: 'Kuruluş izinleri',
    permission_name: 'İzin adı',
    permissions: 'İzinler',
    organization_roles: 'Kuruluş rolleri',
    role_name: 'Rol adı',
    organization_name: 'Kuruluş adı',
    admin: 'Yönetici',
    member: 'Üye',
    guest: 'Misafir',
    role_description:
      'Rol "{{role}}" farklı kuruluşlar bağlamında aynı kuruluş şablonunu paylaşır.',
    john: 'John',
    john_tip:
      'John, "john@email.com" adresiyle tek bir kimlik belirleyicisi olarak farklı kuruluşlara aittir. Ayrıca kuruluş A\'nın yöneticisidir ve kuruluş B\'nin misafiridir.',
    sarah: 'Sarah',
    sarah_tip:
      'Sarah, "sarah@email.com" adresiyle tek bir kimlik belirleyicisi olarak bir kuruluşa aittir. Kuruluş B\'nin yöneticisidir.',
  },
};

export default Object.freeze(organizations);
