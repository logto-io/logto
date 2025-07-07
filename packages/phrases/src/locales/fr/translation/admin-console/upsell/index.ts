import add_on from './add-on.js';
import featured_plan_content from './featured-plan-content.js';
import paywall from './paywall.js';

const upsell = {
  upgrade_plan: 'Mettre à niveau le plan',
  compare_plans: 'Comparer les plans',
  view_plans: 'Voir les plans',
  create_tenant: {
    title: 'Sélectionnez votre plan pour le locataire',
    description:
      'Logto propose des options de plan compétitives avec une tarification innovante et abordable conçue pour les entreprises en croissance. <a>En savoir plus</a>',
    base_price: 'Prix de base',
    monthly_price: '{{value, number}}/mois',
    view_all_features: 'Voir toutes les fonctionnalités',
    select_plan: 'Sélectionnez <name/>',
    free_tenants_limit: "Jusqu'à {{count, number}} locataire gratuit",
    free_tenants_limit_other: "Jusqu'à {{count, number}} locataires gratuits",
    most_popular: 'Le plus populaire',
    upgrade_success: 'Passage réussi à <name/>',
  },
  mau_exceeded_modal: {
    title: 'La limite de MAU a été dépassée. Mettez à niveau votre plan.',
    notification:
      'Votre MAU actuel a dépassé la limite de <planName/>. Veuillez mettre à niveau votre plan pour passer à la version premium rapidement et éviter la suspension du service Logto.',
    update_plan: 'Mettre à jour le plan',
  },
  token_exceeded_modal: {
    title: "L'utilisation de jetons a dépassé la limite. Mettez à niveau votre plan.",
    notification:
      "Vous avez dépassé la limite d'utilisation des jetons de <planName/>. Les utilisateurs ne pourront pas accéder correctement au service Logto. Veuillez mettre à niveau votre plan vers la version premium rapidement pour éviter tout inconvénient.",
  },
  payment_overdue_modal: {
    title: 'Paiement de facture en retard',
    notification:
      'Oups ! Le paiement de la facture du locataire <span>{{name}}</span> a échoué. Veuillez payer la facture rapidement pour éviter la suspension du service Logto.',
    unpaid_bills: 'Factures impayées',
    update_payment: 'Mettre à jour le paiement',
  },
  add_on_quota_item: {
    api_resource: 'Ressource API',
    machine_to_machine: 'application machine à machine',
    tokens: '{{limit}}M jetons',
    tenant_member: 'membre du locataire',
  },
  charge_notification_for_quota_limit:
    "Vous avez dépassé votre limite de quota {{item}}. Logto ajoutera des frais pour l'utilisation au-delà de votre limite de quota. La facturation commencera le jour de la publication du nouveau design tarifaire de l'extension. <a>En savoir plus</a>",
  paywall,
  featured_plan_content,
  add_on,
  convert_to_production_modal: {
    title: 'Vous allez changer votre locataire de développement en locataire de production',
    description:
      'Prêt à passer en ligne ? Convertir ce locataire dev en locataire de production débloquera toutes les fonctionnalités',
    benefits: {
      stable_environment:
        'Pour les utilisateurs finaux : Un environnement stable pour un usage réel.',
      keep_pro_features:
        'Conservez les fonctionnalités Pro : vous allez vous abonner au plan Pro. <a>Voir les fonctionnalités Pro.</a>',
      no_dev_restrictions:
        "Pas de restrictions de développement : Supprime les limites du système d'entité et de ressource et la bannière de connexion.",
    },
    cards: {
      dev_description: 'À des fins de test',
      prod_description: 'Production réelle',
      convert_label: 'convertir',
    },
    button: 'Convertir en locataire de production',
  },
};

export default Object.freeze(upsell);
