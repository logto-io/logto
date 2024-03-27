const tenants = {
  title: 'Einstellungen',
  description: 'Effizientes Verwalten von Mandanteneinstellungen und Anpassen Ihrer Domain.',
  tabs: {
    settings: 'Einstellungen',
    /** UNTRANSLATED */
    members: 'Members',
    domains: 'Domänen',
    subscription: 'Plan und Abrechnung',
    billing_history: 'Abrechnungshistorie',
  },
  settings: {
    title: 'EINSTELLUNGEN',
    description:
      'Legen Sie den Mandantennamen fest und überprüfen Sie Ihre gehostete Datenregion und den Mandantentyp.',
    tenant_id: 'Mieter-ID',
    tenant_name: 'Mietername',
    tenant_region: 'Gehostete Region der Daten',
    tenant_region_tip:
      'Ihre Mandantenressourcen werden in {{region}} gehostet. <a>Mehr erfahren</a>',
    environment_tag_development: 'Entw',
    environment_tag_production: 'Prod',
    tenant_type: 'Mandantentyp',
    development_description:
      'Nur für Tests und sollte nicht in der Produktion verwendet werden. Es ist kein Abonnement erforderlich. Es verfügt über alle Pro-Funktionen, hat jedoch Einschränkungen wie ein Anmeldebanner. <a>Mehr erfahren</a>',
    production_description:
      'Vorgesehen für Apps, die von Endbenutzern verwendet werden und möglicherweise ein kostenpflichtiges Abonnement erfordern. <a>Mehr erfahren</a>',
    tenant_info_saved: 'Mieterinformationen erfolgreich gespeichert.',
  },
  full_env_tag: {
    development: 'Entwicklung',
    production: 'Produktion',
  },
  deletion_card: {
    title: 'LÖSCHEN',
    tenant_deletion: 'Mieter löschen',
    tenant_deletion_description:
      'Das Löschen des Mandanten führt zur dauerhaften Entfernung aller zugehörigen Benutzerdaten und Konfigurationen. Bitte gehen Sie vorsichtig vor.',
    tenant_deletion_button: 'Mieter löschen',
  },
  leave_tenant_card: {
    /** UNTRANSLATED */
    title: 'LEAVE',
    /** UNTRANSLATED */
    leave_tenant: 'Leave tenant',
    /** UNTRANSLATED */
    leave_tenant_description:
      'Any resources in the tenant will remain but you no longer have access to this tenant.',
    /** UNTRANSLATED */
    last_admin_note: 'To leave this tenant, ensure at least one more member has the Admin role.',
  },
  create_modal: {
    title: 'Mieter erstellen',
    subtitle:
      'Erstellen Sie einen neuen Mandanten mit isolierten Ressourcen und Benutzern. Die gehosteten Datenregionen und Mandantentypen können nach der Erstellung nicht geändert werden.',
    tenant_usage_purpose: 'Wofür möchten Sie diesen Mieter verwenden?',
    development_description:
      'Nur für Tests und sollte nicht in der Produktion verwendet werden. Es ist kein Abonnement erforderlich.',
    development_hint:
      'Es verfügt über alle Pro-Funktionen, hat jedoch Einschränkungen wie ein Anmeldebanner.',
    production_description:
      'Für die Nutzung durch Endbenutzer und möglicherweise ein kostenpflichtiges Abonnement.',
    available_plan: 'Verfügbare Pläne:',
    create_button: 'Mieter erstellen',
    tenant_name_placeholder: 'Mein Mieter',
  },
  dev_tenant_migration: {
    title:
      'Sie können jetzt unsere Pro-Funktionen kostenlos testen, indem Sie einen neuen "Entwicklungsmieter" erstellen!',
    affect_title: 'Wie betrifft das Sie?',
    hint_1:
      'Wir ersetzen die alten <strong> Umgebungstags </strong> durch zwei neue Mandantentypen: <strong> "Entwicklung" </strong> und <strong> "Produktion" </strong>.',
    hint_2:
      'Um einen reibungslosen Übergang und unterbrechungsfreie Funktionalität zu gewährleisten, werden alle früher erstellten Mandanten zum Mandantentyp <strong> Produktion </strong> mit Ihrem vorherigen Abonnement erhöht.',
    hint_3: 'Keine Sorge, all Ihre anderen Einstellungen bleiben gleich.',
    about_tenant_type: 'Über den Mandantentyp',
  },
  delete_modal: {
    title: 'Mieter löschen',
    description_line1:
      'Möchten Sie wirklich Ihren Mandanten "<span>{{name}}</span>" mit Umgebungssuffix-Tag "<span>{{tag}}</span>" löschen? Dieser Vorgang kann nicht rückgängig gemacht werden und führt zur dauerhaften Löschung aller Ihrer Daten und Kontoinformationen.',
    description_line2:
      'Bevor Sie Ihren Mieter löschen, können wir Ihnen vielleicht helfen.<span><a> Kontaktieren Sie uns per E-Mail </a></span>',
    description_line3:
      'Wenn Sie fortfahren möchten, geben Sie bitte den Mieter-Namen "<span>{{name}}</span>" zur Bestätigung ein.',
    delete_button: 'Dauerhaft löschen',
    cannot_delete_title: 'Diesen Mandanten kann nicht gelöscht werden',
    cannot_delete_description:
      'Entschuldigung, Sie können diesen Mandanten momentan nicht löschen. Stellen Sie sicher, dass Sie sich im kostenlosen Tarif befinden und alle ausstehenden Rechnungen bezahlt haben.',
  },
  leave_tenant_modal: {
    /** UNTRANSLATED */
    description: 'Are you sure you want to leave this tenant?',
    /** UNTRANSLATED */
    leave_button: 'Leave',
  },
  tenant_landing_page: {
    title: 'Du hast noch keinen Mandanten erstellt',
    description:
      'Um Ihr Projekt mit Logto zu konfigurieren, erstellen Sie bitte einen neuen Mandanten. Wenn Sie sich abmelden oder Ihr Konto löschen möchten, klicken Sie einfach auf die Avatar-Taste in der oberen rechten Ecke.',
    create_tenant_button: 'Mandanten erstellen',
  },
  status: {
    mau_exceeded: 'MAU überschritten',
    suspended: 'Gesperrt',
    overdue: 'Überfällig',
  },
  tenant_suspended_page: {
    title: 'Mieter gesperrt. Kontaktieren Sie uns, um den Zugriff wiederherzustellen.',
    description_1:
      'Es tut uns leid, Ihnen mitteilen zu müssen, dass Ihr Mieterkonto vorübergehend gesperrt wurde, da es unsachgemäß genutzt wurde. Dies umfasst die Überschreitung der MAU-Grenzen, überfällige Zahlungen oder andere unbefugte Aktionen.',
    description_2:
      'Wenn Sie weitere Informationen wünschen, Bedenken haben oder die volle Funktionalität wiederherstellen und Ihre Mieter entsperren möchten, zögern Sie nicht, uns umgehend zu kontaktieren.',
  },
};

export default Object.freeze(tenants);
