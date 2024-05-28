const tenants = {
  title: 'Paramètres',
  description: 'Gérez efficacement les paramètres du locataire et personnalisez votre domaine.',
  tabs: {
    settings: 'Paramètres',
    members: 'Membres',
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
  leave_tenant_card: {
    title: 'QUITTER',
    leave_tenant: 'Quitter le locataire',
    leave_tenant_description:
      "Toutes les ressources du locataire resteront, mais vous n'aurez plus accès à ce locataire.",
    last_admin_note:
      "Pour quitter ce locataire, assurez-vous qu'au moins un autre membre a le rôle Administrateur.",
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
      'Vous pouvez désormais essayer nos fonctionnalités Pro gratuitement en créant un nouveau « locataire de développement » !',
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
      'Êtes-vous sûr de vouloir supprimer votre locataire "<span>{{name}}</span>" avec le tag de suffixe d\'environnement "<span>{{tag}}</span>"? Cette action est irréversible et entraînera la suppression permanente de toutes vos données et informations de locataire.',
    description_line2:
      'Avant de supprimer le locataire, peut-être pouvons-nous vous aider. <span><a>Contactez-nous par e-mail</a></span>',
    description_line3:
      'Si vous souhaitez continuer, veuillez entrer le nom du locataire "<span>{{name}}</span>" pour confirmer.',
    delete_button: 'Supprimer définitivement',
    cannot_delete_title: 'Impossible de supprimer ce locataire',
    cannot_delete_description:
      "Désolé, vous ne pouvez pas supprimer ce locataire pour le moment. Assurez-vous d'être sur le Plan Gratuit et d'avoir payé toutes les factures en cours.",
  },
  leave_tenant_modal: {
    description: 'Êtes-vous sûr de vouloir quitter ce locataire?',
    leave_button: 'Partir',
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
};

export default Object.freeze(tenants);
