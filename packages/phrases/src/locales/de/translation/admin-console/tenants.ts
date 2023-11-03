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
    description:
      'Geben Sie den Mandanten-Namen ein und sehen Sie Ihre Daten in der gehosteten Region und mit dem Umgebungstag an.',
    tenant_id: 'Mieter-ID',
    tenant_name: 'Mietername',
    /** UNTRANSLATED */
    tenant_region: 'Data hosted region',
    /** UNTRANSLATED */
    tenant_region_tip: 'Your tenant resources are hosted in {{region}}. <a>Learn more</a>',
    environment_tag: 'Umgebungsmarke',
    environment_tag_description:
      'Tags verändern den Service nicht. Sie dienen lediglich zur Unterscheidung verschiedener Umgebungen.',
    environment_tag_development: 'Entw',
    environment_tag_staging: 'Staging',
    environment_tag_production: 'Prod',
    /** UNTRANSLATED */
    development_description:
      'Development environment is mainly used for testing and include all pro features but have watermarks in the sign in experience. <a>Learn more</a>',
    tenant_info_saved: 'Mieterinformationen erfolgreich gespeichert.',
  },
  full_env_tag: {
    /** UNTRANSLATED */
    development: 'Development',
    /** UNTRANSLATED */
    production: 'Production',
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
    subtitle: 'Erstellen Sie einen neuen Mieter, um Ressourcen und Benutzer zu trennen.',
    /** UNTRANSLATED */
    subtitle_with_region:
      'Create a new tenant to separate resources and users. Region and environment tags can’t be modified after creation.',
    /** UNTRANSLATED */
    tenant_usage_purpose: 'What do you want to use this tenant for?',
    /** UNTRANSLATED */
    development_description:
      'Development environment is mainly used for testing and should not use in production environment.',
    /** UNTRANSLATED */
    development_hint:
      'Development environment is mainly used for testing and should not use in production environment.',
    /** UNTRANSLATED */
    production_description:
      'Production is where live software is used by end-users and may require a paid subscription.',
    /** UNTRANSLATED */
    available_plan: 'Available plan:',
    create_button: 'Mieter erstellen',
    tenant_name_placeholder: 'Mein Mieter',
  },
  notification: {
    /** UNTRANSLATED */
    allow_pro_features_title:
      'You can now access <span>all features of Logto Pro</span> in your development tenant!',
    /** UNTRANSLATED */
    allow_pro_features_description: "It's completely free, with no trial period – forever!",
    /** UNTRANSLATED */
    explore_all_features: 'Explore all features',
    /** UNTRANSLATED */
    impact_title: 'Does this have any impact on me?',
    /** UNTRANSLATED */
    staging_env_hint:
      'Your tenant label has been updated from "<strong>Staging</strong>" to "<strong>Production</strong>", but this change will not impact your current setup.',
    /** UNTRANSLATED */
    paid_tenant_hint_1:
      'As you subscribe to the Logto Hobby plan, your previous "<strong>Development</strong>" tenant tag will switch to "<strong>Production</strong>", and this won\'t affect your existing setup.',
    /** UNTRANSLATED */
    paid_tenant_hint_2:
      "If you're still in the development stage, you can create a new development tenant to access more pro features.",
    /** UNTRANSLATED */
    paid_tenant_hint_3:
      "If you're in the production stage, or a production environment, you still need to subscribe to a specific plan so there's nothing you need to do at this moment.",
    /** UNTRANSLATED */
    paid_tenant_hint_4:
      "Don't hesitate to reach out if you require help! Thank you for choosing Logto!",
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
    /** UNTRANSLATED */
    title: 'SIGNING KEYS',
    /** UNTRANSLATED */
    description: 'Securely manage signing keys in your tenant.',
    type: {
      /** UNTRANSLATED */
      private_key: 'OIDC private keys',
      /** UNTRANSLATED */
      cookie_key: 'OIDC cookie keys',
    },
    /** UNTRANSLATED */
    private_keys_in_use: 'Private keys in use',
    /** UNTRANSLATED */
    cookie_keys_in_use: 'Cookie keys in use',
    /** UNTRANSLATED */
    rotate_private_keys: 'Rotate private keys',
    /** UNTRANSLATED */
    rotate_cookie_keys: 'Rotate cookie keys',
    /** UNTRANSLATED */
    rotate_private_keys_description:
      'This action will create a new private signing key, rotate the current key, and remove your previous key. Your JWT tokens signed with the current key will remain valid until deletion or another round of rotation.',
    /** UNTRANSLATED */
    rotate_cookie_keys_description:
      'This action will create a new cookie key, rotate the current key, and remove your previous key. Your cookies with the current key will remain valid until deletion or another round of rotation.',
    /** UNTRANSLATED */
    select_private_key_algorithm: 'Select signing key algorithm for the new private key',
    /** UNTRANSLATED */
    rotate_button: 'Rotate',
    table_column: {
      /** UNTRANSLATED */
      id: 'ID',
      /** UNTRANSLATED */
      status: 'Status',
      /** UNTRANSLATED */
      algorithm: 'Signing key algorithm',
    },
    status: {
      /** UNTRANSLATED */
      current: 'Current',
      /** UNTRANSLATED */
      previous: 'Previous',
    },
    reminder: {
      /** UNTRANSLATED */
      rotate_private_key:
        'Are you sure you want to rotate the <strong>OIDC private keys</strong>? New issued JWT tokens will be signed by the new key. Existing JWT tokens stay valid until you rotate again.',
      /** UNTRANSLATED */
      rotate_cookie_key:
        'Are you sure you want to rotate the <strong>OIDC cookie keys</strong>? New cookies generated in sign-in sessions will be signed by the new cookie key. Existing cookies stay valid until you rotate again.',
      /** UNTRANSLATED */
      delete_private_key:
        'Are you sure you want to delete the <strong>OIDC private key</strong>? Existing JWT tokens signed with this private signing key will no longer be valid.',
      /** UNTRANSLATED */
      delete_cookie_key:
        'Are you sure you want to delete the <strong>OIDC cookie key</strong>? Older sign-in sessions with cookies signed with this cookie key will no longer be valid. A re-authentication is required for these users.',
    },
    messages: {
      /** UNTRANSLATED */
      rotate_key_success: 'Signing keys rotated successfully.',
      /** UNTRANSLATED */
      delete_key_success: 'Key deleted successfully.',
    },
  },
};

export default Object.freeze(tenants);
