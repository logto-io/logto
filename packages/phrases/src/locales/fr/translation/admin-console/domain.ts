const domain = {
  status: {
    connecting: 'Connexion',
    in_used: 'Utilisé',
    failed_to_connect: 'Échec de la connexion',
  },
  update_endpoint_notice:
    "Votre domaine personnalisé a été configuré avec succès. Pensez à mettre à jour le domaine utilisé pour l'URI de rappel du connecteur social et le point de terminaison Logto pour votre application si vous avez précédemment configuré les ressources. <a>{{link}}</a>",
  error_hint:
    'Assurez-vous de mettre à jour vos enregistrements DNS. Nous continuerons à vérifier toutes les {{value}} secondes.',
  custom: {
    custom_domain: 'Domaine personnalisé',
    custom_domain_description:
      'Remplacez le domaine par défaut par votre propre domaine afin de maintenir la cohérence avec votre marque et de personnaliser l’expérience de connexion pour vos utilisateurs.',
    custom_domain_field: 'Domaine personnalisé',
    custom_domain_placeholder: 'votre.domaine.com',
    add_domain: 'Ajouter un domaine',
    invalid_domain_format:
      'Format de sous-domaine invalide. Veuillez entrer un sous-domaine d’au moins trois parties.',
    verify_domain: 'Vérifier le domaine',
    enable_ssl: 'Activer SSL',
    checking_dns_tip:
      "Après avoir configuré les enregistrements DNS, le processus s'exécutera automatiquement et peut prendre jusqu'à 24 heures. Vous pouvez quitter cette interface pendant son exécution.",
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
