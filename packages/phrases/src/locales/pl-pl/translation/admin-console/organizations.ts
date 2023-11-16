const organizations = {
  /** UNTRANSLATED */
  organization: 'Organization',
  page_title: 'Organizacje',
  title: 'Organizacje',
  subtitle:
    'Reprezentują zespoły, klientów biznesowych i partnerów firm, którzy mają dostęp do aplikacji jako organizacje.',
  organization_id: 'ID organizacji',
  members: 'Członkowie',
  create_organization: 'Utwórz organizację',
  setup_organization: 'Skonfiguruj swoją organizację',
  organization_list_placeholder_title: 'Organizacja',
  organization_list_placeholder_text:
    'Organizacja jest zazwyczaj stosowana w aplikacjach wielomandantowych typu SaaS lub podobnych. Funkcja organizacji umożliwia klientom B2B lepsze zarządzanie swoimi partnerami i klientami oraz dostosowywanie sposobów, w jakie końcowi użytkownicy mają dostęp do ich aplikacji.',
  organization_name_placeholder: 'Moja organizacja',
  organization_description_placeholder: 'Krótki opis organizacji',
  organization_permission: 'Uprawnienie organizacji',
  organization_permission_other: 'Uprawnienia organizacji',
  organization_permission_description:
    'Uprawnienie organizacji odnosi się do autoryzacji dostępu do zasobu w kontekście organizacji. Uprawnienie organizacji powinno być reprezentowane jako znaczący ciąg znaków, stanowiący także nazwę i unikalny identyfikator.',
  organization_permission_delete_confirm:
    'Jeśli to uprawnienie zostanie usunięte, wszystkie role organizacji, w tym to uprawnienie, stracą to uprawnienie, a użytkownicy, którzy mieli to uprawnienie, stracą dostęp do niego.',
  create_permission_placeholder: 'Odczyt historii spotkań',
  permission: 'Uprawnienie',
  permission_other: 'Uprawnienia',
  organization_role: 'Rola organizacji',
  organization_role_other: 'Role organizacji',
  organization_role_description:
    'Rola organizacji to grupowanie uprawnień, które można przypisać użytkownikom. Uprawnienia muszą pochodzić z wcześniej zdefiniowanych uprawnień organizacji.',
  organization_role_delete_confirm:
    'Spowoduje to usunięcie uprawnień związanych z tą rolą od dotkniętych użytkowników oraz usunięcie relacji między rolami organizacji, członkami organizacji i uprawnieniami organizacji.',
  role: 'Rola',
  create_role_placeholder: 'Użytkownicy z uprawnieniami tylko do odczytu',
  search_placeholder: 'Wyszukaj według nazwy lub ID organizacji',
  search_permission_placeholder: 'Wpisz, aby wyszukać i wybrać uprawnienia',
  search_role_placeholder: 'Wpisz, aby wyszukać i wybrać role',
  empty_placeholder: '🤔 Nie masz jeszcze ustawionego żadnego {{entity}}.',
  /** UNTRANSLATED */
  organization_and_member: 'Organization and member',
  /** UNTRANSLATED */
  organization_and_member_description:
    'Organization is a group of users and can represent the teams, business customers, and partner companies, with each user being a "Member". Those can be fundamental entities to handle your multi-tenant requirements.',
  guide: {
    title: 'Zacznij od przewodników',
    subtitle: 'Rozpocznij proces tworzenia aplikacji za pomocą naszych przewodników',
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
        title: 'Wejdź w interakcję z ilustracją, aby zobaczyć, jak wszystko się łączy',
        description:
          "Let's take an example. John, Sarah are in different organizations with different roles in the context of different organizations. Hover over the different modules and see what happens.",
      },
    },
    step_1: 'Krok 1: Zdefiniuj uprawnienia organizacji',
    step_2: 'Krok 2: Zdefiniuj role organizacji',
    step_2_description:
      '"Role organizacji" reprezentują zestaw ról nadanych każdej organizacji na początku. Role te są określone przez globalne uprawnienia, które ustawiłeś w poprzednim ekranie. Podobnie jak z uprawnieniami organizacji, po zakończeniu tego ustawienia pierwszy raz, nie będziesz musiał tego robić za każdym razem, gdy utworzysz nową organizację.',
    step_3: 'Krok 3: Utwórz swoją pierwszą organizację',
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
