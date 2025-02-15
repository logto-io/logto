const cloud = {
  general: {
    onboarding: 'Introdução',
  },
  create_tenant: {
    page_title: 'Criar inquilino',
    title: 'Crie o seu primeiro inquilino',
    description:
      'Um inquilino é um ambiente isolado onde pode gerir identidades de utilizadores, aplicações e todos os demais recursos da Logto.',
    invite_collaborators: 'Convide os seus colaboradores por email',
  },
  social_callback: {
    title: 'Entrou com Sucesso',
    description:
      'Entrou com sucesso usando a sua conta social. Para garantir uma integração perfeita e acesso a todos os recursos da Logto, recomendamos que prossiga para configurar o seu próprio conector social.',
    notice:
      'Por favor evite usar o conector de demonstração para fins de produção. Após concluir os testes, elimine o conector de demonstração e configure o seu próprio conector com as suas credenciais.',
  },
  tenant: {
    create_tenant: 'Criar novo inquilino',
  },
};

export default Object.freeze(cloud);
