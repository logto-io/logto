const upsell = {
  pro_tag: 'PRO',
  upgrade_plan: 'Mettre à niveau le plan',
  compare_plans: 'Comparer les plans',
  contact_us: 'Nous contacter',
  get_started: {
    title: "Commencez votre parcours d'identité fluide avec un plan gratuit!",
    description:
      "Le plan gratuit est parfait pour essayer Logto sur vos projets personnels ou vos essais. Pour tirer pleinement parti des fonctionnalités de Logto pour votre équipe, passez à un abonnement payant pour bénéficier d'un accès illimité aux fonctionnalités premium : utilisation illimitée des MAU, intégration machine à machine, gestion des RBAC, journaux d'audit à long terme, etc. <a>Voir tous les plans</a>",
  },
  create_tenant: {
    title: 'Sélectionnez votre plan pour le locataire',
    description:
      'Logto propose des options de plan compétitives avec une tarification innovante et abordable conçue pour les entreprises en croissance. <a>En savoir plus</a>',
    base_price: 'Prix de base',
    monthly_price: '{{value, number}}/mois',
    mau_unit_price: 'Prix unitaire MAU',
    view_all_features: 'Voir toutes les fonctionnalités',
    select_plan: 'Sélectionnez <name/>',
    upgrade_to: 'Mettre à niveau vers <name/>',
    free_tenants_limit: "Jusqu'à {{count, number}} locataire gratuit",
    free_tenants_limit_other: "Jusqu'à {{count, number}} locataires gratuits",
    most_popular: 'Le plus populaire',
    upgrade_success: 'Passage réussi à <name/>',
  },
  paywall: {
    applications:
      "Limite de {{count, number}} application de <planName/> atteinte. Mettez à niveau le plan pour répondre aux besoins de votre équipe. Pour toute assistance, n'hésitez pas à <a>nous contacter</a>.",
    applications_other:
      "Limite de {{count, number}} applications de <planName/> atteinte. Mettez à niveau le plan pour répondre aux besoins de votre équipe. Pour toute assistance, n'hésitez pas à <a>nous contacter</a>.",
    machine_to_machine_feature:
      "Passez à un abonnement payant pour créer des applications de machine à machine, ainsi que pour accéder à toutes les fonctionnalités premium. Pour toute assistance, n'hésitez pas à <a>nous contacter</a>.",
    machine_to_machine:
      "Limite de {{count, number}} application de machine à machine de <planName/> atteinte. Mettez à niveau le plan pour répondre aux besoins de votre équipe. Pour toute assistance, n'hésitez pas à <a>nous contacter</a>.",
    machine_to_machine_other:
      "Limite de {{count, number}} applications de machine à machine de <planName/> atteinte. Mettez à niveau le plan pour répondre aux besoins de votre équipe. Pour toute assistance, n'hésitez pas à <a>nous contacter</a>.",
    resources:
      'Vous avez atteint la limite de {{count, number}} ressource API de <planName/>. Mettez à niveau votre plan pour répondre aux besoins de votre équipe. <a>Contactez-nous</a> pour toute assistance.',
    resources_other:
      'Vous avez atteint la limite de {{count, number}} ressources API de <planName/>. Mettez à niveau votre plan pour répondre aux besoins de votre équipe. <a>Contactez-nous</a> pour toute assistance.',
    scopes_per_resource:
      'Vous avez atteint la limite de {{count, number}} permission par ressource API de <planName/>. Mettez à niveau maintenant pour étendre. <a>Contactez-nous</a> pour toute assistance.',
    scopes_per_resource_other:
      'Vous avez atteint la limite de {{count, number}} permissions par ressource API de <planName/>. Mettez à niveau maintenant pour étendre. <a>Contactez-nous</a> pour toute assistance.',
    custom_domain:
      "Déverrouillez la fonctionnalité de domaine personnalisé et une gamme d'avantages premium en passant à un plan payant. N'hésitez pas à <a>nous contacter</a> si vous avez besoin d'aide.",
    social_connectors:
      "Vous avez atteint la limite de {{count, number}} connecteur social de <planName/>. Pour répondre aux besoins de votre équipe, passez à un plan supérieur pour obtenir des connecteurs sociaux supplémentaires et la possibilité de créer vos propres connecteurs en utilisant les protocoles OIDC, OAuth 2.0 et SAML. N'hésitez pas à <a>nous contacter</a> si vous avez besoin d'aide.",
    social_connectors_other:
      "Vous avez atteint la limite de {{count, number}} connecteurs sociaux de <planName/>. Pour répondre aux besoins de votre équipe, passez à un plan supérieur pour obtenir des connecteurs sociaux supplémentaires et la possibilité de créer vos propres connecteurs en utilisant les protocoles OIDC, OAuth 2.0 et SAML. N'hésitez pas à <a>nous contacter</a> si vous avez besoin d'aide.",
    standard_connectors_feature:
      "Mettez à niveau vers un plan payant pour créer vos propres connecteurs en utilisant les protocoles OIDC, OAuth 2.0 et SAML, ainsi qu'un accès illimité aux connecteurs sociaux et à toutes les fonctionnalités premium. N'hésitez pas à <a>nous contacter</a> si vous avez besoin d'aide.",
    standard_connectors:
      "Vous avez atteint la limite de {{count, number}} connecteur social de <planName/>. Pour répondre aux besoins de votre équipe, passez à un plan supérieur pour obtenir des connecteurs sociaux supplémentaires et la possibilité de créer vos propres connecteurs en utilisant les protocoles OIDC, OAuth 2.0 et SAML. N'hésitez pas à <a>nous contacter</a> si vous avez besoin d'aide.",
    standard_connectors_other:
      "Vous avez atteint la limite de {{count, number}} connecteurs sociaux de <planName/>. Pour répondre aux besoins de votre équipe, passez à un plan supérieur pour obtenir des connecteurs sociaux supplémentaires et la possibilité de créer vos propres connecteurs en utilisant les protocoles OIDC, OAuth 2.0 et SAML. N'hésitez pas à <a>nous contacter</a> si vous avez besoin d'aide.",
    standard_connectors_pro:
      "Vous avez atteint la limite de {{count, number}} connecteur standard de <planName/>. Pour répondre aux besoins de votre équipe, passez au plan Entreprise pour obtenir des connecteurs sociaux supplémentaires et la possibilité de créer vos propres connecteurs en utilisant les protocoles OIDC, OAuth 2.0 et SAML. N'hésitez pas à <a>nous contacter</a> si vous avez besoin d'aide.",
    standard_connectors_pro_other:
      "Vous avez atteint la limite de {{count, number}} connecteurs standard de <planName/>. Pour répondre aux besoins de votre équipe, passez au plan Entreprise pour obtenir des connecteurs sociaux supplémentaires et la possibilité de créer vos propres connecteurs en utilisant les protocoles OIDC, OAuth 2.0 et SAML. N'hésitez pas à <a>nous contacter</a> si vous avez besoin d'aide.",
    roles:
      "Vous avez atteint la limite de {{count, number}} rôle de <planName/>. Mettez à niveau votre plan pour ajouter des rôles et des permissions supplémentaires. N'hésitez pas à <a>nous contacter</a> si vous avez besoin d'aide.",
    roles_other:
      "Vous avez atteint la limite de {{count, number}} rôles de <planName/>. Mettez à niveau votre plan pour ajouter des rôles et des permissions supplémentaires. N'hésitez pas à <a>nous contacter</a> si vous avez besoin d'aide.",
    scopes_per_role:
      "Vous avez atteint la limite de {{count, number}} permission par rôle de <planName/>. Mettez à niveau votre plan pour ajouter des rôles et des permissions supplémentaires. Pour toute assistance, n'hésitez pas à <a>nous contacter</a>.",
    scopes_per_role_other:
      "Vous avez atteint la limite de {{count, number}} permissions par rôle de <planName/>. Mettez à niveau votre plan pour ajouter des rôles et des permissions supplémentaires. Pour toute assistance, n'hésitez pas à <a>nous contacter</a>.",
    hooks:
      "Vous avez atteint la limite de {{count, number}} webhook de <planName/>. Mettez à niveau votre plan pour créer plus de webhooks. N'hésitez pas à <a>nous contacter</a> si vous avez besoin d'aide.",
    hooks_other:
      "Vous avez atteint la limite de {{count, number}} webhooks de <planName/>. Mettez à niveau votre plan pour créer plus de webhooks. N'hésitez pas à <a>nous contacter</a> si vous avez besoin d'aide.",
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
};

export default upsell;
