const oss_onboarding = {
  page_title: 'Onboarding',
  title: 'Conte um pouco sobre voce',
  description:
    'Conte um pouco sobre voce e seu projeto. Isso nos ajuda a construir um Logto melhor para todos.',
  email: {
    label: 'Endereco de e-mail',
    description: 'Usaremos este endereco se precisarmos entrar em contato sobre sua conta.',
    placeholder: 'email@example.com',
  },
  newsletter:
    'Receba atualizacoes do produto, avisos de seguranca e conteudo selecionado da Logto.',
  project: {
    label: 'Estou usando o Logto para',
    personal: 'Projeto pessoal',
    company: 'Projeto da empresa',
  },
  company_name: {
    label: 'Nome da empresa',
    placeholder: 'Acme.co',
  },
  company_size: {
    label: 'Qual e o tamanho da sua empresa?',
  },
  errors: {
    email_required: 'O endereco de e-mail e obrigatorio',
    email_invalid: 'Digite um endereco de e-mail valido',
    company_name_required: 'O nome da empresa e obrigatorio',
    company_size_required: 'O tamanho da empresa e obrigatorio',
  },
};

export default Object.freeze(oss_onboarding);
