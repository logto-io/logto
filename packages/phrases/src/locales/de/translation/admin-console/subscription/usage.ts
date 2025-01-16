const usage = {
  /** UNTRANSLATED */
  status_active: 'In use',
  /** UNTRANSLATED */
  status_inactive: 'Not in use',
  /** UNTRANSLATED */
  limited_status_quota_description: '(First {{quota}} included)',
  /** UNTRANSLATED */
  unlimited_status_quota_description: '(Included)',
  /** UNTRANSLATED */
  disabled_status_quota_description: '(Not included)',
  /** UNTRANSLATED */
  usage_description_with_unlimited_quota: '{{usage}}<span> (Unlimited)</span>',
  /** UNTRANSLATED */
  usage_description_with_limited_quota: '{{usage}}<span> (First {{basicQuota}} included)</span>',
  /** UNTRANSLATED */
  usage_description_without_quota: '{{usage}}<span> (Not included)</span>',
  mau: {
    title: 'MAU',
    tooltip:
      'Ein MAU ist ein eindeutiger Nutzer, der innerhalb eines Abrechnungszyklus mindestens ein Token mit Logto ausgetauscht hat. Unbegrenzt für den Pro-Plan. <a>Erfahre mehr</a>',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'A MAU is a unique user who has exchanged at least one token with Logto within a billing cycle. Unlimited for the Enterprise Plan.',
  },
  organizations: {
    title: 'Organisationen',
    tooltip:
      'Zusatzfeature mit einem Festpreis von ${{price, number}} pro Monat. Der Preis wird nicht von der Anzahl der Organisationen oder ihrem Aktivitätsniveau beeinflusst.',
    /** UNTRANSLATED */
    description_for_enterprise: '(Included)',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'Inclusion depends on your plan. If the organization feature isn’t in your initial contract, it will be added to your bill when you activate it. The add-on costs ${{price, number}}/month, regardless of the number of organizations or their activity.',
    /** UNTRANSLATED */
    tooltip_for_enterprise_with_numbered_basic_quota:
      'Your plan includes the first {{basicQuota}} organizations for free. If you need more, you can add them with the organization add-on at a flat rate of ${{price, number}} per month, regardless of the number of organizations or their activity level.',
  },
  mfa: {
    title: 'MFA',
    tooltip:
      'Zusatzfeature mit einem Festpreis von ${{price, number}} pro Monat. Der Preis wird nicht von der Anzahl der genutzten Authentifizierungsfaktoren beeinflusst.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'Inclusion depends on your plan. If the MFA feature isn’t in your initial contract, it will be added to your bill when you activate it. The add-on costs ${{price, number}}/month, regardless of the number of authentication factors used.',
  },
  enterprise_sso: {
    title: 'Enterprise SSO',
    tooltip: 'Zusatzfeature mit einem Preis von ${{price, number}} pro SSO-Verbindung pro Monat.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'Add-on feature with a price of ${{price, number}} per SSO connection per month. The first {{basicQuota}} SSO are included and free to use in your contract-based plan.',
  },
  api_resources: {
    title: 'API-Ressourcen',
    tooltip:
      'Zusatzfeature zu einem Preis von ${{price, number}} pro Ressource pro Monat. Die ersten 3 API-Ressourcen sind kostenlos.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} API resources are included and free to use in your contract-based plan. If you need more, ${{price, number}} per API resource per month.',
  },
  machine_to_machine: {
    title: 'Machine-to-Machine',
    tooltip:
      'Zusatzfeature zu einem Preis von ${{price, number}} pro App pro Monat. Die erste Machine-to-Machine-App ist kostenlos.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} machine-to-machine app is free to use in your contract-based plan. If you need more, ${{price, number}} per app per month.',
  },
  tenant_members: {
    title: 'Tenant-Mitglieder',
    tooltip:
      'Zusatzfeature zu einem Preis von ${{price, number}} pro Mitglied pro Monat. Die ersten 3 Tenant-Mitglieder sind kostenlos.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} tenant members are included and free to use in your contract-based plan. If you need more, ${{price, number}} per tenant member per month.',
  },
  tokens: {
    title: 'Tokens',
    tooltip:
      'Zusatzfeature zu einem Preis von ${{price, number}} pro {{tokenLimit}} Tokens. Die ersten {{basicQuota}} Tokens sind inklusive.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} tokens is included and free to use in your contract-based plan. If you need more, ${{price, number}} per {{tokenLimit}} tokens per month.',
  },
  hooks: {
    title: 'Hooks',
    tooltip:
      'Zusatzfeature zu einem Preis von ${{price, number}} pro Hook. Die ersten 10 Hooks sind inklusive.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} hooks are included and free to use in your contract-based plan. If you need more, ${{price, number}} per hook per month.',
  },
  pricing: {
    add_on_changes_in_current_cycle_notice:
      'Wenn du während des aktuellen Abrechnungszyklus Änderungen vornimmst, kann deine nächste Rechnung im ersten Monat nach der Änderung leicht höher ausfallen. Es wird ein Basispreis von ${{price, number}} plus Zusatzkosten für unberechnete Nutzung aus dem aktuellen Zyklus und die volle Gebühr für den nächsten Zyklus berechnet. <a>Erfahre mehr</a>',
  },
};

export default Object.freeze(usage);
