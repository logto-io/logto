const tenant_settings = {
  title: 'Paramètres',
  description: 'Gérez efficacement les paramètres du locataire et personnalisez votre domaine.',
  tabs: {
    settings: 'Paramètres',
    domains: 'Domaines',
  },
  settings: {
    title: 'PARAMÈTRES',
    tenant_id: 'ID du locataire',
    tenant_name: 'Nom du locataire',
    environment_tag: "Tag de l'environnement",
    environment_tag_description:
      'Les balises ne modifient pas le service. Elles servent simplement à différencier différents environnements.',
    environment_tag_development: 'Dev',
    environment_tag_staging: 'Staging',
    environment_tag_production: 'Prod',
    tenant_info_saved: 'Les informations du locataire ont été enregistrées avec succès.',
  },
  deletion_card: {
    title: 'SUPPRIMER',
    tenant_deletion: 'Supprimer le locataire',
    tenant_deletion_description:
      'La suppression du locataire entraînera la suppression permanente de toutes les données utilisateur et configurations associées. Veuillez procéder avec prudence.',
    tenant_deletion_button: 'Supprimer le locataire',
  },
};

export default tenant_settings;
