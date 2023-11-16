const organizations = {
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
  guide: {
    title: 'Zacznij od przewodników',
    subtitle: 'Rozpocznij proces tworzenia aplikacji za pomocą naszych przewodników',
    introduction: {
      section_1: {
        title: 'Najpierw zrozum, jak działają organizacje w Logto',
        description:
          'W aplikacjach wielomandantowych typu SaaS często tworzymy kilka organizacji z tym samym zestawem uprawnień i ról, ale w kontekście organizacji może to odgrywać ważną rolę w kontroli różnych poziomów dostępu. Użytkownik może myśleć o każdym najemcy jak o organizacji Logto i naturalnie dzielić się tą samą "szablonową" kontrolą dostępu. Nazywamy to "szablonem organizacji."',
      },
      section_2: {
        title: 'Szablon organizacji składa się z dwóch części',
        organization_permission_description:
          'Uprawnienie organizacji odnosi się do autoryzacji dostępu do zasobu w kontekście organizacji. Uprawnienie organizacji powinno być reprezentowane jako znaczący ciąg znaków, stanowiący także nazwę i unikalny identyfikator.',
        organization_role_description:
          'Rola organizacji to grupowanie uprawnień, które można przypisać użytkownikom. Uprawnienia muszą pochodzić z wcześniej zdefiniowanych uprawnień organizacji.',
      },
      section_3: {
        title: 'Wejdź w interakcję z ilustracją, aby zobaczyć, jak wszystko się łączy',
        description:
          'Przyjrzyjmy się przykładowi. John, Sarah i Tony należą do różnych organizacji z różnymi rolami w kontekście różnych organizacji. Najedź kursorem na różne moduły i zobacz, co się stanie.',
      },
    },
    step_1: 'Krok 1: Zdefiniuj uprawnienia organizacji',
    step_2: 'Krok 2: Zdefiniuj role organizacji',
    step_2_description:
      '"Role organizacji" reprezentują zestaw ról nadanych każdej organizacji na początku. Role te są określone przez globalne uprawnienia, które ustawiłeś w poprzednim ekranie. Podobnie jak z uprawnieniami organizacji, po zakończeniu tego ustawienia pierwszy raz, nie będziesz musiał tego robić za każdym razem, gdy utworzysz nową organizację.',
    step_3: 'Krok 3: Utwórz swoją pierwszą organizację',
    step_3_description:
      'Utwórz swoją pierwszą organizację. Ma ona unikalne ID i służy jako kontener do obsługi różnych bardziej skoncentrowanych na biznesie tożsamości, takich jak partnerzy, klienci i ich kontrola dostępu.',
    more_next_steps: 'Więcej kolejnych kroków',
    add_members: 'Dodaj członków do swojej organizacji',
    add_members_action: 'Dodaj członków zbiorowo i przypisz role',
    add_enterprise_connector: 'Dodaj łącznik przedsiębiorstwa SSO',
    add_enterprise_connector_action: 'Skonfiguruj przedsiębiorstwo SSO',
    organization_permissions: 'Uprawnienia organizacji',
    permission_name: 'Nazwa uprawnienia',
    permissions: 'Uprawnienia',
    organization_roles: 'Role organizacji',
    role_name: 'Nazwa roli',
    organization_name: 'Nazwa organizacji',
    admin: 'Administrator',
    admin_description:
      'Rola "Administrator" dzieli ten sam szablon organizacji między różnymi organizacjami.',
    member: 'Członek',
    member_description:
      'Rola "Członek" dzieli ten sam szablon organizacji między różnymi organizacjami.',
    guest: 'Gość',
    guest_description:
      'Rola "Gość" dzieli ten sam szablon organizacji między różnymi organizacjami.',
    create_more_roles:
      'Możesz utworzyć więcej ról w ustawieniach szablonu organizacji. Te role organizacji będą stosowane do różnych organizacji.',
    read_resource: 'odczyt:zasób',
    edit_resource: 'edycja:zasób',
    delete_resource: 'usuwanie:zasób',
    ellipsis: '……',
    johnny:
      'Johny należy do dwóch organizacji z adresem e-mail "john@email.com" jako jedynym identyfikatorem. Jest administratorem organizacji A oraz gościem organizacji B.',
    sarah:
      'Sarah należy do jednej organizacji z adresem e-mail "sarah@email.com" jako jedynym identyfikatorem. Jest administratorem organizacji B.',
    tony: 'Tony należy do jednej organizacji z adresem e-mail "tony@email.com" jako jedynym identyfikatorem. Jest członkiem organizacji C.',
  },
};

export default Object.freeze(organizations);
