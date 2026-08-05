const organization = {
  require_membership: "L'utente deve essere un membro dell'organizzazione per procedere.",
  role_names_not_found:
    'Nomi di ruoli non validi rilevati: {{names,list(type:conjunction)}}. Si prega di creare prima questi ruoli prima di procedere.',
  invitation_status_not_changeable: "Lo stato dell'invito non può più essere modificato.",
  accepted_user_id_required:
    "L'`acceptedUserId` è obbligatorio quando si accetta un invito.",
  invitee_already_member: "L'invitato è già membro dell'organizzazione.",
  accepted_user_email_mismatch:
    "L'utente che accetta deve avere la stessa email dell'invitato.",
  expires_at_in_future: 'Il valore di `expiresAt` deve essere nel futuro.',
};

export default Object.freeze(organization);
