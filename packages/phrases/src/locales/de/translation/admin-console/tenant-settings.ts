const tenant_settings = {
  title: 'Einstellungen',
  description: 'Effizientes Verwalten von Mandanteneinstellungen und Anpassen Ihrer Domain.',
  tabs: {
    settings: 'Einstellungen',
    domains: 'Domänen',
  },
  settings: {
    title: 'EINSTELLUNGEN',
    tenant_id: 'Mieter-ID',
    tenant_name: 'Mietername',
    environment_tag: 'Umgebungsmarke',
    environment_tag_description:
      'Tags verändern den Service nicht. Sie dienen lediglich zur Unterscheidung verschiedener Umgebungen.',
    environment_tag_development: 'Entw',
    environment_tag_staging: 'Staging',
    environment_tag_production: 'Prod',
    tenant_info_saved: 'Mieterinformationen erfolgreich gespeichert.',
  },
  deletion_card: {
    title: 'LÖSCHEN',
    tenant_deletion: 'Mieter löschen',
    tenant_deletion_description:
      'Das Löschen des Mandanten führt zur dauerhaften Entfernung aller zugehörigen Benutzerdaten und Konfigurationen. Bitte gehen Sie vorsichtig vor.',
    tenant_deletion_button: 'Mieter löschen',
  },
};

export default tenant_settings;
