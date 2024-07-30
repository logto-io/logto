const tenants = {
  title: 'Einstellungen',
  description: 'Effizientes Verwalten von Mandanteneinstellungen und Anpassen Ihrer Domain.',
  tabs: {
    settings: 'Einstellungen',
    members: 'Mitglieder',
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
    tenant_region_description:
      'Der physische Ort, an dem Ihre Mandantenressourcen (Benutzer, Apps, usw.) gehostet werden. Dies kann nach Erstellung nicht mehr geändert werden.',
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
    title: 'VERLASSEN',
    leave_tenant: 'Mieter verlassen',
    leave_tenant_description:
      'Alle Ressourcen im Mandanten bleiben erhalten, aber Sie haben keinen Zugriff mehr auf diesen Mandanten.',
    last_admin_note:
      'Um diesen Mandanten zu verlassen, stellen Sie sicher, dass mindestens ein weiteres Mitglied die Admin-Rolle hat.',
  },
  create_modal: {
    title: 'Mieter erstellen',
    subtitle: 'Erstellen Sie einen neuen Mandanten, der isolierte Ressourcen und Benutzer hat.',
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
    tenant_created: 'Mieter erfolgreich erstellt.',
    invitation_failed:
      'Einige Einladungen konnten nicht gesendet werden. Bitte versuchen Sie es später erneut unter Einstellungen -> Mitglieder.',
    tenant_type_description: 'Dies kann nach Erstellung nicht geändert werden.',
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
      'Sind Sie sicher, dass Sie Ihren Mandanten "<span>{{name}}</span>" mit dem Umgebungssuffixtag "<span>{{tag}}</span>" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden und führt zur dauerhaften Löschung all Ihrer Daten und Mandanteninformationen.',
    description_line2:
      'Bevor Sie einen Mandanten löschen, können wir Ihnen vielleicht helfen. <span><a>Kontaktieren Sie uns per E-Mail</a></span>',
    description_line3:
      'Wenn Sie fortfahren möchten, geben Sie bitte den Mieter-Namen "<span>{{name}}</span>" zur Bestätigung ein.',
    delete_button: 'Dauerhaft löschen',
    cannot_delete_title: 'Diesen Mandanten kann nicht gelöscht werden',
    cannot_delete_description:
      'Entschuldigung, diesen Mandanten können Sie derzeit nicht löschen. Stellen Sie sicher, dass Sie sich im kostenlosen Tarif befinden und alle ausstehenden Rechnungen bezahlt haben.',
  },
  leave_tenant_modal: {
    description: 'Sind Sie sicher, dass Sie diesen Mandanten verlassen möchten?',
    leave_button: 'Verlassen',
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
  production_tenant_notification: {
    text: 'Sie befinden sich in einem Entwicklungsmieter für kostenlose Tests. Erstellen Sie einen Produktionsmandanten, um live zu gehen.',
    action: 'Mieter erstellen',
  },
};

export default Object.freeze(tenants);
