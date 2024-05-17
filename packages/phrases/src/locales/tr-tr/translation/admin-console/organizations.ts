const organizations = {
  organization: 'Kuruluş',
  page_title: 'Kuruluşlar',
  title: 'Kuruluşlar',
  /** UNTRANSLATED */
  subtitle:
    'Organizations are usually used in SaaS or similar multi-tenant apps and represent your clients which are teams, organizations, or entire companies. Organizations work as a foundational element for B2B authentication and authorization.',
  organization_template: 'Kuruluş şablonu',
  organization_id: 'Kuruluş Kimliği',
  members: 'Üyeler',
  create_organization: 'Kuruluş oluştur',
  setup_organization: 'Kuruluşunuzu ayarlayın',
  organization_list_placeholder_title: 'Kuruluş',
  /** UNTRANSLATED */
  organization_list_placeholder_text:
    'Organizations are often used in SaaS or similar multi-tenant apps as a best practice. They enable you to develop apps that allow clients to create and manage organizations, invite members, and assign roles.',
  organization_name_placeholder: 'Benim kuruluşum',
  organization_description_placeholder: 'Kuruluşun kısa açıklaması',
  organization_permission: 'Kuruluş izni',
  organization_permission_other: 'Kuruluş izinleri',
  create_permission_placeholder: 'Randevu geçmişini oku',
  organization_role: 'Kuruluş rolü',
  organization_role_other: 'Kuruluş rolleri',
  organization_role_description:
    'Kuruluş rolü, kullanıcılara atanabilen izinlerin bir gruplamasıdır. İzinler önceden tanımlanmış kuruluş izinlerinden gelmelidir.',
  role: 'Rol',
  search_placeholder: 'Kuruluş adı veya kimliğine göre ara',
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
        role_description_deprecated:
          'Kuruluş rolü, kullanıcılara atanabilen kuruluş izinlerinin bir gruplamasıdır.',
        role_description:
          'Kuruluş rolü, üyelere atanabilecek kuruluş izinlerinin veya API izinlerinin bir gruplamasıdır.',
      },
      section_3: {
        title: 'API izinlerini organizasyon rollerine atayabilir miyim?',
        description:
          'Evet, API izinlerini organizasyon rollerine atayabilirsiniz. Logto, organizasyonunuzun rollerini etkili bir şekilde yönetme esnekliği sunar, bu roller içinde hem organizasyon izinlerini hem de API izinlerini içerecek şekilde izin verir.',
      },
      section_4: {
        title: 'Her şeyin nasıl bağlandığını görmek için illüstrasyonla etkileşim',
        description:
          'Örnek alalım. John, Sarah farklı kuruluşlara farklı rollerle farklı kuruluş bağlamlarında bulunmaktadır. Farklı modüllerin üzerine gelerek neler olduğunu görebilirsiniz.',
      },
    },
    organization_permissions: 'Kuruluş izinleri',
    organization_roles: 'Kuruluş rolleri',
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
