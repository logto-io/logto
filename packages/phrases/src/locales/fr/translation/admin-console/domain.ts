const domain = {
  status: {
    connecting: 'Connexion',
    in_used: 'Utilisé',
    failed_to_connect: 'Échec de la connexion',
  },
  update_endpoint_alert: {
    description:
      'Votre domaine personnalisé a été configuré avec succès. N’oubliez pas de mettre à jour le domaine que vous avez utilisé pour <span>{{domain}}</span> si vous avez configuré les ressources ci-dessous auparavant.',
    endpoint_url: 'URL de point de terminaison de <a>{{link}}</a>',
    application_settings_link_text: 'Réglages de l’application',
    callback_url: 'URL de rappel de <a>{{link}}</a>',
    social_connector_link_text: 'Connecteur social',
    api_identifier: 'Identificateur d’API de <a>{{link}}</a>',
    uri_management_api_link_text: 'API de gestion des URI',
    tip: 'Après avoir modifié les paramètres, vous pouvez le tester dans notre expérience de connexion <a>{{link}}</a>.',
  },
  custom: {
    custom_domain: 'Domaine personnalisé',
    custom_domain_description:
      'Remplacez le domaine par défaut par votre propre domaine pour maintenir la cohérence avec votre marque et personnaliser l’expérience de connexion pour vos utilisateurs.',
    custom_domain_field: 'Domaine personnalisé',
    custom_domain_placeholder: 'votre.domaine.com',
    add_domain: 'Ajouter un domaine',
    invalid_domain_format:
      'Format de sous-domaine invalide. Veuillez entrer un sous-domaine d’au moins trois parties.',
    verify_domain: 'Vérifier le domaine',
    enable_ssl: 'Activer SSL',
    checking_dns_tip:
      'Après avoir configuré les enregistrements DNS, le processus s’exécutera automatiquement et peut prendre jusqu’à 24 heures. Vous pouvez quitter cette interface pendant son exécution.',
    generating_dns_records: 'Génération des enregistrements DNS...',
    add_dns_records: 'Veuillez ajouter ces enregistrements DNS à votre fournisseur DNS.',
    dns_table: {
      type_field: 'Type',
      name_field: 'Nom',
      value_field: 'Valeur',
    },
    deletion: {
      delete_domain: 'Supprimer le domaine',
      reminder: 'Supprimer le domaine personnalisé',
      description: 'Êtes-vous sûr de vouloir supprimer ce domaine personnalisé ?',
      in_used_description:
        'Êtes-vous sûr de vouloir supprimer ce domaine personnalisé "<span>{{domain}}</span>" ?',
      in_used_tip:
        'Si vous avez configuré ce domaine personnalisé dans votre fournisseur de connecteur social ou le point de terminaison de l’application avant, vous devrez d’abord modifier l’URI vers le domaine Logto par défaut "<span>{{domain}}</span>". Ceci est nécessaire pour que le bouton de connexion sociale fonctionne correctement.',
      deleted: 'Suppression du domaine personnalisé réussie !',
    },
  },
  default: {
    default_domain: 'Domaine par défaut',
    default_domain_description:
      'Nous fournissons un nom de domaine par défaut qui peut être utilisé directement en ligne. Il est toujours disponible, assurant que votre application peut toujours être accessible pour la connexion, même si vous passez à un domaine personnalisé.',
    default_domain_field: 'Domaine par défaut de Logto',
  },
};

export default domain;
