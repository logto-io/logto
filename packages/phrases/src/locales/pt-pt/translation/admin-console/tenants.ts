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
  delete_modal: {
    title: 'Eliminar inquilino',
    description_line1:
      'Tem a certeza de que pretende eliminar o seu inquilino "<span>{{name}}</span>" com a etiqueta de sufixo de ambiente "<span>{{tag}}</span>"? Esta ação não pode ser desfeita e resultará na eliminação permanente de todos os seus dados e informações da conta.',
    description_line2:
      'Antes de eliminar a conta, podemos ajudá-lo. <span><a>Contacte-nos por email</a></span>',
    description_line3:
      'Se desejar continuar, introduza o nome do inquilino "<span>{{name}}</span>" para confirmar.',
    delete_button: 'Eliminar permanentemente',
  },
  tenant_created: "Inquilino '{{name}}' criado com sucesso.",
};

export default tenants;
