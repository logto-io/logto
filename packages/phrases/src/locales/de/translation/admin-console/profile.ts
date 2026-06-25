const profile = {
  link_account: {
    anonymous: 'Anonym',
  },

  delete_account: {
    title: 'KONTO LÖSCHEN',
    label: 'Konto löschen',
    description:
      'Wenn Sie Ihr Konto löschen, werden alle Ihre persönlichen Informationen, Benutzerdaten und Konfigurationen entfernt. Diese Aktion kann nicht rückgängig gemacht werden.',
    button: 'Konto löschen',
    p: {
      has_issue:
        'Es tut uns leid zu hören, dass du dein Konto löschen möchtest. Bevor du dein Konto löschen kannst, musst du die folgenden Probleme lösen.',
      after_resolved:
        'Sobald du die Probleme gelöst hast, kannst du dein Konto löschen. Bitte zögere nicht, uns zu kontaktieren, wenn du Hilfe benötigst.',
      check_information:
        'Es tut uns leid zu hören, dass du dein Konto löschen möchtest. Bitte überprüfe die folgenden Informationen sorgfältig, bevor du fortfährst.',
      remove_all_data:
        'Das Löschen deines Kontos wird alle Daten über dich in der Logto Cloud dauerhaft entfernen. Bitte stelle sicher, dass du alle wichtigen Daten sicherst, bevor du fortfährst.',
      confirm_information:
        'Bitte bestätige, dass die oben stehenden Informationen deinen Erwartungen entsprechen. Sobald du dein Konto löschst, können wir es nicht wiederherstellen.',
      has_admin_role:
        'Da du die Admin-Rolle im folgenden Mandanten hast, wird dieser zusammen mit deinem Konto gelöscht:',
      has_admin_role_other:
        'Da du die Admin-Rolle in den folgenden Mandanten hast, werden diese zusammen mit deinem Konto gelöscht:',
      quit_tenant: 'Du bist dabei, den folgenden Mandanten zu verlassen:',
      quit_tenant_other: 'Du bist dabei, die folgenden Mandanten zu verlassen:',
    },
    issues: {
      paid_plan:
        'Der folgende Mandant hat einen kostenpflichtigen Plan, bitte kündige das Abonnement zuerst:',
      paid_plan_other:
        'Die folgenden Mandanten haben kostenpflichtige Pläne, bitte kündige das Abonnement zuerst:',
      subscription_status: 'Der folgende Mandant hat ein Abonnementstatus-Problem:',
      subscription_status_other: 'Die folgenden Mandanten haben Abonnementstatus-Probleme:',
      open_invoice: 'Der folgende Mandant hat eine offene Rechnung:',
      open_invoice_other: 'Die folgenden Mandanten haben offene Rechnungen:',
    },
    error_occurred: 'Ein Fehler ist aufgetreten',
    error_occurred_description:
      'Entschuldigung, beim Löschen deines Kontos ist ein Fehler aufgetreten:',
    request_id: 'Anfrage-ID: {{requestId}}',
    try_again_later:
      'Bitte versuche es später erneut. Wenn das Problem weiterhin besteht, kontaktiere bitte das Logto-Team mit der Anfrage-ID.',
    final_confirmation: 'Endgültige Bestätigung',
    about_to_start_deletion:
      'Du bist dabei, den Löschvorgang zu starten und diese Aktion kann nicht rückgängig gemacht werden.',
    permanently_delete: 'Dauerhaft löschen',
  },

  fields: {
    name: 'Name',
    name_description:
      'Der vollständige Name des Benutzers in anzeigbarer Form, einschließlich aller Namenskomponenten (z.B. "Jane Doe").',
    avatar: 'Avatar',
    avatar_description: 'URL des Avatar-Bildes des Benutzers.',
    familyName: 'Nachname',
    familyName_description: 'Der Nachname(n) des Benutzers (z.B. "Doe").',
    givenName: 'Vorname',
    givenName_description: 'Der Vorname(n) des Benutzers (z.B. "Jane").',
    middleName: 'Mittlerer Name',
    middleName_description: 'Der mittlere Name(n) des Benutzers (z.B. "Marie").',
    nickname: 'Spitzname',
    nickname_description:
      'Informeller oder vertrauter Name des Benutzers, der von seinem offiziellen Namen abweichen kann.',
    preferredUsername: 'Bevorzugter Benutzername',
    preferredUsername_description:
      'Kurzform des Benutzernamens, unter dem der Benutzer angesprochen werden möchte.',
    profile: 'Profil',
    profile_description: 'URL der lesbaren Profilseite des Benutzers (z.B. Social-Media-Profil).',
    website: 'Website',
    website_description: 'URL der persönlichen Website oder des Blogs des Benutzers.',
    gender: 'Geschlecht',
    gender_description:
      'Das selbstidentifizierte Geschlecht des Benutzers (z.B. "Weiblich", "Männlich", "Nicht-binär")',
    birthdate: 'Geburtsdatum',
    birthdate_description:
      'Das Geburtsdatum des Benutzers in einem bestimmten Format (z.B. "TT-MM-JJJJ").',
    zoneinfo: 'Zeitzone',
    zoneinfo_description:
      'Die Zeitzone des Benutzers im IANA-Format (z.B. "America/New_York" oder "Europe/Paris").',
    locale: 'Sprache',
    locale_description:
      'Die Sprache des Benutzers im IETF BCP 47-Format (z.B. "de-DE" oder "en-US").',
    address: {
      formatted: 'Adresse',
      streetAddress: 'Straße und Hausnummer',
      locality: 'Stadt',
      region: 'Bundesland',
      postalCode: 'Postleitzahl',
      country: 'Land',
    },
    address_description:
      'Die vollständige Adresse des Benutzers in anzeigbarer Form, einschließlich aller Adresskomponenten (z.B. "123 Hauptstraße, Musterstadt, Deutschland 12345").',
    fullname: 'Vollständiger Name',
    fullname_description:
      'Flexible Kombination aus Nachname, Vorname und mittlerem Namen basierend auf der Konfiguration.',
  },
};

export default Object.freeze(profile);
