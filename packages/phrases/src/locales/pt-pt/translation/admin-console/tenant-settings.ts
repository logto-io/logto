const tenant_settings = {
  title: 'Definições',
  description:
    'Mude suas configurações de conta e gerencie suas informações pessoais aqui para garantir a segurança de sua conta.',
  tabs: {
    settings: 'Definições',
    domains: 'Domínios',
  },
  profile: {
    title: 'DEFINIÇÕES DE PERFIL',
    tenant_id: 'ID do Inquilino',
    tenant_name: 'Nome do Inquilino',
    environment_tag: 'Tag de Ambiente',
    environment_tag_description:
      'Os serviços com etiquetas diferentes são idênticos. Funciona como um sufixo para ajudar a sua equipa a diferenciar ambientes.',
    environment_tag_development: 'Dev',
    environment_tag_staging: 'Staging',
    environment_tag_production: 'Prod',
    tenant_info_saved: 'A informação do arrendatário foi guardada com sucesso.',
  },
  deletion_card: {
    title: 'ELIMINAR',
    tenant_deletion: 'Eliminar inquilino',
    tenant_deletion_description:
      'A eliminação da sua conta removerá todas as suas informações pessoais, dados de utilizador e configuração. Esta ação não pode ser desfeita.',
    tenant_deletion_button: 'Eliminar inquilino',
  },
};

export default tenant_settings;
