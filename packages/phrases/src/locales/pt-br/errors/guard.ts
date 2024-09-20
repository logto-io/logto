const guard = {
  invalid_input: 'A solicitação {{type}} é inválida.',
  invalid_pagination: 'O valor de paginação da solicitação é inválido.',
  can_not_get_tenant_id: 'Não foi possível obter o ID do inquilino na solicitação.',
  file_size_exceeded: 'Tamanho do arquivo excedido.',
  mime_type_not_allowed: 'Tipo MIME não permitido.',
  not_allowed_for_admin_tenant: 'Não permitido para inquilino administrador.',
};

export default Object.freeze(guard);
