const tenant_settings = {
  title: 'Paramètres du locataire',
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
      "Utilisez des tags pour différencier les environnements d'utilisation du locataire. Les services au sein de chaque tag sont identiques, assurant ainsi la cohérence.",
    environment_tag_development: 'Développement',
    environment_tag_staging: 'Mise en scène',
    environment_tag_production: 'Production',
  },
};

export default tenant_settings;
