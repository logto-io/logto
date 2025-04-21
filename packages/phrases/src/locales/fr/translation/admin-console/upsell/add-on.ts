const add_on = {
  mfa_inline_notification:
    "L'authentification multifacteur (MFA) est un complément à ${{price, number}} par mois pour le {{planName}}. Le premier mois est calculé au prorata en fonction de votre cycle de facturation. <a>En savoir plus</a>",
  /** UNTRANSLATED */
  security_features_inline_notification:
    'Enable CAPTCHA, custom lockout experience, and other advanced security features—all included in an add-on bundle for just ${{price, number}}/month.',
  footer: {
    api_resource:
      'Les ressources supplémentaires coûtent <span>${{price, number}} par mois / chacune</span>. Le premier mois est calculé au prorata en fonction de votre cycle de facturation. <a>En savoir plus</a>',
    machine_to_machine_app:
      'Les applications machine-à-machine supplémentaires coûtent <span>${{price, number}} par mois / chacune</span>. Le premier mois est calculé au prorata en fonction de votre cycle de facturation. <a>En savoir plus</a>',
    enterprise_sso:
      "Le SSO d'entreprise coûte <span>${{price, number}} par mois / chacune</span> en option pour {{planName}}. Le premier mois est calculé au prorata en fonction de votre cycle de facturation. <a>En savoir plus</a>",
    tenant_members:
      'Les membres supplémentaires coûtent <span>${{price, number}} par mois / chacun</span>. Le premier mois est calculé au prorata en fonction de votre cycle de facturation. <a>En savoir plus</a>',
    organization:
      "L'organisation est un complément à <span>${{price, number}} par mois</span> pour {{planName}} avec les organisations illimitées. Le premier mois est calculé au prorata en fonction de votre cycle de facturation. <a>En savoir plus</a>",
  },
};

export default Object.freeze(add_on);
