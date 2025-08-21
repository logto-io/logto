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
    "Mettez à niveau vers les plans <strong>Hobby</strong> ou <strong>Pro</strong> pour créer vos propres connecteurs en utilisant les protocoles OIDC, OAuth 2.0 et SAML, plus des connecteurs sociaux illimités et toutes les fonctionnalités premium. N’hésitez pas à <a>nous contacter</a> si vous avez besoin d'aide.",
  standard_connectors:
    "Vous avez atteint la limite de {{count, number}} connecteur social de <planName/>. Pour répondre aux besoins de votre équipe, passez à un plan supérieur pour obtenir des connecteurs sociaux supplémentaires et la possibilité de créer vos propres connecteurs en utilisant les protocoles OIDC, OAuth 2.0 et SAML. N’hésitez pas à <a>nous contacter</a> si vous avez besoin d'aide.",
  standard_connectors_other:
    "Vous avez atteint la limite de {{count, number}} connecteurs sociaux de <planName/>. Pour répondre aux besoins de votre équipe, passez à un plan supérieur pour obtenir des connecteurs sociaux supplémentaires et la possibilité de créer vos propres connecteurs en utilisant les protocoles OIDC, OAuth 2.0 et SAML. N’hésitez pas à <a>nous contacter</a> si vous avez besoin d'aide.",
  standard_connectors_pro:
    "Vous avez atteint la limite de {{count, number}} connecteur standard de <planName/>. Pour répondre aux besoins de votre équipe, passez au plan Entreprise pour obtenir des connecteurs sociaux supplémentaires et la possibilité de créer vos propres connecteurs en utilisant les protocoles OIDC, OAuth 2.0 et SAML. N’hésitez pas à <a>nous contacter</a> si vous avez besoin d'aide.",
  standard_connectors_pro_other:
    "Vous avez atteint la limite de {{count, number}} connecteurs standard de <planName/>. Pour répondre aux besoins de votre équipe, passez au plan Entreprise pour obtenir des connecteurs sociaux supplémentaires et la possibilité de créer vos propres connecteurs en utilisant les protocoles OIDC, OAuth 2.0 et SAML. N’hésitez pas à <a>nous contacter</a> si vous avez besoin d'aide.",
  roles:
    "Mettez à niveau votre plan pour ajouter des rôles et des permissions supplémentaires. N'hésitez pas à <a>nous contacter</a> si vous avez besoin d'assistance.",
  scopes_per_role:
    'Vous avez atteint la limite de {{count, number}} permission par rôle de <planName/>. Mettez à niveau votre plan pour ajouter des rôles et des permissions supplémentaires. Pour toute assistance, n’hésitez pas à <a>nous contacter</a>.',
  scopes_per_role_other:
    'Vous avez atteint la limite de {{count, number}} permissions par rôle de <planName/>. Mettez à niveau votre plan pour ajouter des rôles et des permissions supplémentaires. Pour toute assistance, n’hésitez pas à <a>nous contacter</a>.',
  saml_applications_oss:
    "L'application SAML supplémentaire est disponible avec le plan Logto Enterprise. Contactez-nous si vous avez besoin d'assistance.",
  logto_pricing_button_text: 'Tarification Logto Cloud',
  saml_applications:
    "L'application SAML supplémentaire est disponible avec le plan Logto Enterprise. Contactez-nous si vous avez besoin d'assistance.",
  saml_applications_add_on:
    "Débloquez la fonctionnalité des applications SAML en passant à un plan payant. Pour toute assistance, n'hésitez pas à <a>nous contacter</a>.",
  hooks:
    "Vous avez atteint la limite de {{count, number}} webhook de <planName/>. Mettez à niveau votre plan pour créer plus de webhooks. N’hésitez pas à <a>nous contacter</a> si vous avez besoin d'aide.",
  hooks_other:
    "Vous avez atteint la limite de {{count, number}} webhooks de <planName/>. Mettez à niveau votre plan pour créer plus de webhooks. N'hésitez pas à <a>nous contacter</a> si vous avez besoin d'aide.",
  mfa: "Déverrouillez MFA pour vérifier la sécurité en passant à un plan payant. N'hésitez pas à <a>nous contacter</a> si vous avez besoin d'aide.",
  organizations:
    "Débloquez les organisations en passant à un plan payant. N’hésitez pas à <a>nous contacter</a> si vous avez besoin d'aide.",
  third_party_apps:
    "Débloquez Logto en tant qu'IdP pour les applications tierces en passant à un plan payant. Pour toute assistance, n'hésitez pas à <a>nous contacter</a>.",
  sso_connectors:
    "Débloquez le SSO d'entreprise en passant à un plan payant. Pour toute assistance, n'hésitez pas à <a>nous contacter</a>.",
  tenant_members:
    "Débloquez la fonctionnalité de collaboration en passant à un plan payant. Pour toute assistance, n'hésitez pas à <a>nous contacter</a>.",
  tenant_members_dev_plan:
    "Vous avez atteint votre limite de {{limit}} membres. Libérez un membre ou révoquez une invitation en attente pour en ajouter un nouveau. Besoin de plus de places? N'hésitez pas à nous contacter.",
  custom_jwt: {
    title: 'Ajouter des revendications personnalisées',
    description:
      "Passez à un plan payant pour obtenir la fonctionnalité JWT personnalisée et des avantages premium. N'hésitez pas à <a>nous contacter</a> si vous avez des questions.",
  },
  bring_your_ui:
    "Passez à un plan payant pour obtenir des fonctionnalités de personnalisation de l'interface utilisateur ainsi que des avantages premium.",
  security_features:
    "Débloquez des fonctionnalités de sécurité avancées en passant au plan Pro. N'hésitez pas à <a>nous contacter</a> si vous avez des questions.",
  collect_user_profile:
    "Passez à un plan payant pour collecter des informations supplémentaires de profil utilisateur lors de l'inscription. N'hésitez pas à <a>nous contacter</a> si vous avez des questions.",
};

export default Object.freeze(paywall);
