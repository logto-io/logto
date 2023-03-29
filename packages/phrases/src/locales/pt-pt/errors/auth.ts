const auth = {
  authorization_header_missing: 'O cabeçalho de autorização está ausente.',
  authorization_token_type_not_supported: 'O tipo de autorização não é suportado.',
  unauthorized: 'Não autorizado. Verifique as credenciais e o scope.',
  forbidden: 'Proibido. Verifique os seus cargos e permissões.',
  expected_role_not_found: 'Role esperado não encontrado. Verifique os seus cargos e permissões.',
  jwt_sub_missing: 'Campo `sub` está ausente no JWT.',
  require_re_authentication: 'É necessária uma nova autenticação para executar uma ação protegida.',
};
export default auth;
