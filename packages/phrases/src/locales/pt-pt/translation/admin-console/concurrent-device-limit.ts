const concurrent_device_limit = {
  title: 'Limite de dispositivos concorrentes',
  enable: 'Ativar limite de dispositivos concorrentes',
  enable_description:
    'Quando ativada, Logto aplica o máximo de concessões ativas por utilizador para esta aplicação.',
  field: 'Limite de dispositivos concorrentes por aplicação',
  field_description:
    'Limite quantos dispositivos um utilizador pode estar conectado ao mesmo tempo. Logto aplica este limite restringindo concessões ativas e revogando automaticamente a concessão mais antiga quando o limite é excedido.',
  field_placeholder: 'Deixe vazio para sem limite',
  should_be_greater_than_zero: 'Deve ser superior a 0.',
};

export default Object.freeze(concurrent_device_limit);
