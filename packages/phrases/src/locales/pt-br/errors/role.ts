const role = {
  name_in_use: 'Este nome de papel {{name}} já está em uso',
  scope_exists: 'O id de escopo {{scopeId}} já foi adicionado a este papel',
  management_api_scopes_not_assignable_to_user_role:
    'Não é possível atribuir escopos da API de gerenciamento a uma função de usuário.',
  user_exists: 'O id de usuário {{userId}} já foi adicionado a este papel',
  application_exists: 'O id do aplicativo {{applicationId}} já foi adicionado a este papel',
  default_role_missing:
    'Alguns dos nomes de função padrão não existem no banco de dados, certifique-se de criar funções primeiro',
  internal_role_violation:
    'Você pode estar tentando atualizar ou excluir uma função interna que é proibida pelo Logto. Se você estiver criando uma nova função, tente outro nome que não comece com "#internal:".',
};

export default Object.freeze(role);
