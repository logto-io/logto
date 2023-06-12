const tenant_settings = {
  title: 'Paramètres',
  description:
    'Modifiez vos paramètres de compte et gérez vos informations personnelles ici pour assurer la sécurité de votre compte.',
  tabs: {
    settings: 'Paramètres',
    domains: 'Domaines',
  },
  profile: {
    title: 'PARAMÈTRES DU PROFIL',
    tenant_id: 'ID du locataire',
    tenant_name: 'Nom du locataire',
    environment_tag: "Tag de l'environnement",
    environment_tag_description:
      'Les services avec différentes balises sont identiques. Il fonctionne comme un suffixe pour aider votre équipe à différencier les environnements.',
    environment_tag_development: 'Dev',
    environment_tag_staging: 'Staging',
    environment_tag_production: 'Prod',
    tenant_info_saved: 'Les informations du locataire ont été enregistrées avec succès.',
  },
  deletion_card: {
    title: 'SUPPRIMER',
    tenant_deletion: 'Supprimer le locataire',
    tenant_deletion_description:
      "La suppression de votre compte entraînera la suppression de toutes vos informations personnelles, données d'utilisateur et configuration. Cette action est irréversible.",
    tenant_deletion_button: 'Supprimer le locataire',
  },
};

export default tenant_settings;
