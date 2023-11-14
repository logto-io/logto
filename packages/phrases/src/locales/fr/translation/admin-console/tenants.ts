const tenants = {
  title: 'Paramètres',
  description: 'Gérez efficacement les paramètres du locataire et personnalisez votre domaine.',
  tabs: {
    settings: 'Paramètres',
    domains: 'Domaines',
    subscription: 'Plan et facturation',
    billing_history: 'Historique de facturation',
  },
  settings: {
    title: 'PARAMÈTRES',
    description:
      "Définissez le nom du locataire et consultez votre région d'hébergement et l'étiquette d'environnement.",
    tenant_id: 'ID du locataire',
    tenant_name: 'Nom du locataire',
    tenant_region: "Région d'hébergement des données",
    tenant_region_tip:
      'Vos ressources de locataire sont hébergées dans {{region}}. <a>En savoir plus</a>',
    environment_tag: "Tag de l'environnement",
    environment_tag_description:
      'Les balises ne modifient pas le service. Elles servent simplement à différencier différents environnements.',
    environment_tag_development: 'Dev',
    environment_tag_staging: 'Staging',
    environment_tag_production: 'Prod',
    development_description:
      "L'environnement de développement est principalement utilisé pour les tests et inclut toutes les fonctionnalités professionnelles mais comporte des filigranes dans l'expérience de connexion. <a>En savoir plus</a>",
    tenant_info_saved: 'Les informations du locataire ont été enregistrées avec succès.',
  },
  full_env_tag: {
    development: 'Développement',
    production: 'Production',
  },
  deletion_card: {
    title: 'SUPPRIMER',
    tenant_deletion: 'Supprimer le locataire',
    tenant_deletion_description:
      'La suppression du locataire entraînera la suppression permanente de toutes les données utilisateur et configurations associées. Veuillez procéder avec prudence.',
    tenant_deletion_button: 'Supprimer le locataire',
  },
  create_modal: {
    title: 'Créer un locataire',
    subtitle: 'Créez un nouveau locataire pour séparer les ressources et les utilisateurs.',
    subtitle_with_region:
      "Créez un nouveau locataire pour séparer les ressources et les utilisateurs. La région et les balises d'environnement ne peuvent pas être modifiées après la création.",
    tenant_usage_purpose: 'Dans quel but souhaitez-vous utiliser ce locataire?',
    development_description:
      "L'environnement de développement est principalement utilisé pour les tests et ne doit pas être utilisé dans un environnement de production.",
    development_hint:
      "L'environnement de développement est principalement utilisé pour les tests et ne doit pas être utilisé dans un environnement de production.",
    production_description:
      "La production est l'endroit où le logiciel en direct est utilisé par les utilisateurs finaux et peut nécessiter un abonnement payant.",
    available_plan: 'Plan disponible :',
    create_button: 'Créer un locataire',
    tenant_name_placeholder: 'Mon locataire',
  },
  notification: {
    allow_pro_features_title:
      'Vous pouvez désormais accéder à <span>toutes les fonctionnalités de Logto Pro</span> dans votre locataire de développement !',
    allow_pro_features_description:
      "C'est entièrement gratuit, sans période d'essai - pour toujours !",
    explore_all_features: 'Explorer toutes les fonctionnalités',
    impact_title: 'Cela a-t-il un impact sur moi ?',
    staging_env_hint:
      'Votre étiquette de locataire a été mise à jour de "<strong>Staging</strong>" à "<strong>Production</strong>", mais ce changement n\'affectera pas votre configuration actuelle.',
    paid_tenant_hint_1:
      'En souscrivant au plan Logto Hobby, votre balise de locataire "<strong>Développement</strong>" passera à "<strong>Production</strong>", et cela n\'affectera pas votre configuration existante.',
    paid_tenant_hint_2:
      'Si vous êtes toujours au stade de développement, vous pouvez créer un nouveau locataire de développement pour accéder à davantage de fonctionnalités professionnelles.',
    paid_tenant_hint_3:
      "Si vous vous trouvez au stade de production ou dans un environnement de production, vous devez toujours souscrire à un abonnement spécifique. Vous n'avez donc rien à faire pour le moment.",
    paid_tenant_hint_4:
      "N'hésitez pas à nous contacter si vous avez besoin d'aide! Merci d'avoir choisi Logto!",
  },
  delete_modal: {
    title: 'Supprimer le locataire',
    description_line1:
      'Voulez-vous vraiment supprimer votre locataire "<span>{{name}}</span>" avec le tag de suffixe d\'environnement "<span>{{tag}}</span>" ? Cette action est irréversible et entraînera la suppression permanente de toutes vos données et informations de compte.',
    description_line2:
      'Avant de supprimer le compte, peut-être pouvons-nous vous aider. <span><a>Contactez-nous par e-mail</a></span>',
    description_line3:
      'Si vous souhaitez continuer, veuillez entrer le nom du locataire "<span>{{name}}</span>" pour confirmer.',
    delete_button: 'Supprimer définitivement',
    cannot_delete_title: 'Impossible de supprimer ce locataire',
    cannot_delete_description:
      "Désolé, vous ne pouvez pas supprimer ce locataire pour le moment. Assurez-vous d'être sur le Plan Gratuit et d'avoir payé toutes les factures en cours.",
  },
  tenant_landing_page: {
    title: "Vous n'avez pas encore créé de locataire",
    description:
      "Pour commencer à configurer votre projet avec Logto, veuillez créer un nouveau locataire. Si vous devez vous déconnecter ou supprimer votre compte, cliquez simplement sur le bouton d'avatar dans le coin supérieur droit.",
    create_tenant_button: 'Créer un locataire',
  },
  status: {
    mau_exceeded: 'MAU dépassé',
    suspended: 'Suspendu',
    overdue: 'En retard',
  },
  tenant_suspended_page: {
    title: "Locataire suspendu. Contactez-nous pour restaurer l'accès.",
    description_1:
      "Nous regrettons profondément de vous informer que votre compte de locataire a été temporairement suspendu en raison d'une utilisation abusive, y compris le dépassement des limites MAU, des paiements en retard ou d'autres actions non autorisées.",
    description_2:
      "Si vous avez besoin de clarifications supplémentaires, si vous avez des préoccupations ou si vous souhaitez restaurer la fonctionnalité complète et débloquer vos locataires, n'hésitez pas à nous contacter immédiatement.",
  },
  signing_keys: {
    title: 'CLÉS DE SIGNATURE',
    description: 'Gérez en toute sécurité les clés de signature dans votre locataire.',
    type: {
      private_key: 'Clés privées OIDC',
      cookie_key: 'Clés de cookies OIDC',
    },
    private_keys_in_use: "Clés privées en cours d'utilisation",
    cookie_keys_in_use: "Clés de cookies en cours d'utilisation",
    rotate_private_keys: 'Faire tourner les clés privées',
    rotate_cookie_keys: 'Faire tourner les clés de cookies',
    rotate_private_keys_description:
      "Cette action créera une nouvelle clé de signature privée, fera tourner la clé actuelle et supprimera votre clé précédente. Vos jetons JWT signés avec la clé actuelle resteront valides jusqu'à leur suppression ou une nouvelle rotation.",
    rotate_cookie_keys_description:
      "Cette action créera une nouvelle clé de cookie, fera tourner la clé actuelle et supprimera votre clé précédente. Vos cookies avec la clé actuelle resteront valides jusqu'à leur suppression ou une nouvelle rotation.",
    select_private_key_algorithm:
      "Sélectionnez l'algorithme de clé de signature pour la nouvelle clé privée",
    rotate_button: 'Faire tourner',
    table_column: {
      id: 'ID',
      status: 'Statut',
      algorithm: 'Algorithme de clé de signature',
    },
    status: {
      current: 'Actuel',
      previous: 'Précédent',
    },
    reminder: {
      rotate_private_key:
        "Êtes-vous sûr de vouloir faire tourner les <strong>clés privées OIDC</strong>? Les nouveaux jetons JWT émis seront signés par la nouvelle clé. Les jetons JWT existants resteront valides jusqu'à votre prochaine rotation.",
      rotate_cookie_key:
        "Êtes-vous sûr de vouloir faire tourner les <strong>clés de cookies OIDC</strong>? Les nouveaux cookies générés dans les sessions de connexion seront signés par la nouvelle clé de cookie. Les cookies existants resteront valides jusqu'à votre prochaine rotation.",
      delete_private_key:
        'Êtes-vous sûr de vouloir supprimer la <strong>clé privée OIDC</strong>? Les jetons JWT existants signés avec cette clé de signature privée ne seront plus valides.',
      delete_cookie_key:
        'Êtes-vous sûr de vouloir supprimer la <strong>clé de cookie OIDC</strong>? Les anciennes sessions de connexion avec des cookies signés avec cette clé de cookie ne seront plus valides. Une ré-authentification est requise pour ces utilisateurs.',
    },
    messages: {
      rotate_key_success: 'Rotation des clés de signature effectuée avec succès.',
      delete_key_success: 'Clé supprimée avec succès.',
    },
  },
};

export default Object.freeze(tenants);
