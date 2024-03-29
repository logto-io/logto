const organization_template = {
  title: 'Szablon organizacji',
  subtitle:
    'W aplikacjach SaaS wieloklienckich jest powszechne, że wiele organizacji dzieli identyczne polityki kontroli dostępu, w tym uprawnienia i role. W Logto, ten koncept jest określany jako "szablon organizacji". Jego użycie usprawnia proces budowania i projektowania modelu autoryzacji.',
  org_roles: {
    tab_name: 'Role org',
    search_placeholder: 'Szukaj po nazwie roli',
    create_org_roles: 'Utwórz rolę org',
    org_role_column: 'Rola org',
    permissions_column: 'Uprawnienia',
    placeholder_title: 'Rola organizacyjna',
    placeholder_description:
      'Rola organizacyjna to grupowanie uprawnień, które można przypisać użytkownikom. Uprawnienia muszą pochodzić z wcześniej zdefiniowanych uprawnień organizacyjnych.',
  },
  org_permissions: {
    tab_name: 'Uprawnienia org',
    search_placeholder: 'Szukaj po nazwie uprawnienia',
    create_org_permission: 'Utwórz uprawnienie org',
    permission_column: 'Uprawnienie',
    description_column: 'Opis',
    placeholder_title: 'Uprawnienie organizacyjne',
    placeholder_description:
      'Uprawnienie organizacyjne odnosi się do autoryzacji dostępu do zasobu w kontekście organizacji.',
    delete_confirm:
      'Jeśli to uprawnienie zostanie usunięte, wszystkie role organizacyjne zawierające to uprawnienie stracą je, a użytkownicy, którzy mieli to uprawnienie, stracą dostęp przyznany przez nie.',
  },
};

export default Object.freeze(organization_template);
