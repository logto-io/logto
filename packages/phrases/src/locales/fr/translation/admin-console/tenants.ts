const tenants = {
  title: 'Paramètres',
  description: 'Gérez efficacement les paramètres du locataire et personnalisez votre domaine.',
  tabs: {
    settings: 'Paramètres',
    /** UNTRANSLATED */
    members: 'Members',
    domains: 'Domaines',
    subscription: 'Plan et facturation',
    billing_history: 'Historique de facturation',
  },
  settings: {
    title: 'PARAMÈTRES',
    description:
      "Définissez le nom du locataire et consultez la région d'hébergement de vos données et le type de locataire.",
    tenant_id: 'ID du locataire',
    tenant_name: 'Nom du locataire',
    tenant_region: "Région d'hébergement des données",
    tenant_region_tip:
      'Vos ressources de locataire sont hébergées dans {{region}}. <a>En savoir plus</a>',
    environment_tag_development: 'Dev',
    environment_tag_production: 'Prod',
    tenant_type: 'Type de locataire',
    development_description:
      "Uniquement pour les tests et ne devrait pas être utilisé en production. Aucune souscription n'est requise. Il possède toutes les fonctionnalités Pro mais présente des limitations telles qu'une bannière de connexion. <a>En savoir plus</a>",
    production_description:
      'Destiné aux applications utilisées par les utilisateurs finaux et pouvant nécessiter une souscription payante. <a>En savoir plus</a>',
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
    subtitle:
      "Créez un nouveau locataire disposant de ressources et d'utilisateurs isolés. Les régions de données hébergées et les types de locataires ne peuvent pas être modifiés après la création.",
    tenant_usage_purpose: 'Dans quel but souhaitez-vous utiliser ce locataire?',
    development_description:
      "Uniquement pour les tests et ne devrait pas être utilisé en production. Aucune souscription n'est requise.",
    development_hint:
      "Il possède toutes les fonctionnalités Pro mais présente des limitations telles qu'une bannière de connexion.",
    production_description:
      'À utiliser par les utilisateurs finaux et peut nécessiter une souscription payante.',
    available_plan: 'Plan disponible :',
    create_button: 'Créer un locataire',
    tenant_name_placeholder: 'Mon locataire',
  },
  dev_tenant_migration: {
    title:
      'Vous pouvez désormais essayer nos fonctionnalités Pro gratuitement en créant un nouveau "locataire de développement" !',
    affect_title: 'Comment cela vous affecte-t-il ?',
    hint_1:
      "Nous remplaçons les anciennes <strong>balises d'environnement</strong> par deux nouveaux types de locataires : <strong>« Développement »</strong> et <strong>« Production »</strong>.",
    hint_2:
      'Pour garantir une transition sans heurt et un fonctionnement ininterrompu, tous les locataires créés auparavant seront convertis en locataires de type <strong>Production</strong> avec votre précédente souscription.',
    hint_3: 'Ne vous inquiétez pas, tous vos autres paramètres resteront les mêmes.',
    about_tenant_type: 'À propos du type de locataire',
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
