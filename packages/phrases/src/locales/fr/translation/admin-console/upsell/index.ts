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
};

export default Object.freeze(upsell);
