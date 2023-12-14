const paywall = {
  applications:
    "Limite de {{count, number}} application de <planName/> atteinte. Mettez à niveau le plan pour répondre aux besoins de votre équipe. Pour toute assistance, n'hésitez pas à <a>nous contacter</a>.",
  applications_other:
    "Limite de {{count, number}} applications de <planName/> atteinte. Mettez à niveau le plan pour répondre aux besoins de votre équipe. Pour toute assistance, n'hésitez pas à <a>nous contacter</a>.",
  deprecated_machine_to_machine_feature:
    "Mettez à niveau vers le plan <strong>Hobby</strong> pour débloquer 1 application machine à machine, ou choisissez le plan <strong>Pro</strong> pour une utilisation illimitée. Pour toute assistance, n'hésitez pas à <a>nous contacter</a>.",
  /** UNTRANSLATED */
  machine_to_machine_feature:
    'Switch to the <strong>Pro</strong> plan to gain extra machine-to-machine applications and enjoy all premium features. <a>Contact us</a> if you have questions.',
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
    "Vous avez atteint la limite de {{count, number}} rôle de <planName/>. Mettez à niveau votre plan pour ajouter des rôles et des permissions supplémentaires. N’hésitez pas à <a>nous contacter</a> si vous avez besoin d'aide.",
  roles_other:
    "Vous avez atteint la limite de {{count, number}} rôles de <planName/>. Mettez à niveau votre plan pour ajouter des rôles et des permissions supplémentaires. N’hésitez pas à <a>nous contacter</a> si vous avez besoin d'aide.",
  scopes_per_role:
    'Vous avez atteint la limite de {{count, number}} permission par rôle de <planName/>. Mettez à niveau votre plan pour ajouter des rôles et des permissions supplémentaires. Pour toute assistance, n’hésitez pas à <a>nous contacter</a>.',
  scopes_per_role_other:
    'Vous avez atteint la limite de {{count, number}} permissions par rôle de <planName/>. Mettez à niveau votre plan pour ajouter des rôles et des permissions supplémentaires. Pour toute assistance, n’hésitez pas à <a>nous contacter</a>.',
  hooks:
    "Vous avez atteint la limite de {{count, number}} webhook de <planName/>. Mettez à niveau votre plan pour créer plus de webhooks. N’hésitez pas à <a>nous contacter</a> si vous avez besoin d'aide.",
  hooks_other:
    "Vous avez atteint la limite de {{count, number}} webhooks de <planName/>. Mettez à niveau votre plan pour créer plus de webhooks. N'hésitez pas à <a>nous contacter</a> si vous avez besoin d'aide.",
  mfa: "Déverrouillez MFA pour vérifier la sécurité en passant à un plan payant. N'hésitez pas à <a>nous contacter</a> si vous avez besoin d'aide.",
  /** UNTRANSLATED */
  organizations:
    'Unlock organizations by upgrading to a paid plan. Don’t hesitate to <a>contact us</a> if you need any assistance.',
};

export default Object.freeze(paywall);
