const tenants = {
  create_modal: {
    title: 'Criar inquilino',
    subtitle: 'Crie um novo inquilino para separar recursos e usuários.',
    create_button: 'Criar inquilino',
    tenant_name: 'Nome do inquilino',
    tenant_name_placeholder: 'Meu inquilino',
    environment_tag: 'Tag de ambiente',
    environment_tag_description:
      'Use tags para diferenciar ambientes de uso de inquilino. Serviços dentro de cada tag são idênticos, garantindo consistência.',
    environment_tag_development: 'Desenvolvimento',
    environment_tag_staging: 'Staging',
    environment_tag_production: 'Produção',
  },
  tenant_created: "Inquilino '{{name}}' criado com sucesso.",
};

export default tenants;
