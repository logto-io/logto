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
  user_subscriptions: {
    description:
      'Consultez vos abonnements personnels et votre couverture Enterprise contractuelle, quel que soit le tenant sélectionné.',
    personal_title: 'Abonnements personnels',
    personal_description: 'Abonnements facturés à votre compte, y compris les abonnements passés.',
    price: 'Prix',
    billing_period: 'Période de facturation',
    list_price_note:
      'Les prix excluent les taxes et les remises. Les modifications sont calculées au prorata sur votre prochaine facture.',
    overdue_note:
      'Le paiement est en retard. S’il reste impayé, l’abonnement peut être suspendu et ses fonctionnalités payantes supprimées.',
    cancel_on: 'Annulation prévue le {{date}}',
    other_product: 'Autre abonnement',
    enterprise_invoices_description:
      "Factures de votre contrat Enterprise. Sélectionnez une facture pour l'afficher et télécharger la facture ou le reçu.",
    personal_invoices_description:
      "Factures des abonnements facturés à votre compte, y compris les abonnements passés. Sélectionnez une facture pour l'afficher et télécharger la facture ou le reçu.",
    credit_note:
      'Les crédits issus de suppressions ou de proratisations réduisent les factures suivantes et ne sont pas nécessairement remboursés immédiatement sur votre moyen de paiement.',
    invoice_link_unavailable:
      "La page de cette facture n'est pas disponible. Contactez-nous si vous avez besoin d'une copie.",
    status: {
      active: 'Actif',
      trialing: 'En essai',
      past_due: 'En retard',
      unpaid: 'Impayé',
      canceled: 'Annulé',
      incomplete: 'Incomplet',
      incomplete_expired: 'Expiré',
      paused: 'En pause',
    },
  },
};

export default Object.freeze(enterprise_subscription);
