const organizations = {
  /** UNTRANSLATED */
  organization: 'Organization',
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
    'Doing so will remove the permissions associated with this role from the affected users and delete the relations among organization roles, members in the organization, and organization permissions.',
  /** UNTRANSLATED */
  role: 'Role',
  /** UNTRANSLATED */
  create_role_placeholder: 'Users with view-only permissions',
  /** UNTRANSLATED */
  search_placeholder: 'Search by organization name or ID',
  /** UNTRANSLATED */
  search_permission_placeholder: 'Type to search and select permissions',
  /** UNTRANSLATED */
  search_role_placeholder: 'Type to search and select roles',
  /** UNTRANSLATED */
  organization_and_member: 'Organization and member',
  /** UNTRANSLATED */
  organization_and_member_description:
    'Organization is a group of users and can represent the teams, business customers, and partner companies, with each user being a "Member". Those can be fundamental entities to handle your multi-tenant requirements.',
  guide: {
    title: 'Kılavuzlarla başlayın',
    subtitle: 'Kılavuzlarımızla uygulama geliştirme sürecinize hızlı bir başlangıç yapın',
    introduction: {
      /** UNTRANSLATED */
      title: "Let's understand how organization works in Logto",
      section_1: {
        /** UNTRANSLATED */
        title: 'An organization is a group of users (identities)',
      },
      section_2: {
        /** UNTRANSLATED */
        title: 'Organization template is designed for multi-tenant apps access control',
        /** UNTRANSLATED */
        description:
          'In multi-tenant SaaS applications, multiple organizations often share the same access control template, which includes permissions and roles. In Logto, we call it "organization template."',
        /** UNTRANSLATED */
        permission_description:
          'Organization permission refers to the authorization to access a resource in the context of organization.',
        /** UNTRANSLATED */
        role_description:
          'Organization role is a grouping of organization permissions that can be assigned to members.',
      },
      section_3: {
        title: 'Her şeyin nasıl bağlandığını görmek için illüstrasyonla etkileşim',
        description:
          "Let's take an example. John, Sarah are in different organizations with different roles in the context of different organizations. Hover over the different modules and see what happens.",
      },
    },
    step_1: 'Adım 1: Kuruluş izinlerini tanımlayın',
    step_2: 'Adım 2: Kuruluş rollerini tanımlayın',
    step_2_description:
      '"Kuruluş rolleri", her kuruluşa başlangıçta verilen bir dizi role karşılık gelir. Bu roller, önceki ekranda belirlediğiniz genel izinler tarafından belirlenir. Kuruluş izni ile benzer şekilde, bunu ilk kez ayarladıktan sonra her yeni kuruluş oluşturduğunuzda bunu her seferinde yapmanıza gerek kalmayacaksınız.',
    step_3: 'Adım 3: İlk kuruluşunuzu oluşturun',
    step_3_description:
      "Let's create your first organization. It comes with a unique ID and serves as a container for handling various more business-toward identities, such as partners, customers, and their access control.",
    /** UNTRANSLATED */
    more_next_steps: 'More next steps',
    /** UNTRANSLATED */
    add_members: 'Add members to your organization',
    /** UNTRANSLATED */
    add_members_action: 'Bulk add members and assign roles',
    /** UNTRANSLATED */
    add_enterprise_connector: 'Add enterprise SSO',
    /** UNTRANSLATED */
    add_enterprise_connector_action: 'Set up enterprise SSO',
    /** UNTRANSLATED */
    organization_permissions: 'Organization permissions',
    /** UNTRANSLATED */
    permission_name: 'Permission name',
    /** UNTRANSLATED */
    permissions: 'Permissions',
    /** UNTRANSLATED */
    organization_roles: 'Organization roles',
    /** UNTRANSLATED */
    role_name: 'Role name',
    /** UNTRANSLATED */
    organization_name: 'Organization name',
    /** UNTRANSLATED */
    admin: 'Admin',
    /** UNTRANSLATED */
    member: 'Member',
    /** UNTRANSLATED */
    guest: 'Guest',
    /** UNTRANSLATED */
    role_description:
      'Role "{{role}}" shares the same organization template across different organizations.',
    /** UNTRANSLATED */
    john: 'John',
    /** UNTRANSLATED */
    john_tip:
      'John belongs to two organizations with the email "john@email.com" as the single identifier. He is the admin of organization A as well as the guest of organization B.',
    /** UNTRANSLATED */
    sarah: 'Sarah',
    /** UNTRANSLATED */
    sarah_tip:
      'Sarah belongs to one organization with the email "sarah@email.com" as the single identifier. She is the admin of organization B.',
  },
};

export default Object.freeze(organizations);
