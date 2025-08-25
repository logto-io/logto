const usage = {
  status_active: 'In Verwendung',
  status_inactive: 'Nicht in Verwendung',
  limited_status_quota_description: '(Erste {{quota}} inklusive)',
  unlimited_status_quota_description: '(Inklusive)',
  disabled_status_quota_description: '(Nicht inklusive)',
  usage_description_with_unlimited_quota: '{{usage}}<span> (Unbegrenzt)</span>',
  usage_description_with_limited_quota: '{{usage}}<span> (Erste {{basicQuota}} inklusive)</span>',
  usage_description_without_quota: '{{usage}}<span> (Nicht inklusive)</span>',
  mau: {
    title: 'MAU',
    tooltip:
      'Ein MAU ist ein eindeutiger Nutzer, der innerhalb eines Abrechnungszyklus mindestens ein Token mit Logto ausgetauscht hat. Unbegrenzt für den Pro-Plan. <a>Erfahre mehr</a>',
    tooltip_for_enterprise:
      'Ein MAU ist ein eindeutiger Nutzer, der innerhalb eines Abrechnungszyklus mindestens ein Token mit Logto ausgetauscht hat. Unbegrenzt für den Enterprise-Plan.',
  },
  organizations: {
    title: 'Organisationen',
    tooltip:
      'Zusatzfeature mit einem Festpreis von ${{price, number}} pro Monat. Der Preis wird nicht von der Anzahl der Organisationen oder ihrem Aktivitätsniveau beeinflusst.',
    description_for_enterprise: '(Inklusive)',
    tooltip_for_enterprise:
      'Die Aufnahme hängt von deinem Plan ab. Wenn das Organisationsfeature nicht in deinem ursprünglichen Vertrag enthalten ist, wird es deiner Rechnung hinzugefügt, wenn du es aktivierst. Das Add-on kostet ${{price, number}}/Monat, unabhängig von der Anzahl der Organisationen oder ihrem Aktivitätsniveau.',
    tooltip_for_enterprise_with_numbered_basic_quota:
      'Dein Plan beinhaltet die ersten {{basicQuota}} Organisationen kostenlos. Wenn du mehr benötigst, kannst du sie mit dem Organisations-Add-on zu einem Festpreis von ${{price, number}} pro Monat hinzufügen, unabhängig von der Anzahl der Organisationen oder ihrem Aktivitätsniveau.',
  },
  mfa: {
    title: 'MFA',
    tooltip:
      'Zusatzfeature mit einem Festpreis von ${{price, number}} pro Monat. Der Preis wird nicht von der Anzahl der genutzten Authentifizierungsfaktoren beeinflusst.',
    tooltip_for_enterprise:
      'Die Aufnahme hängt von deinem Plan ab. Wenn das MFA-Feature nicht in deinem ursprünglichen Vertrag enthalten ist, wird es deiner Rechnung hinzugefügt, wenn du es aktivierst. Das Add-on kostet ${{price, number}}/Monat, unabhängig von der Anzahl der genutzten Authentifizierungsfaktoren.',
  },
  enterprise_sso: {
    title: 'Enterprise SSO',
    tooltip: 'Zusatzfeature mit einem Preis von ${{price, number}} pro SSO-Verbindung pro Monat.',
    tooltip_for_enterprise:
      'Zusatzfeature mit einem Preis von ${{price, number}} pro SSO-Verbindung pro Monat. Die ersten {{basicQuota}} SSO sind in deinem vertragsbasierten Plan enthalten und kostenlos.',
  },
  api_resources: {
    title: 'API-Ressourcen',
    tooltip:
      'Zusatzfeature zu einem Preis von ${{price, number}} pro Ressource pro Monat. Die ersten 3 API-Ressourcen sind kostenlos.',
    tooltip_for_enterprise:
      'Die ersten {{basicQuota}} API-Ressourcen sind in deinem vertragsbasierten Plan enthalten und kostenlos. Wenn du mehr benötigst, ${{price, number}} pro API-Ressource pro Monat.',
  },
  machine_to_machine: {
    title: 'Machine-to-Machine',
    tooltip:
      'Zusatzfeature zu einem Preis von ${{price, number}} pro App pro Monat. Die erste Machine-to-Machine-App ist kostenlos.',
    tooltip_for_enterprise:
      'Die erste {{basicQuota}} Machine-to-Machine-App ist in deinem vertragsbasierten Plan kostenlos. Wenn du mehr benötigst, ${{price, number}} pro App pro Monat.',
  },
  tenant_members: {
    title: 'Tenant-Mitglieder',
    tooltip:
      'Add-on-Funktion zum Preis von ${{price, number}} pro Mitglied pro Monat. Das erste {{count}} Tenant-Mitglied ist kostenlos.',
    tooltip_one:
      'Add-On-Feature zum Preis von ${{price, number}} pro Mitglied pro Monat. Das erste {{count}} Tenant-Mitglied ist kostenlos.',
    tooltip_other:
      'Add-On-Feature zum Preis von ${{price, number}} pro Mitglied pro Monat. Die ersten {{count}} Tenant-Mitglieder sind kostenlos.',
    tooltip_for_enterprise:
      'Die ersten {{basicQuota}} Tenant-Mitglieder sind in deinem vertragsbasierten Plan enthalten und kostenlos. Wenn du mehr benötigst, ${{price, number}} pro Tenant-Mitglied pro Monat.',
  },
  tokens: {
    title: 'Tokens',
    tooltip:
      'Zusatzfeature zu einem Preis von ${{price, number}} pro {{tokenLimit}} Tokens. Die ersten {{basicQuota}} Tokens sind inklusive.',
    tooltip_for_enterprise:
      'Die ersten {{basicQuota}} Tokens sind in deinem vertragsbasierten Plan enthalten und kostenlos. Wenn du mehr benötigst, ${{price, number}} pro {{tokenLimit}} Tokens pro Monat.',
  },
  hooks: {
    title: 'Hooks',
    tooltip:
      'Zusatzfeature zu einem Preis von ${{price, number}} pro Hook. Die ersten 10 Hooks sind inklusive.',
    tooltip_for_enterprise:
      'Die ersten {{basicQuota}} Hooks sind in deinem vertragsbasierten Plan enthalten und kostenlos. Wenn du mehr benötigst, ${{price, number}} pro Hook pro Monat.',
  },
  security_features: {
    title: 'Erweiterte Sicherheit',
    tooltip:
      'Add-on-Funktion mit einem Preis von ${{price, number}}/Monat für das vollständige Bundle der erweiterten Sicherheit, einschließlich CAPTCHA, Kontosperrung, E-Mail-Blockliste und mehr.',
  },
  saml_applications: {
    title: 'SAML-App',
    tooltip: 'Zusatzfeature zu einem Preis von ${{price, number}} pro SAML-App pro Monat.',
  },
  third_party_applications: {
    title: 'Drittanbieter-App',
    tooltip: 'Zusatzfeature zu einem Preis von ${{price, number}} pro App pro Monat.',
  },
  rbacEnabled: {
    title: 'Rollen',
    tooltip:
      'Zusatzfeature mit einem Festpreis von ${{price, number}} pro Monat. Der Preis wird nicht von der Anzahl der globalen Rollen beeinflusst.',
  },
  pricing: {
    add_on_changes_in_current_cycle_notice:
      'Wenn du während des aktuellen Abrechnungszyklus Änderungen vornimmst, kann deine nächste Rechnung im ersten Monat nach der Änderung leicht höher ausfallen. Es wird ein Basispreis von ${{price, number}} plus Zusatzkosten für unberechnete Nutzung aus dem aktuellen Zyklus und die volle Gebühr für den nächsten Zyklus berechnet. <a>Erfahre mehr</a>',
  },
};

export default Object.freeze(usage);
