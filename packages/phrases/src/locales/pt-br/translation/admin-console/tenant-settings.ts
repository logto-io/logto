const tenant_settings = {
  title: 'Configurações',
  description:
    'Alterar suas informações da conta e gerenciar suas informações pessoais aqui para garantir a segurança da sua conta.',
  tabs: {
    settings: 'Configurações',
    domains: 'Domínios',
  },
  profile: {
    title: 'CONFIGURAÇÃO DE PERFIL',
    tenant_id: 'ID do Locatário',
    tenant_name: 'Nome do Locatário',
    environment_tag: 'Tag do Ambiente',
    environment_tag_description:
      'Use tags para diferenciar os ambientes de uso do locatário. Os serviços em cada tag são os mesmos, garantindo consistência.',
    environment_tag_development: 'Desenvolvimento',
    environment_tag_staging: 'Teste',
    environment_tag_production: 'Produção',
  },
  deletion_card: {
    title: 'EXCLUIR',
    tenant_deletion: 'Excluir locatário',
    tenant_deletion_description:
      'A exclusão da sua conta removerá todas as suas informações pessoais, dados de usuário e configurações. Essa ação não pode ser desfeita.',
    tenant_deletion_button: 'Excluir locatário',
  },
};

export default tenant_settings;
