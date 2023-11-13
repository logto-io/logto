const paywall = {
  applications:
    "Limite de {{count, number}} application de <planName/> atteinte. Mettez à niveau le plan pour répondre aux besoins de votre équipe. Pour toute assistance, n'hésitez pas à <a>nous contacter</a>.",
  applications_other:
    "Limite de {{count, number}} applications de <planName/> atteinte. Mettez à niveau le plan pour répondre aux besoins de votre équipe. Pour toute assistance, n'hésitez pas à <a>nous contacter</a>.",
  /** UNTRANSLATED */
  machine_to_machine_feature:
    'Upgrade to the <strong>Hobby</strong> plan to unlock 1 machine-to-machine application, or choose the <strong>Pro</strong> plan for unlimited usage. For any assistance, feel free to <a>contact us</a>.',
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
  /** UNTRANSLATED */
  custom_domain:
    'Unlock custom domain functionality by upgrading to <strong>Hobby</strong> or <strong>Pro</strong> plan. Don’t hesitate to <a>contact us</a> if you need any assistance.',
  social_connectors:
    "Vous avez atteint la limite de {{count, number}} connecteur social de <planName/>. Pour répondre aux besoins de votre équipe, passez à un plan supérieur pour obtenir des connecteurs sociaux supplémentaires et la possibilité de créer vos propres connecteurs en utilisant les protocoles OIDC, OAuth 2.0 et SAML. N'hésitez pas à <a>nous contacter</a> si vous avez besoin d'aide.",
  social_connectors_other:
    "Vous avez atteint la limite de {{count, number}} connecteurs sociaux de <planName/>. Pour répondre aux besoins de votre équipe, passez à un plan supérieur pour obtenir des connecteurs sociaux supplémentaires et la possibilité de créer vos propres connecteurs en utilisant les protocoles OIDC, OAuth 2.0 et SAML. N'hésitez pas à <a>nous contacter</a> si vous avez besoin d'aide.",
  /** UNTRANSLATED */
  standard_connectors_feature:
    'Upgrade to the <strong>Hobby</strong> or <strong>Pro</strong> plan to create your own connectors using OIDC, OAuth 2.0, and SAML protocols, plus unlimited social connectors and all the premium features. Feel free to <a>contact us</a> if you need any assistance.',
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
};

export default Object.freeze(paywall);
