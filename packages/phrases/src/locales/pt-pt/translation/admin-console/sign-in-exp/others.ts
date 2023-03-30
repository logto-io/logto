const others = {
  terms_of_use: {
    title: 'TERMOS DE USO',
    terms_of_use: 'URL dos termos de uso',
    terms_of_use_placeholder: 'https://seus.termos.de.uso/',
    privacy_policy: 'URL da política de privacidade',
    privacy_policy_placeholder: 'https://sua.politica.de.privacidade/',
  },
  languages: {
    title: 'LÍNGUAS',
    enable_auto_detect: 'Ativar deteção automática',
    description:
      'O seu software deteta as definições de localização do utilizador e alterna para a língua local. Pode adicionar novas línguas através da tradução da UI do Inglês para outra língua.',
    manage_language: 'Gerir língua',
    default_language: 'Língua predefinida',
    default_language_description_auto:
      'A língua predefinida será utilizada quando a língua detetada do utilizador não estiver abrangida na biblioteca de línguas atual.',
    default_language_description_fixed:
      'Quando a deteção automática está inativa, a língua predefinida é a única língua que o seu software apresentará. Ative a deteção automática para extensão de língua.',
  },
  manage_language: {
    title: 'Gerir língua',
    subtitle:
      'Localize a experiência de produto adicionando línguas e traduções. A sua contribuição pode ser definida como a língua predefinida.',
    add_language: 'Adicionar Língua',
    logto_provided: 'Logto fornecido',
    key: 'Chave',
    logto_source_values: 'Logto valores de origem',
    custom_values: 'Valores personalizados',
    clear_all_tip: 'Limpar todos os valores',
    unsaved_description: 'As alterações não serão guardadas se sair desta página sem guardar.',
    deletion_tip: 'Eliminar a língua',
    deletion_title: 'Deseja eliminar a língua adicionada?',
    deletion_description:
      'Após a eliminação, os seus utilizadores já não poderão navegar nessa língua novamente.',
    default_language_deletion_title: 'A língua predefinida não pode ser eliminada.',
    default_language_deletion_description:
      '{{language}} está definida como a sua língua predefinida e não pode ser eliminada. ',
  },
  advanced_options: {
    title: 'OPÇÕES AVANÇADAS',
    enable_user_registration: 'Ativar registo de utilizador',
    enable_user_registration_description:
      'Autorizar ou proibir o registo de utilizadores. Depois de desativado, os utilizadores ainda podem ser adicionados na consola de administração, mas os utilizadores já não podem estabelecer contas através da UI de início de sessão.',
  },
};

export default others;
