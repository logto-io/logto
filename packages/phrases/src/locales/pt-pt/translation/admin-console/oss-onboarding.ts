const oss_onboarding = {
  page_title: 'Onboarding',
  title: 'Conte-nos um pouco sobre si',
  description:
    'Conte-nos um pouco sobre si e o seu projeto. Isto ajuda-nos a tornar o Logto melhor para todos.',
  email: {
    label: 'Endereco de email',
    description:
      'Usaremos este endereco se precisarmos de entrar em contacto consigo sobre a sua conta.',
    placeholder: 'email@example.com',
  },
  newsletter:
    'Receba atualizacoes do produto, avisos de seguranca e conteudo selecionado da Logto.',
  project: {
    label: 'Estou a usar o Logto para',
    personal: 'Projeto pessoal',
    company: 'Projeto empresarial',
  },
  project_name: {
    label: 'Nome do projeto',
    placeholder: 'O meu projeto',
  },
  company_name: {
    label: 'Nome da empresa',
    placeholder: 'Acme.co',
  },
  company_size: {
    label: 'Qual e a dimensao da sua empresa?',
  },
  errors: {
    email_required: 'O endereco de email e obrigatorio',
    email_invalid: 'Introduza um endereco de email valido',
  },
};

export default Object.freeze(oss_onboarding);
