const tenants = {
  create_modal: {
    title: 'Créer un locataire',
    subtitle: 'Créez un nouveau locataire pour séparer les ressources et les utilisateurs.',
    create_button: 'Créer un locataire',
    tenant_name: 'Nom du locataire',
    tenant_name_placeholder: 'Mon locataire',
    environment_tag: 'Balise environnement',
    environment_tag_description:
      "Utilisez des balises pour différencier les environnements d'utilisation des locataires. Les services dans chaque balise sont identiques, assurant ainsi la cohérence.",
    environment_tag_development: 'Développement',
    environment_tag_staging: 'Mise en scène',
    environment_tag_production: 'Production',
  },
  tenant_created: "Locataire '{{name}}' créé avec succès.",
};

export default tenants;
