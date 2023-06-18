const tenants = {
  create_modal: {
    title: 'Mieter erstellen',
    subtitle: 'Erstellen Sie einen neuen Mieter, um Ressourcen und Benutzer zu trennen.',
    create_button: 'Mieter erstellen',
    tenant_name: 'Mietername',
    tenant_name_placeholder: 'Mein Mieter',
    environment_tag: 'Umwelt Tag',
    environment_tag_description:
      'Die Dienste mit unterschiedlichen Tags sind identisch. Es funktioniert als Suffix, um Ihrem Team Umgebungen zu unterscheiden.',
    environment_tag_development: 'Dev',
    environment_tag_staging: 'Staging',
    environment_tag_production: 'Prod',
  },
  delete_modal: {
    title: 'Mieter löschen',
    description_line1:
      'Möchten Sie Ihren Mieter "<span>{{name}}</span>" mit Umgebungssuffix-Tag "<span>{{tag}}</span>" wirklich löschen? Der Vorgang kann nicht rückgängig gemacht werden und führt zur dauerhaften Löschung aller Ihrer Daten und Kontoinformationen.',
    description_line2:
      'Bevor Sie Ihr Konto löschen, können wir Ihnen vielleicht helfen. <span><a>Kontaktieren Sie uns per E-Mail</a></span>',
    description_line3:
      'Wenn Sie fortfahren möchten, geben Sie bitte den Mieter-Namen "<span>{{name}}</span>" zur Bestätigung ein.',
    delete_button: 'Dauerhaft löschen',
  },
  tenant_landing_page: {
    title: 'Du hast noch keinen Mandanten erstellt',
    description:
      'Um Ihr Projekt mit Logto zu konfigurieren, erstellen Sie bitte einen neuen Mandanten. Wenn Sie sich abmelden oder Ihr Konto löschen möchten, klicken Sie einfach auf die Avatar-Taste in der oberen rechten Ecke.',
    create_tenant_button: 'Mandanten erstellen',
  },
  tenant_created: "Mieter '{{name}}' erfolgreich erstellt.",
};

export default tenants;
