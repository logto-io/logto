const guard = {
  invalid_input: 'La richiesta {{type}} non è valida.',
  invalid_pagination: 'Il valore di paginazione della richiesta non è valido.',
  can_not_get_tenant_id: "Impossibile ottenere l'ID dell'inquilino dalla richiesta.",
  file_size_exceeded: 'Dimensione del file superata.',
  mime_type_not_allowed: 'Il tipo MIME non è consentito.',
  not_allowed_for_admin_tenant: "Non consentito per l'inquilino amministratore.",
};

export default Object.freeze(guard);
