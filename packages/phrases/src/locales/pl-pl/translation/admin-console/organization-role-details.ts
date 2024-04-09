const organization_role_details = {
  page_title: 'Szczegóły roli organizacji',
  back_to_org_roles: 'Powrót do ról organizacji',
  org_role: 'Rola organizacji',
  delete_confirm:
    'W wyniku tego zostaną usunięte uprawnienia związane z tą rolą od dotkniętych użytkowników i zostaną usunięte związki między rolami organizacyjnymi, członkami organizacji a uprawnieniami organizacji.',
  deleted: 'Rola organizacji {{name}} została pomyślnie usunięta.',
  permissions: {
    tab: 'Uprawnienia',
    name_column: 'Uprawnienie',
    description_column: 'Opis',
    type_column: 'Typ uprawnienia',
    type: {
      api: 'Uprawnienie API',
      org: 'Uprawnienie organizacji',
    },
    assign_permissions: 'Przypisz uprawnienia',
    remove_permission: 'Usuń uprawnienie',
    remove_confirmation:
      'Jeśli to uprawnienie zostanie usunięte, użytkownik z tą rolą organizacyjną utraci dostęp udzielony przez to uprawnienie.',
    removed: 'Uprawnienie {{name}} zostało pomyślnie usunięte z tej roli organizacyjnej',
    assign_description:
      'Przypisz uprawnienia do ról w tej organizacji. Mogą one obejmować zarówno uprawnienia organizacyjne, jak i uprawnienia interfejsu API.',
    organization_permissions: 'Uprawnienia organizacyjne',
    api_permissions: 'Uprawnienia interfejsu API',
    assign_organization_permissions: 'Przydziel uprawnienia organizacyjne',
    assign_api_permissions: 'Przydziel uprawnienia API',
  },
  general: {
    tab: 'Ogólne',
    settings: 'Ustawienia',
    description:
      'Rola organizacji to grupowanie uprawnień, które można przypisać użytkownikom. Uprawnienia muszą pochodzić z predefiniowanych uprawnień organizacji.',
    name_field: 'Nazwa',
    description_field: 'Opis',
    description_field_placeholder: 'Użytkownicy z uprawnieniami tylko do odczytu',
  },
};

export default Object.freeze(organization_role_details);
