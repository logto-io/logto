const organization = {
  require_membership: 'Der Benutzer muss Mitglied der Organisation sein, um fortzufahren.',
  role_names_not_found:
    'Ungültige Rollennamen erkannt: {{names,list(type:conjunction)}}. Bitte erstelle diese Rollen zuerst, bevor du fortfährst.',
  invitation_status_not_changeable: 'Der Status der Einladung kann nicht mehr geändert werden.',
  accepted_user_id_required: 'Die `acceptedUserId` ist beim Annehmen einer Einladung erforderlich.',
  invitee_already_member: 'Der Eingeladene ist bereits Mitglied der Organisation.',
  accepted_user_email_mismatch:
    'Der annehmende Benutzer muss dieselbe E-Mail-Adresse wie der Eingeladene haben.',
  expires_at_in_future: 'Der Wert von `expiresAt` muss in der Zukunft liegen.',
};

export default Object.freeze(organization);
