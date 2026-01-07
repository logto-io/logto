const enterprise_subscription = {
  page_title: 'Abonnement',
  title: 'Gérer votre abonnement',
  subtitle:
    'Ceci est pour gérer votre abonnement multi-locataires et votre historique de facturation',
  tab: {
    subscription: 'Abonnement',
    billing_history: 'Historique de facturation',
  },
  subscription: {
    title: 'Abonnement',
    description:
      'Suivez facilement votre utilisation, voyez votre prochaine facture, et révisez votre contrat original.',
    enterprise_plan_title: 'Forfait Entreprise',
    enterprise_plan_description:
      "Ceci est votre abonnement au forfait Entreprise et ce quota est partagé entre les locataires. L' utilisation peut être soumise à un léger retard de mise à jour.",
    add_on_title: 'Modules complémentaires à la carte',
    add_on_description:
      'Ce sont des modules complémentaires à la carte basés sur votre contrat ou sur les tarifs standards à la carte de Logto. Vous serez facturé en fonction de votre utilisation réelle.',
    included: 'Inclus',
    over_quota: 'Dépassement de quota',
    basic_plan_column_title: {
      product: 'Produit',
      usage: 'Utilisation',
      quota: 'Quota',
    },
    add_on_column_title: {
      product: 'Produit',
      unit_price: 'Prix unitaire',
      quantity: 'Quantité',
      total_price: 'Total',
    },
    add_on_sku_price: '${{price}}/mois',
    private_region_title: 'Instance cloud privée ({{regionName}})',
    shared_cross_tenants: 'Entre locataires',
  },
};

export default Object.freeze(enterprise_subscription);
