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
    /** UNTRANSLATED */
    api_resource: 'API resource',
    /** UNTRANSLATED */
    machine_to_machine: 'machine-to-machine application',
    /** UNTRANSLATED */
    tokens: '{{limit}}M tokens',
  },
  /** UNTRANSLATED */
  charge_notification_for_quota_limit:
    'You have surpassed your {{item}} quota limit. Logto will add charges for the usage beyond your quota limit. Charging will commence on the day the new add-on pricing design is released. <a>Learn more</a>',
  paywall,
};

export default Object.freeze(upsell);
