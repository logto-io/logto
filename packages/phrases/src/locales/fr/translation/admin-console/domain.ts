const domain = {
  status: {
    connecting: 'Connexion...',
    in_use: 'Utilisé',
    failed_to_connect: 'Échec de la connexion',
  },
  update_endpoint_notice:
    'N’oubliez pas de mettre à jour le domaine pour l’URI de rappel du connecteur social et le point de terminaison Logto dans votre application si vous souhaitez utiliser un domaine personnalisé pour les fonctionnalités.',
  error_hint:
    'Assurez-vous de mettre à jour vos enregistrements DNS. Nous continuerons à vérifier toutes les {{value}} secondes.',
  custom: {
    custom_domain: 'Domaines personnalisés',
    custom_domain_description:
      'Améliorez votre image de marque en utilisant un domaine personnalisé. Ce domaine sera utilisé dans votre expérience de connexion.',
    custom_domain_field: 'Domaines personnalisés',
    custom_domain_placeholder: 'auth.domain.com',
    add_custom_domain_field: 'Ajouter un domaine personnalisé',
    custom_domains_field: 'Domaines personnalisés',
    add_domain: 'Ajouter un domaine',
    invalid_domain_format:
      'Veuillez fournir une URL de domaine valide avec un minimum de trois parties, par exemple "auth.domain.com."',
    verify_domain: 'Vérifier le domaine',
    enable_ssl: 'Activer SSL',
    checking_dns_tip:
      'Après avoir configuré les enregistrements DNS, le processus s’exécutera automatiquement et peut prendre jusqu’à 24 heures. Vous pouvez quitter cette interface pendant son exécution.',
    enable_ssl_tip:
      'Activer SSL s’exécutera automatiquement et peut prendre jusqu’à 24 heures. Vous pouvez quitter cette interface pendant son exécution.',
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
    config_custom_domain_description:
      'Configurez des domaines personnalisés pour mettre en place les fonctionnalités suivantes : applications, connecteurs sociaux et connecteurs d’entreprise.',
  },
  default: {
    default_domain: 'Domaine par défaut',
    default_domain_description:
      'Logto offre un domaine par défaut préconfiguré, prêt à être utilisé sans aucune configuration supplémentaire. Ce domaine par défaut sert de solution de secours même si vous avez activé un domaine personnalisé.',
    default_domain_field: 'Domaine par défaut de Logto',
  },
  custom_endpoint_note:
    'Vous pouvez personnaliser le nom de domaine de ces points de terminaison selon vos besoins. Choisissez soit "{{custom}}" ou "{{default}}".',
  custom_social_callback_url_note:
    'Vous pouvez personnaliser le nom de domaine de cette URI pour correspondre au point de terminaison de votre application. Choisissez soit "{{custom}}" ou "{{default}}".',
  custom_acs_url_note:
    'Vous pouvez personnaliser le nom de domaine de cette URI pour correspondre à l\'URL du service de consommation d\'assertion de votre fournisseur d\'identité. Choisissez soit "{{custom}}" ou "{{default}}".',
  switch_custom_domain_tip:
    'Basculez de domaine pour afficher l’endpoint correspondant. Ajoutez d’autres domaines via <a>domaines personnalisés</a>.',
  switch_saml_app_domain_tip:
    'Basculez de domaine pour afficher les URL correspondantes. Pour les protocoles SAML, les URL de métadonnées peuvent être hébergées sur n’importe quel domaine accessible. Toutefois, le domaine sélectionné détermine l’URL du service SSO que les SP utilisent pour rediriger les utilisateurs finaux pour l’authentification, ce qui impacte l’expérience de connexion et la visibilité de l’URL.',
  switch_saml_connector_domain_tip:
    'Basculez de domaine pour afficher les URL correspondantes. Le domaine sélectionné détermine votre URL ACS et donc l’endroit où les utilisateurs sont redirigés après la connexion SSO. Choisissez le domaine qui correspond au comportement de redirection attendu par votre application.',
};

export default Object.freeze(domain);
