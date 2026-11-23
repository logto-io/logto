const guard = {
  invalid_input: 'Żądanie {{type}} jest nieprawidłowe.',
  invalid_pagination: 'Nieprawidłowa wartość paginacji żądania.',
  unsupported_pagination_parameter:
    'Parametr zapytania „{{parameter}}” nie jest obsługiwany w trybie paginacji {{mode}}.',
  can_not_get_tenant_id: 'Nie można pobrać identyfikatora najemcy z żądania.',
  file_size_exceeded: 'Przekroczono rozmiar pliku.',
  mime_type_not_allowed: 'Nie dozwolony typ MIME.',
  not_allowed_for_admin_tenant: 'Niedozwolone dla najemcy administracyjnego.',
};

export default Object.freeze(guard);
