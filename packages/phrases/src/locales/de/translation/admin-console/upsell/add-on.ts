const add_on = {
  mfa_inline_notification:
    'MFA ist ein Add-on für ${{price, number}} pro Monat für den {{planName}}. Der erste Monat wird anteilig basierend auf deinem Abrechnungszyklus berechnet. <a>Erfahre mehr</a>',
  security_features_inline_notification:
    'Aktiviere CAPTCHA, individuelle Sperrerfahrung und andere erweiterte Sicherheitsfunktionen - alles in einem Add-on-Paket für nur ${{price, number}}/Monat enthalten.',
  footer: {
    api_resource:
      'Zusätzliche Ressourcen kosten <span>${{price, number}} pro Monat / Stück</span>. Der erste Monat wird anteilig basierend auf deinem Abrechnungszyklus berechnet. <a>Erfahre mehr</a>',
    machine_to_machine_app:
      'Zusätzliche Maschine-zu-Maschine-Apps kosten <span>${{price, number}} pro Monat / Stück</span>. Der erste Monat wird anteilig basierend auf deinem Abrechnungszyklus berechnet. <a>Erfahre mehr</a>',
    enterprise_sso:
      'Enterprise SSO ist ein Add-on für <span>${{price, number}} pro Monat / Stück</span> für {{planName}}. Der erste Monat wird anteilig basierend auf deinem Abrechnungszyklus berechnet. <a>Erfahre mehr</a>',
    tenant_members:
      'Zusätzliche Mitglieder kosten <span>${{price, number}} pro Monat / Stück</span>. Der erste Monat wird anteilig basierend auf deinem Abrechnungszyklus berechnet. <a>Erfahre mehr</a>',
    organization:
      'Organisation ist ein Add-on für <span>${{price, number}} pro Monat</span> für {{planName}} mit unbegrenzten Organisationen. Der erste Monat wird anteilig basierend auf deinem Abrechnungszyklus berechnet. <a>Erfahre mehr</a>',
    /** UNTRANSLATED */
    saml_apps:
      'Additional SAML apps cost <span>${{price, number}} per mo / ea</span>. First month prorated based on your billing cycle. <a>Learn more</a>',
    /** UNTRANSLATED */
    third_party_apps:
      'Additional third-party apps cost <span>${{price, number}} per mo / ea</span>. First month prorated based on your billing cycle. <a>Learn more</a>',
  },
};

export default Object.freeze(add_on);
