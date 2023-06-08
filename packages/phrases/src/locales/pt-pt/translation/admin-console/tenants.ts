const tenants = {
  create_modal: {
    title: 'Criar inquilino',
    subtitle: 'Crie um novo inquilino para separar recursos e utilizadores.',
    create_button: 'Criar inquilino',
    tenant_name: 'Nome do inquilino',
    tenant_name_placeholder: 'Meu inquilino',
    environment_tag: 'Etiqueta de ambiente',
    environment_tag_description:
      'Use etiquetas para diferenciar os ambientes de utilização do inquilino. Os serviços em cada etiqueta são idênticos, garantindo consistência.',
    environment_tag_development: 'Desenvolvimento',
    environment_tag_staging: 'Staging',
    environment_tag_production: 'Produção',
  },
  tenant_created: "Inquilino '{{name}}' criado com sucesso.",
};

export default tenants;
