const organizations = {
  organization: 'Kuruluş',
  page_title: 'Kuruluşlar',
  title: 'Kuruluşlar',
  subtitle:
    'Bir kuruluş, uygulamalarını kullanan takımları, iş müşterilerini ve ortak firmaları içeren kullanıcıların bir koleksiyonudur.',
  organization_template: 'Kuruluş şablonu',
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
  empty_placeholder: '🤔 Herhangi bir {{entity}} henüz ayarlanmamış.',
  organization_and_member: 'Kuruluş ve üye',
  organization_and_member_description:
    'Kuruluş, bir grup kullanıcıdır ve takımları, iş müşterilerini ve ortak firmaları temsil edebilir. Her bir kullanıcı "Üye"dir. Bunlar, çok kiracılı gereksinimlerinizi ele alma temel varlıklar olabilir.',
  guide: {
    title: 'Kılavuzlarla başlayın',
    subtitle: 'Kılavuzlarımızla kuruluş ayarlarınızı hızlı bir şekilde başlatın',
    introduction: {
      title: "Logto'da kuruluşun nasıl çalıştığını anlayalım",
      section_1: {
        title: 'Bir kuruluş, bir grup kullanıcıdır (kimlikler)',
      },
      section_2: {
        title: 'Kuruluş şablonu, çok kiracılı uygulamalarda erişim denetimi için tasarlanmıştır',
        description:
          'Çok kiracılı SaaS uygulamalarında, birden çok kuruluş genellikle izinler ve rolleri içeren aynı erişim denetim şablonunu paylaşır. Logto\'da buna "kuruluş şablonu" diyoruz.',
        permission_description:
          'Kuruluş izni, kuruluş bağlamında bir kaynağa erişim yetkisi anlamına gelir.',
        role_description: 'Kuruluş rolü, üyelere atanabilen kuruluş izinlerinin bir gruplamasıdır.',
      },
      section_3: {
        title: 'İllüstrasyonla farklı herşeyin nasıl bağlandığını anlamak için etkileşime geçin',
        description:
          'Bir örnek alalım. John, Sarah, farklı kuruluşlarda ve farklı rollerde farklı organizasyonlarda. Farklı modüllere gelerek birbirleriyle ilişkilerini görebilirsiniz.',
      },
    },
    step_1: 'Adım 1: Kuruluş izinlerini tanımlayın',
    step_2: 'Adım 2: Kuruluş rollerini tanımlayın',
    step_3: 'Adım 3: İlk kuruluşunuzu oluşturun',
    step_3_description:
      'İlk kuruluşunuzu oluşturalım. Bu, farklı işe yönelik kimliklerle başa çıkmanın bir konteyneri olarak benzersiz bir kimlikle gelir.',
    more_next_steps: 'Daha fazla adım',
    add_members: 'Kuruluşunuza üye ekleyin',
    add_members_action: 'Üyeleri topluca ekleyin ve roller atayın',
    organization_permissions: 'Kuruluş izinleri',
    permission_name: 'İzin adı',
    permissions: 'İzinler',
    organization_roles: 'Kuruluş rolleri',
    role_name: 'Rol adı',
    organization_name: 'Kuruluş adı',
    admin: 'Yönetici',
    member: 'Üye',
    guest: 'Misafir',
    role_description: 'Rol "{{role}}" farklı kuruluşlar arasında aynı kuruluş şablonunu paylaşır.',
    john: 'John',
    john_tip:
      'John "john@email.com" e-postasıyla tek bir kimlik olarak iki farklı kuruluşa aittir. Birinde yönetici, diğerinde misafir olarak yer alır.',
    sarah: 'Sarah',
    sarah_tip:
      'Sarah, "sarah@email.com" e-postasıyla tek bir kimlikle bir kuruluşa aittir. Bu kuruluşta yöneticidir.',
  },
};

export default Object.freeze(organizations);
