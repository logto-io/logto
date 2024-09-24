const usage = {
  /** UNTRANSLATED */
  status_active: 'In use',
  /** UNTRANSLATED */
  status_inactive: 'Not in use',
  mau: {
    title: 'MAU',
    description: '{{usage}}',
    tooltip:
      'Ein MAU ist ein eindeutiger Nutzer, der innerhalb eines Abrechnungszyklus mindestens ein Token mit Logto ausgetauscht hat. Unbegrenzt für den Pro-Plan. <a>Erfahre mehr</a>',
  },
  organizations: {
    title: 'Organisationen',
    description: '{{usage}}',
    tooltip:
      'Zusatzfeature mit einem Festpreis von ${{price, number}} pro Monat. Der Preis wird nicht von der Anzahl der Organisationen oder ihrem Aktivitätsniveau beeinflusst.',
  },
  mfa: {
    title: 'MFA',
    description: '{{usage}}',
    tooltip:
      'Zusatzfeature mit einem Festpreis von ${{price, number}} pro Monat. Der Preis wird nicht von der Anzahl der genutzten Authentifizierungsfaktoren beeinflusst.',
  },
  enterprise_sso: {
    title: 'Enterprise SSO',
    description: '{{usage}}',
    tooltip: 'Zusatzfeature mit einem Preis von ${{price, number}} pro SSO-Verbindung pro Monat.',
  },
  api_resources: {
    title: 'API-Ressourcen',
    description: '{{usage}} <span>(Kostenlos für die ersten 3)</span>',
    tooltip:
      'Zusatzfeature zu einem Preis von ${{price, number}} pro Ressource pro Monat. Die ersten 3 API-Ressourcen sind kostenlos.',
  },
  machine_to_machine: {
    title: 'Machine-to-Machine',
    description: '{{usage}} <span>(Kostenlos für die erste)</span>',
    tooltip:
      'Zusatzfeature zu einem Preis von ${{price, number}} pro App pro Monat. Die erste Machine-to-Machine-App ist kostenlos.',
  },
  tenant_members: {
    title: 'Tenant-Mitglieder',
    description: '{{usage}} <span>(Kostenlos für die ersten 3)</span>',
    tooltip:
      'Zusatzfeature zu einem Preis von ${{price, number}} pro Mitglied pro Monat. Die ersten 3 Tenant-Mitglieder sind kostenlos.',
  },
  tokens: {
    title: 'Tokens',
    description: '{{usage}}',
    tooltip:
      'Zusatzfeature zu einem Preis von ${{price, number}} pro Million Tokens. Die ersten 1 Million Tokens sind inklusive.',
  },
  hooks: {
    title: 'Hooks',
    description: '{{usage}} <span>(Kostenlos für die ersten 10)</span>',
    tooltip:
      'Zusatzfeature zu einem Preis von ${{price, number}} pro Hook. Die ersten 10 Hooks sind inklusive.',
  },
  pricing: {
    add_on_changes_in_current_cycle_notice:
      'Wenn du während des aktuellen Abrechnungszyklus Änderungen vornimmst, kann deine nächste Rechnung im ersten Monat nach der Änderung leicht höher ausfallen. Es wird ein Basispreis von ${{price, number}} plus Zusatzkosten für unberechnete Nutzung aus dem aktuellen Zyklus und die volle Gebühr für den nächsten Zyklus berechnet. <a>Erfahre mehr</a>',
  },
};

export default Object.freeze(usage);
