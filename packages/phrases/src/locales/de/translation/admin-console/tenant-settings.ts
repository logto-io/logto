const tenant_settings = {
  title: 'Einstellungen des Mieters',
  description:
    'Ändern Sie Ihre Kontoeinstellungen und verwalten Sie hier Ihre persönlichen Informationen, um die Sicherheit Ihres Kontos zu gewährleisten.',
  tabs: {
    settings: 'Einstellungen',
    domains: 'Domänen',
  },
  profile: {
    title: 'PROFIL-EINSTELLUNG',
    tenant_id: 'Mieter-ID',
    tenant_name: 'Mietername',
    environment_tag: 'Umgebungsmarke',
    environment_tag_description:
      'Verwenden Sie Tags, um Mieter-Nutzungsumgebungen zu unterscheiden. Services innerhalb jedes Tags sind identisch und gewährleisten Konsistenz.',
    environment_tag_development: 'Entwicklung',
    environment_tag_staging: 'Inszenierung',
    environment_tag_production: 'Produktion',
  },
  deletion_card: {
    title: 'LÖSCHEN',
    tenant_deletion: 'Mieter löschen',
    tenant_deletion_description:
      'Wenn Sie Ihr Konto löschen, werden alle persönlichen Informationen, Benutzerdaten und Konfigurationen entfernt. Dieser Vorgang kann nicht rückgängig gemacht werden.',
    tenant_deletion_button: 'Mieter löschen',
  },
};

export default tenant_settings;
