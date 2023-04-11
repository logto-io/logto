const profil = {
  page_title: 'Account-Einstellungen',
  title: 'Account-Einstellungen',
  description:
    'Ändern Sie hier Ihre Kontoeinstellungen und verwalten Sie Ihre persönlichen Informationen, um die Sicherheit Ihres Kontos zu gewährleisten.',
  settings: {
    title: 'PROFIL-EINSTELLUNGEN',
    profile_information: 'Profil-Informationen',
    avatar: 'Avatar',
    name: 'Name',
    username: 'Benutzername',
  },
  link_account: {
    title: 'KONTO VERKNÜPFEN',
    email_sign_in: 'E-Mail-Anmeldung',
    email: 'Email',
    social_sign_in: 'Social-Log-in',
    link_email: 'E-Mail verknüpfen',
    link_email_subtitle:
      'Verknüpfen Sie Ihre E-Mail-Adresse, um sich anzumelden oder bei der Wiederherstellung Ihres Kontos zu helfen.',
    email_required: 'Email ist erforderlich',
    invalid_email: 'Ungültige E-Mail-Adresse',
    identical_email_address: 'Die eingegebene E-Mail-Adresse ist identisch mit der aktuellen.',
    anonymous: 'Anonym',
  },
  password: {
    title: 'PASSWORT & SICHERHEIT',
    password: 'Passwort',
    password_setting: 'Passworteinstellungen',
    new_password: 'Neues Passwort',
    confirm_password: 'Passwort bestätigen',
    enter_password: 'Geben Sie das aktuelle Passwort ein',
    enter_password_subtitle:
      'Überprüfen Sie, dass es sich um Sie handelt, um die Sicherheit Ihres Kontos zu schützen. Bitte geben Sie Ihr aktuelles Passwort ein, bevor Sie es ändern.',
    set_password: 'Passwort festlegen',
    verify_via_password: 'Überprüfen per Passwort',
    show_password: 'Passwort zeigen',
    required: 'Passwort ist erforderlich',
    min_length: 'Das Passwort muss mindestens {{min}} Zeichen lang sein',
    do_not_match: 'Die Passwörter stimmen nicht überein. Bitte versuchen Sie es erneut.',
  },
  code: {
    enter_verification_code: 'Bestätigungscode eingeben',
    enter_verification_code_subtitle:
      'Der Bestätigungscode wurde an <strong>{{target}}</strong> gesendet',
    verify_via_code: 'Überprüfen per Bestätigungscode',
    resend: 'Bestätigungscode erneut senden',
    resend_countdown: 'Erneut senden in {{countdown}} Sekunden',
  },
  delete_account: {
    title: 'KONTO LÖSCHEN',
    label: 'Konto löschen',
    description:
      'Wenn Sie Ihr Konto löschen, werden alle Ihre persönlichen Informationen, Benutzerdaten und Konfigurationen entfernt. Diese Aktion kann nicht rückgängig gemacht werden.',
    button: 'Konto löschen',
    dialog_paragraph_1:
      'Wir bedauern, dass Sie Ihr Konto löschen möchten. Das Löschen Ihres Kontos entfernt dauerhaft alle Daten, einschließlich Benutzerinformationen, Protokolle und Einstellungen, und diese Aktion kann nicht rückgängig gemacht werden. Stellen Sie also sicher, dass Sie wichtige Daten sichern, bevor Sie fortfahren.',
    dialog_paragraph_2:
      'Um mit dem Konto-Löschvorgang fortzufahren, senden Sie bitte eine E-Mail an unser Support-Team unter <a>mail</a> mit dem Betreff "Anforderung zur Kontolöschung". Wir werden Ihnen helfen und sicherstellen, dass all Ihre Daten ordnungsgemäß aus unserem System gelöscht werden.',
    dialog_paragraph_3:
      'Vielen Dank, dass Sie sich für Logto Cloud entschieden haben. Wenn Sie weitere Fragen oder Bedenken haben, zögern Sie bitte nicht, uns zu kontaktieren.',
  },
  set: 'Festlegen',
  change: 'Ändern',
  link: 'Verknüpfen',
  unlink: 'Verknüpfung aufheben',
  not_set: 'Nicht festgelegt',
  change_avatar: 'Avatar ändern',
  change_name: 'Name ändern',
  change_username: 'Benutzernamen ändern',
  set_name: 'Name festlegen',
  email_changed: 'E-Mail geändert!',
  password_changed: 'Passwort geändert!',
  updated: '{{target}} aktualisiert!',
  linked: '{{target}} verknüpft!',
  unlinked: '{{target}} Verknüpfung aufgehoben!',
  email_exists_reminder:
    'Diese E-Mail {{email}} ist mit einem bestehenden Konto verknüpft. Verknüpfen Sie hier eine andere E-Mail-Adresse.',
  unlink_confirm_text: 'Ja, Verknüpfung aufheben',
  unlink_reminder:
    'Benutzer können sich nicht mehr mit dem <span></span>-Konto anmelden, wenn Sie es trennen. Möchten Sie fortfahren?',
};
export default profil;
