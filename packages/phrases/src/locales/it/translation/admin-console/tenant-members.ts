const tenant_members = {
  members: 'Membri',
  invitations: 'Inviti',
  invite_members: 'Invita membri',
  user: 'Utente',
  roles: 'Ruoli',
  admin: 'Amministratore',
  collaborator: 'Collaboratore',
  invitation_status: 'Stato invito',
  inviter: 'Chi ha invitato',
  expiration_date: 'Data di scadenza',
  invite_modal: {
    title: 'Invita persone in Silverhand',
    subtitle: "Per invitare membri a un'organizzazione, devono accettare l'invito.",
    to: 'A',
    added_as: 'Aggiunti come ruoli',
    email_input_placeholder: 'johndoe@example.com',
  },
  invitation_statuses: {
    pending: 'In attesa',
    accepted: 'Accettato',
    expired: 'Scaduto',
    revoked: 'Revocato',
  },
  invitation_empty_placeholder: {
    title: 'Invita membri del team',
    description:
      "Attualmente il tuo inquilino non ha membri invitati.\nPer aiutare con la tua integrazione, considera l'aggiunta di più membri o amministratori.",
  },
  menu_options: {
    edit: 'Modifica ruolo inquilino',
    delete: "Rimuovi utente dall'inquilino",
    resend_invite: 'Rinvia invito',
    revoke: 'Revoca invito',
    delete_invitation_record: 'Elimina questo record di invito',
  },
  edit_modal: {
    title: 'Cambia ruoli di {{name}}',
  },
  delete_user_confirm: 'Sei sicuro di voler rimuovere questo utente da questo inquilino?',
  assign_admin_confirm:
    "Sei sicuro di voler rendere amministratore i(e) ​​utente(i)​​ selezionato(i)​​? Concedere l'accesso da amministratore fornirà al(i)​​ utente(i)​​ le seguenti autorizzazioni.<ul><li>Cambiare piano di fatturazione dell'inquilino</li><li>Aggiungere o rimuovere collaboratori</li><li>Eliminare l'inquilino</li></ul>",
  revoke_invitation_confirm: 'Sei sicuro di voler revocare questo invito?',
  delete_invitation_confirm: 'Sei sicuro di voler eliminare questo record di invito?',
  messages: {
    invitation_sent: 'Invito inviato.',
    invitation_revoked: 'Invito revocato.',
    invitation_resend: 'Invito rinviato.',
    invitation_deleted: 'Record di invito eliminato.',
  },
  errors: {
    email_required: "L'email dell'invitato è obbligatoria.",
    email_exists: "L'indirizzo email esiste già.",
    member_exists: 'Questo utente è già membro di questa organizzazione.',
    pending_invitation_exists:
      "Esiste un invito in sospeso. Elimina l'email correlata o revoca l'invito.",
    invalid_email: "L'indirizzo email non è valido. Assicurati che sia nel formato corretto.",
    max_member_limit: 'Hai raggiunto il numero massimo di membri ({{limit}}) per questo inquilino.',
  },
};

export default Object.freeze(tenant_members);
