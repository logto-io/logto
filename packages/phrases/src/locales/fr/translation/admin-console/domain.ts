const domain = {
  status: {
    connecting: 'Connexion',
    in_used: 'Utilisé',
    failed_to_connect: 'Échec de la connexion',
  },
  update_endpoint_alert: {
    description:
      'Votre domaine personnalisé a été configuré avec succès. N’oubliez pas de mettre à jour le domaine que vous avez utilisé pour {{domain}} si vous avez configuré les ressources ci-dessous auparavant.',
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
    custom_domain_placeholder: 'votredomaine.com',
    add_domain: 'Ajouter un domaine',
    invalid_domain_format: 'Format de domaine invalide',
    steps: {
      add_records: {
        title: 'Ajoutez les enregistrements DNS suivants à votre fournisseur DNS',
        generating_dns_records: 'Génération des enregistrements DNS...',
        table: {
          type_field: 'Type',
          name_field: 'Nom',
          value_field: 'Valeur',
        },
        finish_and_continue: 'Terminer et continuer',
      },
      verify_domain: {
        title: 'Vérifier la connexion des enregistrements DNS automatiquement',
        description:
          "Le processus sera effectué automatiquement, ce qui peut prendre quelques minutes (jusqu'à 24 heures). Vous pouvez quitter cette interface pendant son exécution.",
        error_message:
          'Impossible de vérifier. Veuillez vérifier votre nom de domaine ou vos enregistrements DNS.',
      },
      generate_ssl_cert: {
        title: 'Générer un certificat SSL automatiquement',
        description:
          "Le processus sera effectué automatiquement, ce qui peut prendre quelques minutes (jusqu'à 24 heures). Vous pouvez quitter cette interface pendant son exécution.",
        error_message: 'Impossible de générer le certificat SSL.',
      },
      enable_domain: 'Activer votre domaine personnalisé automatiquement',
    },
    deletion: {
      delete_domain: 'Supprimer le domaine',
      reminder: 'Supprimer le domaine personnalisé',
      description: 'Êtes-vous sûr de vouloir supprimer ce domaine personnalisé ?',
      in_used_description:
        'Êtes-vous sûr de vouloir supprimer ce domaine personnalisé "{{domain}}" ?',
      in_used_tip:
        "Si vous avez configuré ce domaine personnalisé dans votre fournisseur de connecteur social ou votre point de terminaison d'application auparavant, vous devrez d'abord modifier l'URI en domaine personnalisé de Logto \"{{domain}}\". C'est nécessaire pour que le bouton de connexion sociale fonctionne correctement.",
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
