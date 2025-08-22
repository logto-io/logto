const add_on = {
  mfa_inline_notification:
    'MFA is a ${{price, number}} per mo add-on for the {{planName}}. First month prorated based on your billing cycle. <a>Learn more</a>',
  security_features_inline_notification:
    'Enable CAPTCHA, custom lockout experience, and other advanced security features—all included in an add-on bundle for just ${{price, number}}/month.',
  footer: {
    api_resource:
      'Additional resources cost <span>${{price, number}} per mo / ea</span>. First month prorated based on your billing cycle. <a>Learn more</a>',
    machine_to_machine_app:
      'Additional machine-to-machine apps cost <span>${{price, number}} per mo / ea</span>. First month prorated based on your billing cycle. <a>Learn more</a>',
    enterprise_sso:
      'Enterprise SSO cost <span>${{price, number}} per mo / ea</span> add-on for {{planName}}. First month prorated based on your billing cycle. <a>Learn more</a>',
    tenant_members:
      'Additional members cost <span>${{price, number}} per mo / ea</span>. First month prorated based on your billing cycle. <a>Learn more</a>',
    organization:
      'Organization is a <span>${{price, number}} per mo</span> add-on for {{planName}} with unlimited organizations. First month prorated based on your billing cycle. <a>Learn more</a>',
    saml_apps:
      'Additional SAML apps cost <span>${{price, number}} per mo / ea</span>. First month prorated based on your billing cycle. <a>Learn more</a>',
    third_party_apps:
      'Additional third-party apps cost <span>${{price, number}} per mo / ea</span>. First month prorated based on your billing cycle. <a>Learn more</a>',
    roles:
      'Role-based access control is a <span>${{price, number}} per mo</span> add-on for Pro plan with unlimited roles. First month prorated based on your billing cycle. <a>Learn more</a>',
  },
};

export default Object.freeze(add_on);
