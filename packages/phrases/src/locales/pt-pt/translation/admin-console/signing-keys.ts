const signing_keys = {
  title: 'Chaves de assinatura',
  description: 'Gerir de forma segura as chaves de assinatura utilizadas pelas suas aplicações.',
  private_key: 'Chaves privadas OIDC',
  private_keys_description: 'As chaves privadas OIDC são usadas para assinar tokens JWT.',
  cookie_key: 'Chaves de cookie OIDC',
  cookie_keys_description: 'As chaves de cookie OIDC são usadas para assinar cookies.',
  private_keys_in_use: 'Chaves privadas em uso',
  cookie_keys_in_use: 'Chaves de cookies em uso',
  rotate_private_keys: 'Rodar chaves privadas',
  rotate_cookie_keys: 'Rodar chaves de cookies',
  rotate_private_keys_description:
    'Esta ação criará uma nova chave privada de assinatura, rodará a chave atual e removerá a chave anterior. Os seus tokens JWT assinados com a chave atual permanecerão válidos até à eliminação ou outra rodada de rotação.',
  rotate_cookie_keys_description:
    'Esta ação criará uma nova chave de cookie, rodará a chave atual e removerá a chave anterior. Os seus cookies com a chave atual permanecerão válidos até à eliminação ou outra rodada de rotação.',
  select_private_key_algorithm: 'Selecionar o algoritmo de assinatura para a nova chave privada',
  rotate_button: 'Rodar',
  table_column: {
    id: 'ID',
    status: 'Estado',
    algorithm: 'Algoritmo de assinatura da chave',
  },
  status: {
    current: 'Atual',
    previous: 'Anterior',
  },
  reminder: {
    rotate_private_key:
      'Tem a certeza de que pretende rodar as <strong>chaves privadas OIDC</strong>? Os novos tokens JWT emitidos serão assinados pela nova chave. Os tokens JWT existentes permanecem válidos até rodar novamente.',
    rotate_cookie_key:
      'Tem a certeza de que pretende rodar as <strong>chaves de cookies OIDC</strong>? Os novos cookies gerados em sessões de login serão assinados pela nova chave de cookie. Os cookies existentes permanecem válidos até rodar novamente.',
    delete_private_key:
      'Tem a certeza de que pretende eliminar a <strong>chave privada OIDC</strong>? Os tokens JWT existentes assinados com esta chave de assinatura privada deixarão de ser válidos.',
    delete_cookie_key:
      'Tem a certeza de que pretende eliminar a <strong>chave de cookie OIDC</strong>? As sessões de login antigas com cookies assinados com esta chave de cookie deixarão de ser válidas. É necessária uma nova autenticação para estes utilizadores.',
  },
  messages: {
    rotate_key_success: 'Chaves de assinatura rodadas com sucesso.',
    delete_key_success: 'Chave eliminada com sucesso.',
  },
};

export default Object.freeze(signing_keys);
