import quota_item from './quota-item.js';
import quota_table from './quota-table.js';
import usage from './usage.js';

const subscription = {
  free_plan: 'Plan Gratuit',
  free_plan_description:
    'Pour les projets secondaires et les premiers essais de Logto. Aucune carte de crédit.',
  pro_plan: 'Plan Professionnel',
  pro_plan_description: 'Pour les entreprises qui bénéficient de Logto sans soucis.',
  enterprise: 'Plan Entreprise',
  /** UNTRANSLATED */
  enterprise_description: 'For large teams and businesses with enterprise-grade requirements.',
  admin_plan: 'Plan Admin',
  dev_plan: 'Plan Développement',
  current_plan: 'Plan Actuel',
  current_plan_description:
    "Voici votre plan actuel. Vous pouvez facilement consulter l'utilisation de votre plan, vérifier votre prochaine facture et apporter des modifications à votre plan si nécessaire.",
  plan_usage: 'Utilisation du plan',
  plan_cycle: "Cycle du plan: {{period}}. L'utilisation est renouvelée le {{renewDate}}.",
  next_bill: 'Votre prochaine facture',
  next_bill_hint: 'Pour en savoir plus sur le calcul, veuillez vous référer à cet <a>article</a>.',
  next_bill_tip:
    'Les prix affichés ici sont hors taxes et peuvent être soumis à un léger délai de mise à jour. Le montant des taxes sera calculé en fonction des informations que vous fournissez et des exigences réglementaires locales, et sera indiqué sur vos factures.',
  manage_payment: 'Gérer le Paiement',
  overfill_quota_warning:
    'Vous avez atteint votre limite de quota. Pour éviter tout problème, passez à un plan supérieur.',
  upgrade_pro: 'Passer au Plan Professionnel',
  update_payment: 'Mettre à jour le paiement',
  payment_error:
    'Problème de paiement détecté. Impossible de traiter ${{price, number}} pour le cycle précédent. Mettez à jour le paiement pour éviter la suspension du service Logto.',
  downgrade: 'Passer à un Plan Inférieur',
  current: 'Actuel',
  upgrade: 'Mettre à niveau',
  quota_table,
  billing_history: {
    invoice_column: 'Factures',
    status_column: 'Statut',
    amount_column: 'Montant',
    invoice_created_date_column: 'Date de création de la facture',
    invoice_status: {
      void: 'Annulée',
      paid: 'Payée',
      open: 'Ouverte',
      uncollectible: 'En souffrance',
    },
  },
  quota_item,
  downgrade_modal: {
    title: 'Êtes-vous sûr de vouloir passer à un Plan Inférieur?',
    description:
      "Si vous choisissez de passer au <targetName/> , notez que vous n'aurez plus accès aux quotas et fonctionnalités qui se trouvaient auparavant dans <currentName/>. ",
    before: 'Avant: <name/>',
    after: 'Après: <name />',
    downgrade: 'Passer à un Plan Inférieur',
  },
  not_eligible_modal: {
    downgrade_title: "Vous n'êtes pas éligible pour une rétrogradation",
    downgrade_description:
      'Assurez-vous de remplir les critères suivants avant de rétrograder vers le plan <name/>.',
    downgrade_help_tip: "Besoin d'aide pour rétrograder ? <a>Contactez-nous</a>.",
    upgrade_title: 'Rappel amical pour nos précieux early adopters',
    upgrade_description:
      'Vous utilisez actuellement plus que ce que <name /> autorise. Logto est désormais officiel, avec des fonctionnalités adaptées à chaque plan. Avant de envisager une mise à niveau vers <name />, assurez-vous de remplir les critères suivants avant de faire la mise à niveau.',
    upgrade_pro_tip: ' Ou envisagez de passer au Plan Pro.',
    upgrade_help_tip: "Besoin d'aide pour la mise à niveau ? <a>Contactez-nous</a>.",
    a_maximum_of: 'Un maximum de <item/>',
  },
  upgrade_success: 'Passé avec succès à <name/>',
  downgrade_success: 'Rétrogradé avec succès à <name/>',
  subscription_check_timeout:
    "La vérification d'abonnement a expiré. Veuillez actualiser ultérieurement.",
  no_subscription: 'Aucun abonnement',
  usage,
};

export default Object.freeze(subscription);
