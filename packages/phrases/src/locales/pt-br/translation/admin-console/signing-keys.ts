const signing_keys = {
  title: 'Chaves de assinatura',
  description: 'Gerencie com segurança as chaves de assinatura usadas por suas aplicações.',
  private_key: 'Chaves privadas OIDC',
  private_keys_description: 'As chaves privadas OIDC são usadas para assinar tokens JWT.',
  cookie_key: 'Chaves de cookie OIDC',
  cookie_keys_description: 'As chaves de cookie OIDC são usadas para assinar cookies.',
  private_keys_in_use: 'Chaves privadas em uso',
  cookie_keys_in_use: 'Chaves de cookie em uso',
  rotate_private_keys: 'Girar chaves privadas',
  rotate_cookie_keys: 'Girar chaves de cookie',
  rotate_private_keys_description:
    'Esta ação criará uma nova chave privada de assinatura, girará a chave atual e removerá sua chave anterior. Seus tokens JWT assinados com a chave atual permanecerão válidos até a exclusão ou outra rodada de rotação.',
  rotate_cookie_keys_description:
    'Esta ação criará uma nova chave de cookie, girará a chave atual e removerá sua chave anterior. Seus cookies com a chave atual permanecerão válidos até a exclusão ou outra rodada de rotação.',
  select_private_key_algorithm: 'Selecione o algoritmo de assinatura para a nova chave privada',
  rotate_button: 'Girar',
  table_column: {
    id: 'ID',
    status: 'Status',
    algorithm: 'Algoritmo de assinatura',
  },
  status: {
    current: 'Atual',
    previous: 'Anterior',
  },
  reminder: {
    rotate_private_key:
      'Tem certeza de que deseja girar as <strong>chaves privadas do OIDC</strong>? Os novos tokens JWT emitidos serão assinados pela nova chave. Os tokens JWT existentes permanecem válidos até você girar novamente.',
    rotate_cookie_key:
      'Tem certeza de que deseja girar as <strong>chaves de cookie do OIDC</strong>? Novos cookies gerados em sessões de login serão assinados pela nova chave de cookie. Os cookies existentes permanecem válidos até você girar novamente.',
    delete_private_key:
      'Tem certeza de que deseja excluir a <strong>chave privada do OIDC</strong>? Tokens JWT existentes assinados com esta chave privada de assinatura não serão mais válidos.',
    delete_cookie_key:
      'Tem certeza de que deseja excluir a <strong>chave de cookie do OIDC</strong>? As sessões de login mais antigas com cookies assinados com esta chave de cookie não serão mais válidas. Será necessária uma nova autenticação para esses usuários.',
  },
  messages: {
    rotate_key_success: 'Chaves de assinatura giradas com sucesso.',
    delete_key_success: 'Chave excluída com sucesso.',
  },
};

export default Object.freeze(signing_keys);
