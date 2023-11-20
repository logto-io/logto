const tenants = {
  title: 'Einstellungen',
  description: 'Effizientes Verwalten von Mandanteneinstellungen und Anpassen Ihrer Domain.',
  tabs: {
    settings: 'Einstellungen',
    domains: 'Domänen',
    subscription: 'Plan und Abrechnung',
    billing_history: 'Abrechnungshistorie',
  },
  settings: {
    title: 'EINSTELLUNGEN',
    /** UNTRANSLATED */
    description: 'Set the tenant name and view your data hosted region and tenant type.',
    tenant_id: 'Mieter-ID',
    tenant_name: 'Mietername',
    tenant_region: 'Gehostete Region der Daten',
    tenant_region_tip:
      'Ihre Mandantenressourcen werden in {{region}} gehostet. <a>Mehr erfahren</a>',
    environment_tag: 'Umgebungsmarke',
    environment_tag_description:
      'Tags verändern den Service nicht. Sie dienen lediglich zur Unterscheidung verschiedener Umgebungen.',
    environment_tag_development: 'Entw',
    environment_tag_staging: 'Staging',
    environment_tag_production: 'Prod',
    /** UNTRANSLATED */
    tenant_type: 'Tenant type',
    /** UNTRANSLATED */
    development_description:
      "For testing only and shouldn't be used in production. No subscription is required. It has all the pro features but has limitations like a sign-in banner. <a>Learn more</a>",
    /** UNTRANSLATED */
    production_description:
      'Intended for apps that are being used by end-users and may require a paid subscription. <a>Learn more</a>',
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
  create_modal: {
    title: 'Mieter erstellen',
    subtitle_deprecated: 'Erstellen Sie einen neuen Mieter, um Ressourcen und Benutzer zu trennen.',
    subtitle:
      'Erstellen Sie einen neuen Mandanten mit isolierten Ressourcen und Benutzern. Die gehosteten Datenregionen und Mandantentypen können nach der Erstellung nicht geändert werden.',
    tenant_usage_purpose: 'Wofür möchten Sie diesen Mieter verwenden?',
    /** UNTRANSLATED */
    development_description:
      "For testing only and shouldn't be used in production. No subscription is required.",
    /** UNTRANSLATED */
    development_hint: 'It has all the pro features but has limitations like a sign-in banner.',
    /** UNTRANSLATED */
    production_description: 'For use by end-users and may require a paid subscription.',
    available_plan: 'Verfügbare Pläne:',
    create_button: 'Mieter erstellen',
    tenant_name_placeholder: 'Mein Mieter',
  },
  dev_tenant_migration: {
    /** UNTRANSLATED */
    title:
      'You can now try our Hobby and Pro features for free by creating a new "Development tenant"!',
    /** UNTRANSLATED */
    affect_title: 'How does this affect you?',
    /** UNTRANSLATED */
    hint_1:
      'We are replacing the old <strong>environment tags</strong> with two new tenant types: <strong>“Development”</strong> and <strong>“Production”</strong>.',
    /** UNTRANSLATED */
    hint_2:
      'To ensure a seamless transition and uninterrupted functionality, all early-created tenants will be elevated to the <strong>Production</strong> tenant type along with your previous subscription.',
    /** UNTRANSLATED */
    hint_3: "Don't worry, all your other settings will remain the same.",
    /** UNTRANSLATED */
    about_tenant_type: 'About tenant type',
  },
  dev_tenant_notification: {
    /** UNTRANSLATED */
    title:
      'You can now access <a>all features of Logto Hobby and Pro</a> in your development tenant!',
    /** UNTRANSLATED */
    description: "It's completely free, with no trial period – forever!",
  },
  delete_modal: {
    title: 'Mieter löschen',
    description_line1:
      'Möchten Sie wirklich Ihren Mandanten "<span>{{name}}</span>" mit Umgebungssuffix-Tag "<span>{{tag}}</span>" löschen? Dieser Vorgang kann nicht rückgängig gemacht werden und führt zur dauerhaften Löschung aller Ihrer Daten und Kontoinformationen.',
    description_line2:
      'Bevor Sie Ihren Mieter löschen, können wir Ihnen vielleicht helfen. <span><a>Kontaktieren Sie uns per E-Mail</a></span>',
    description_line3:
      'Wenn Sie fortfahren möchten, geben Sie bitte den Mieter-Namen "<span>{{name}}</span>" zur Bestätigung ein.',
    delete_button: 'Dauerhaft löschen',
    cannot_delete_title: 'Diesen Mandanten kann nicht gelöscht werden',
    cannot_delete_description:
      'Entschuldigung, Sie können diesen Mandanten momentan nicht löschen. Stellen Sie sicher, dass Sie sich im kostenlosen Tarif befinden und alle ausstehenden Rechnungen bezahlt haben.',
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
  signing_keys: {
    title: 'SIGNIERUNGSSCHLÜSSEL',
    description: 'Sicherer Umgang mit Signierungsschlüsseln in Ihrem Mandanten.',
    type: {
      private_key: 'OIDC-Private Keys',
      cookie_key: 'OIDC-Cookie-Keys',
    },
    private_keys_in_use: 'Verwendete private Schlüssel',
    cookie_keys_in_use: 'Verwendete Cookie-Schlüssel',
    rotate_private_keys: 'Private Schlüssel rotieren',
    rotate_cookie_keys: 'Cookie-Schlüssel rotieren',
    rotate_private_keys_description:
      'Diese Aktion erstellt einen neuen privaten Signierungsschlüssel, rotiert den aktuellen Schlüssel und entfernt Ihren vorherigen Schlüssel. Ihre JWT-Token, die mit dem aktuellen Schlüssel signiert sind, bleiben gültig, bis sie gelöscht oder erneut rotiert werden.',
    rotate_cookie_keys_description:
      'Diese Aktion erstellt einen neuen Cookie-Schlüssel, rotiert den aktuellen Schlüssel und entfernt Ihren vorherigen Schlüssel. Ihre Cookies mit dem aktuellen Schlüssel bleiben gültig, bis sie gelöscht oder erneut rotiert werden.',
    select_private_key_algorithm:
      'Signierungsalgorithmus für den neuen privaten Schlüssel auswählen',
    rotate_button: 'Rotieren',
    table_column: {
      id: 'ID',
      status: 'Status',
      algorithm: 'Signierungsschlüssel Algorithmus',
    },
    status: {
      current: 'Aktuell',
      previous: 'Vorherige',
    },
    reminder: {
      rotate_private_key:
        'Sind Sie sicher, dass Sie die <strong>OIDC-Private Keys</strong> rotieren möchten? Neue ausgestellte JWT-Token werden vom neuen Schlüssel signiert. Bestehende JWT-Token bleiben gültig, bis Sie sie erneut rotieren.',
      rotate_cookie_key:
        'Sind Sie sicher, dass Sie die <strong>OIDC-Cookie-Keys</strong> rotieren möchten? Neue Cookies, die in Anmelde-Sitzungen generiert werden, werden mit dem neuen Cookie-Schlüssel signiert. Bestehende Cookies bleiben gültig, bis Sie sie erneut rotieren.',
      delete_private_key:
        'Sind Sie sicher, dass Sie den <strong>OIDC-Privaten Schlüssel</strong> löschen möchten? Bestehende JWT-Token, die mit diesem privaten Signierungsschlüssel signiert wurden, sind nicht mehr gültig.',
      delete_cookie_key:
        'Sind Sie sicher, dass Sie den <strong>OIDC-Cookie-Schlüssel</strong> löschen möchten? Ältere Anmelde-Sitzungen mit Cookies, die mit diesem Cookie-Schlüssel signiert wurden, sind nicht mehr gültig. Eine erneute Authentifizierung ist für diese Benutzer erforderlich.',
    },
    messages: {
      rotate_key_success: 'Signierungsschlüssel erfolgreich rotieren.',
      delete_key_success: 'Schlüssel erfolgreich gelöscht.',
    },
  },
};

export default Object.freeze(tenants);
