const tenant_settings = {
  title: 'Configurações',
  description: 'Gerencie eficientemente as configurações do locatário e personalize seu domínio.',
  tabs: {
    settings: 'Configurações',
    domains: 'Domínios',
  },
  settings: {
    title: 'CONFIGURAÇÕES',
    tenant_id: 'ID do Locatário',
    tenant_name: 'Nome do Locatário',
    environment_tag: 'Tag do Ambiente',
    environment_tag_description:
      'As tags não alteram o serviço. Elas apenas ajudam a diferenciar vários ambientes.',
    environment_tag_development: 'Dev',
    environment_tag_staging: 'Staging',
    environment_tag_production: 'Prod',
    tenant_info_saved: 'As informações do locatário foram salvas com sucesso.',
  },
  deletion_card: {
    title: 'EXCLUIR',
    tenant_deletion: 'Excluir locatário',
    tenant_deletion_description:
      'A exclusão do locatário resultará na remoção permanente de todos os dados de usuário e configuração associados. Por favor, prossiga com cuidado.',
    tenant_deletion_button: 'Excluir locatário',
  },
};

export default tenant_settings;
