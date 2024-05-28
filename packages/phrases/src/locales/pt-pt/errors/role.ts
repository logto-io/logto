const role = {
  name_in_use: 'Este nome de função {{name}} já está em uso',
  scope_exists: 'O id do escopo {{scopeId}} já foi adicionado a esta função',
  management_api_scopes_not_assignable_to_user_role:
    'Não é possível atribuir escopos da API de gestão a uma função de usuário.',
  user_exists: 'O id do usuário {{userId}} já foi adicionado a esta função',
  application_exists: 'O id de aplicação {{applicationId}} já foi adicionado a esta função',
  default_role_missing:
    'Alguns dos nomes de função padrão não existem no banco de dados, por favor, certifique-se de criar as funções primeiro',
  internal_role_violation:
    'Você pode estar tentando atualizar ou excluir uma função interna que é proibida pelo Logto. Se você estiver criando uma nova função, tente outro nome que não comece com "#internal:". ',
};

export default Object.freeze(role);
