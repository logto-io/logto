const content = {
  terms_of_use: {
    title: 'TERMS',
    description:
      'Adiciona os Termos e a Política de Privacidade para cumprir os requisitos de conformidade.',
    terms_of_use: 'URL dos termos de uso',
    terms_of_use_placeholder: 'https://your.terms.of.use/',
    privacy_policy: 'URL da política de privacidade',
    privacy_policy_placeholder: 'https://your.privacy.policy/',
    agree_to_terms: 'Aceitar os termos',
    agree_policies: {
      automatic: 'Continuar a aceitar automaticamente os termos',
      manual_registration_only: 'Exigir aceitação da caixa de verificação apenas no registo',
      manual: 'Exigir aceitação da caixa de verificação tanto no registo quanto no login',
    },
  },
  languages: {
    title: 'IDIOMAS',
    enable_auto_detect: 'Ativar deteção automática',
    description:
      'O seu software deteta as definições de idioma do utilizador e muda para o idioma local. Pode adicionar novos idiomas traduzindo a interface do inglês para outro idioma.',
    manage_language: 'Gerir idioma',
    default_language: 'Idioma predefinido',
    default_language_description_auto:
      'O idioma predefinido será utilizado quando o idioma detetado do utilizador não estiver disponível na biblioteca atual.',
    default_language_description_fixed:
      'Com a deteção automática desativada, o idioma predefinido é o único idioma que o seu software mostrará. Ative a deteção automática para expandir os idiomas.',
  },
  support: {
    title: 'SUPORTE',
    subtitle:
      'Mostra os teus canais de suporte nas páginas de erro para assistência rápida ao utilizador.',
    support_email: 'Email de suporte',
    support_email_placeholder: 'support@email.com',
    support_website: 'Website de suporte',
    support_website_placeholder: 'https://your.website/support',
  },
  manage_language: {
    title: 'Gerir idioma',
    subtitle:
      'Localize a experiência do produto adicionando idiomas e traduções. A sua contribuição pode ser definida como idioma predefinido.',
    add_language: 'Adicionar idioma',
    logto_provided: 'Fornecido pela Logto',
    key: 'Chave',
    logto_source_values: 'Valores de origem da Logto',
    custom_values: 'Valores personalizados',
    clear_all_tip: 'Limpar todos os valores',
    unsaved_description: 'As alterações não serão guardadas se sair desta página sem guardar.',
    deletion_tip: 'Eliminar o idioma',
    deletion_title: 'Pretende eliminar o idioma adicionado?',
    deletion_description:
      'Após a eliminação, os utilizadores deixarão de poder navegar nesse idioma.',
    default_language_deletion_title: 'Não é possível eliminar o idioma predefinido.',
    default_language_deletion_description:
      '{{language}} está definido como o seu idioma predefinido e não pode ser eliminado.',
  },
};

export default Object.freeze(content);
