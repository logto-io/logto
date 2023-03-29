const auth = {
  authorization_header_missing: 'O cabeçalho de autorização está ausente.',
  authorization_token_type_not_supported: 'O tipo de autorização não é suportado.',
  unauthorized: 'Não autorizado. Verifique as credenciais e seu escopo.',
  forbidden: 'Proibido. Verifique suas funções e permissões de usuário.',
  expected_role_not_found:
    'Regra esperada não encontrada. Verifique suas regras e permissões de usuário.',
  jwt_sub_missing: '`sub` ausente no JWT.',
  require_re_authentication: 'A reautenticação é necessária para executar uma ação protegida.',
};
export default auth;
