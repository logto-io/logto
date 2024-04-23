const paywall = {
  applications:
    "Limite de {{count, number}} application de <planName/> atteinte. Mettez à niveau le plan pour répondre aux besoins de votre équipe. Pour toute assistance, n'hésitez pas à <a>nous contacter</a>.",
  applications_other:
    "Limite de {{count, number}} applications de <planName/> atteinte. Mettez à niveau le plan pour répondre aux besoins de votre équipe. Pour toute assistance, n'hésitez pas à <a>nous contacter</a>.",
  machine_to_machine_feature:
    'Passez au plan <strong>Pro</strong> pour obtenir des applications machine à machine supplémentaires et profiter de toutes les fonctionnalités premium. <a>Contactez-nous</a> si vous avez des questions.',
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
    "Débloquez la fonctionnalité de domaine personnalisé en mettant à niveau vers les plans <strong>Hobby</strong> ou <strong>Pro</strong>. N'hésitez pas à <a>nous contacter</a> si vous avez besoin d'assistance.",
  social_connectors:
    "Vous avez atteint la limite de {{count, number}} connecteur social de <planName/>. Pour répondre aux besoins de votre équipe, passez à un plan supérieur pour obtenir des connecteurs sociaux supplémentaires et la possibilité de créer vos propres connecteurs en utilisant les protocoles OIDC, OAuth 2.0 et SAML. N’hésitez pas à <a>nous contacter</a> si vous avez besoin d'aide.",
  social_connectors_other:
    "Vous avez atteint la limite de {{count, number}} connecteurs sociaux de <planName/>. Pour répondre aux besoins de votre équipe, passez à un plan supérieur pour obtenir des connecteurs sociaux supplémentaires et la possibilité de créer vos propres connecteurs en utilisant les protocoles OIDC, OAuth 2.0 et SAML. N’hésitez pas à <a>nous contacter</a> si vous avez besoin d'aide.",
  standard_connectors_feature:
    "Mettez à niveau vers les plans <strong>Hobby</strong> ou <strong>Pro</strong> pour créer vos propres connecteurs en utilisant les protocoles OIDC, OAuth 2.0 et SAML\uFF0C plus des connecteurs sociaux illimités et toutes les fonctionnalités premium. N’hésitez pas à <a>nous contacter</a> si vous avez besoin d'aide.",
  standard_connectors:
    "Vous avez atteint la limite de {{count, number}} connecteur social de <planName/>.\u3000Pour répondre aux besoins de votre équipe\uFF0C passez à un plan supérieur pour obtenir des connecteurs sociaux supplémentaires et la possibilité de créer vos propres connecteurs en utilisant les protocoles OIDC\uFF0C OAuth 2.0 et SAML\u3002\u3000N’hésitez pas à <a>nous contacter</a> si vous avez besoin d'aide\u3002",
  standard_connectors_other:
    "Vous avez atteint la limite de {{count, number}} connecteurs sociaux de <planName/>.\u3000Pour répondre aux besoins de votre équipe\uFF0C passez à un plan supérieur pour obtenir des connecteurs sociaux supplémentaires et la possibilité de créer vos propres connecteurs en utilisant les protocoles OIDC\uFF0C OAuth 2.0 et SAML\u3002\u3000N’hésitez pas à <a>nous contacter</a> si vous avez besoin d'aide\u3002",
  standard_connectors_pro:
    "Vous avez atteint la limite de {{count, number}} connecteur standard de <planName/>.\u3000Pour répondre aux besoins de votre équipe\uFF0C passez au plan Entreprise pour obtenir des connecteurs sociaux supplémentaires et la possibilité de créer vos propres connecteurs en utilisant les protocoles OIDC\uFF0C OAuth 2.0 et SAML\u3002\u3000N’hésitez pas à <a>nous contacter</a> si vous avez besoin d'aide\u3002",
  standard_connectors_pro_other:
    "Vous avez atteint la limite de {{count, number}} connecteurs standard de <planName/>.\u3000Pour répondre aux besoins de votre équipe\uFF0C passez au plan Entreprise pour obtenir des connecteurs sociaux supplémentaires et la possibilité de créer vos propres connecteurs en utilisant les protocoles OIDC\uFF0C OAuth 2.0 et SAML\u3002\u3000N’hésitez pas à <a>nous contacter</a> si vous avez besoin d'aide\u3002",
  roles:
    "Vous avez atteint la limite de {{count, number}} rôle de <planName/>.\u3000Mettez à niveau votre plan pour ajouter des rôles et des permissions supplémentaires\u3002\u3000N’hésitez pas à <a>nous contacter</a> si vous avez besoin d'aide\u3002",
  roles_other:
    "Vous avez atteint la limite de {{count, number}} rôles de <planName/>.\u3000Mettez à niveau votre plan pour ajouter des rôles et des permissions supplémentaires\u3002\u3000N’hésitez pas à <a>nous contacter</a> si vous avez besoin d'aide\u3002",
  machine_to_machine_roles:
    "{{count, number}} rôle machine à machine de <planName/> atteint la limite.\u3000Mettez à niveau le plan pour ajouter des rôles et des permissions supplémentaires\u3002\u3000N’hésitez pas à <a>nous contacter</a> si vous avez besoin d'aide\u3002",
  machine_to_machine_roles_other:
    "{{count, number}} rôles machine à machine de <planName/> atteints la limite.\u3000Mettez à niveau le plan pour ajouter des rôles et des permissions supplémentaires\u3002\u3000N’hésitez pas à <a>nous contacter</a> si vous avez besoin d'aide\u3002",
  scopes_per_role:
    'Vous avez atteint la limite de {{count, number}} permission par rôle de <planName/>.\u3000Mettez à niveau votre plan pour ajouter des rôles et des permissions supplémentaires\u3002\u3000Pour toute assistance\uFF0C n’hésitez pas à <a>nous contacter</a>.',
  scopes_per_role_other:
    'Vous avez atteint la limite de {{count, number}} permissions par rôle de <planName/>.\u3000Mettez à niveau votre plan pour ajouter des rôles et des permissions supplémentaires\u3002\u3000Pour toute assistance\uFF0C n’hésitez pas à <a>nous contacter</a>.',
  hooks:
    "Vous avez atteint la limite de {{count, number}} webhook de <planName/>.\u3000Mettez à niveau votre plan pour créer plus de webhooks\u3002\u3000N’hésitez pas à <a>nous contacter</a> si vous avez besoin d'aide\u3002",
  hooks_other:
    "Vous avez atteint la limite de {{count, number}} webhooks de <planName/>.\u3000Mettez à niveau votre plan pour créer plus de webhooks\u3002\u3000N'hésitez pas à <a>nous contacter</a> si vous avez besoin d'aide\u3002",
  mfa: "Déverrouillez MFA pour vérifier la sécurité en passant à un plan payant.\u3000N'hésitez pas à <a>nous contacter</a> si vous avez besoin d'aide\u3002",
  organizations:
    "Débloquez les organisations en passant à un plan payant.\u3000N’hésitez pas à <a>nous contacter</a> si vous avez besoin d'aide\u3002",
  third_party_apps:
    'Unlock Logto as IdP for third-party apps by upgrading to a paid plan.\u3000For any assistance\uFF0C feel free to <a>contact us</a>.',
  sso_connectors:
    'Unlock enterprise sso by upgrading to a paid plan.\u3000For any assistance\uFF0C feel free to <a>contact us</a>.',
  tenant_members:
    'Unlock collaboration feature by upgrading to a paid plan.\u3000For any assistance\uFF0C feel free to <a>contact us</a>.',
  tenant_members_dev_plan:
    "You've reached your {{limit}}-member limit. Release a member or revoke a pending invitation to add someone new. Need more seats? Feel free to contact us.",
  custom_jwt: {
    title: 'Add custom claims',
    description:
      "Upgrade to a paid plan for custom JWT functionality and premium benefits.\u3000Don't hesitate to <a>contact us</a> if you have any questions.",
  },
};

export default Object.freeze(paywall);
