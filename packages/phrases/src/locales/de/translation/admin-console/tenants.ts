const tenants = {
  create_modal: {
    title: 'Mieter erstellen',
    subtitle: 'Erstellen Sie einen neuen Mieter, um Ressourcen und Benutzer zu trennen.',
    create_button: 'Mieter erstellen',
    tenant_name: 'Mietername',
    tenant_name_placeholder: 'Mein Mieter',
    environment_tag: 'Umwelt Tag',
    environment_tag_description:
      'Verwenden Sie Tags, um die Verwendungsumgebungen von Mieter zu unterscheiden. Dienste innerhalb jeder Marke sind identisch und sorgen für Konsistenz.',
    environment_tag_development: 'Entwicklung',
    environment_tag_staging: 'Staging',
    environment_tag_production: 'Produktion',
  },
  tenant_created: "Mieter '{{name}}' erfolgreich erstellt.",
};

export default tenants;
