const tenant_members = {
  members: 'Mitglieder',
  invitations: 'Einladungen',
  invite_members: 'Mitglieder einladen',
  user: 'Benutzer',
  roles: 'Rollen',
  admin: 'Administrator',
  collaborator: 'Mitarbeiter',
  invitation_status: 'Einladungsstatus',
  inviter: 'Einlader',
  expiration_date: 'Ablaufdatum',
  invite_modal: {
    title: 'Lade Leute zu Silverhand ein',
    subtitle:
      'Um Mitglieder zu einer Organisation einzuladen, müssen sie die Einladung akzeptieren.',
    to: 'An',
    added_as: 'Hinzugefügt als Rollen',
    email_input_placeholder: 'johndoe@example.com',
  },
  invitation_statuses: {
    pending: 'Ausstehend',
    accepted: 'Akzeptiert',
    expired: 'Abgelaufen',
    revoked: 'Zurückgezogen',
  },
  invitation_empty_placeholder: {
    title: 'Teammitglieder einladen',
    description:
      'Ihr Mandant hat derzeit keine eingeladenen Mitglieder.\nZur Unterstützung Ihrer Integration sollten Sie weitere Mitglieder oder Administratoren hinzufügen.',
  },
  menu_options: {
    edit: 'Mandantenrolle bearbeiten',
    delete: 'Benutzer aus Mandanten entfernen',
    resend_invite: 'Einladung erneut senden',
    revoke: 'Einladung zurückziehen',
    delete_invitation_record: 'Diesen Einladungsdatensatz löschen',
  },
  edit_modal: {
    title: 'Rollen von {{name}} ändern',
  },
  delete_user_confirm: 'Möchten Sie diesen Benutzer wirklich aus diesem Mandanten entfernen?',
  assign_admin_confirm:
    'Möchten Sie sicher den/die ausgewählten Benutzer zum Administrator machen? Die Gewährung von Administratorzugriff gewährt den folgenden Berechtigungen:<ul><li>Ändern des Mandantenabrechnungsplans</li><li>Hinzufügen oder Entfernen von Mitarbeitern</li><li>Löschen des Mandanten</li></ul>',
  revoke_invitation_confirm: 'Möchten Sie diese Einladung wirklich zurückziehen?',
  delete_invitation_confirm: 'Möchten Sie diesen Einladungsdatensatz wirklich löschen?',
  messages: {
    invitation_sent: 'Einladung gesendet.',
    invitation_revoked: 'Einladung zurückgezogen.',
    invitation_resend: 'Einladung erneut gesendet.',
    invitation_deleted: 'Einladungsdatensatz gelöscht.',
  },
  errors: {
    email_required: 'E-Mail für den Eingeladenen ist erforderlich.',
    email_exists: 'Die E-Mail-Adresse existiert bereits.',
    member_exists: 'Dieser Benutzer ist bereits Mitglied dieser Organisation.',
    pending_invitation_exists:
      'Ausstehende Einladung vorhanden. Löschen Sie die entsprechende E-Mail oder widerrufen Sie die Einladung.',
    invalid_email:
      'Die E-Mail-Adresse ist ungültig. Stellen Sie sicher, dass sie im richtigen Format vorliegt.',
    max_member_limit:
      'Sie haben die maximale Anzahl von Mitgliedern ({{limit}}) für diesen Mandanten erreicht.',
  },
};

export default Object.freeze(tenant_members);
