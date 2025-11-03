const content = {
  terms_of_use: {
    title: 'TERMS',
    description: 'Adicione Termos e Privacidade para atender aos requisitos de conformidade.',
    terms_of_use: 'URL dos termos de uso',
    terms_of_use_placeholder: 'https://your.terms.of.use/',
    privacy_policy: 'URL da política de privacidade',
    privacy_policy_placeholder: 'https://your.privacy.policy/',
    agree_to_terms: 'Concordar com os termos',
    agree_policies: {
      automatic: 'Continuar concordando automaticamente com os termos',
      manual_registration_only: 'Requerer concordância da caixa de seleção apenas no registro',
      manual: 'Requerer concordância da caixa de seleção tanto no registro quanto no login',
    },
  },
  languages: {
    title: 'IDIOMAS',
    enable_auto_detect: 'Habilitar detecção automática',
    description:
      'Seu software detecta as configurações de idioma do usuário e alterna para o idioma local. Você pode adicionar novos idiomas traduzindo a interface do inglês para outro idioma.',
    manage_language: 'Gerenciar idioma',
    default_language: 'Idioma padrão',
    default_language_description_auto:
      'O idioma padrão será usado quando o idioma detectado do usuário não estiver disponível na biblioteca atual.',
    default_language_description_fixed:
      'Com a detecção automática desativada, o idioma padrão é o único que seu software exibirá. Ative a detecção automática para ampliar os idiomas.',
  },
  support: {
    title: 'SUPORTE',
    subtitle: 'Exiba seus canais de suporte em páginas de erro para assistência rápida ao usuário.',
    support_email: 'Email de suporte',
    support_email_placeholder: 'support@email.com',
    support_website: 'Site de suporte',
    support_website_placeholder: 'https://your.website/support',
  },
  manage_language: {
    title: 'Gerenciar idioma',
    subtitle:
      'Localize a experiência do produto adicionando idiomas e traduções. Sua contribuição pode ser definida como idioma padrão.',
    add_language: 'Adicionar idioma',
    logto_provided: 'Fornecido pela Logto',
    key: 'Chave',
    logto_source_values: 'Valores de origem da Logto',
    custom_values: 'Valores personalizados',
    clear_all_tip: 'Limpar todos os valores',
    unsaved_description: 'As alterações não serão salvas se você sair desta página sem salvar.',
    deletion_tip: 'Excluir o idioma',
    deletion_title: 'Deseja excluir o idioma adicionado?',
    deletion_description: 'Após a exclusão, os usuários não poderão mais navegar nesse idioma.',
    default_language_deletion_title: 'O idioma padrão não pode ser excluído.',
    default_language_deletion_description:
      '{{language}} está definido como seu idioma padrão e não pode ser excluído.',
  },
};

export default Object.freeze(content);
