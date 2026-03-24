const concurrent_device_limit = {
  title: 'Limite de dispositivos simultâneos',
  enable: 'Ativar limite de dispositivos simultâneos',
  enable_description:
    'Quando ativado, o Logto impõe o máximo de concessões ativas por usuário para este aplicativo.',
  field: 'Limite de dispositivos simultâneos por aplicativo',
  field_description:
    'Limite quantos dispositivos um usuário pode estar conectado ao mesmo tempo. O Logto impõe isso limitando concessões ativas e revogando automaticamente a concessão mais antiga quando o limite é excedido.',
  field_placeholder: 'Deixar vazio para sem limite',
  should_be_greater_than_zero: 'Deve ser maior que 0.',
};

export default Object.freeze(concurrent_device_limit);
