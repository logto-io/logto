const tenant_members = {
  members: 'Członkowie',
  invitations: 'Zaproszenia',
  invite_members: 'Zaproś członków',
  user: 'Użytkownik',
  roles: 'Role',
  admin: 'Administrator',
  collaborator: 'Współpracownik',
  invitation_status: 'Status zaproszenia',
  inviter: 'Zapraszający',
  expiration_date: 'Data wygaśnięcia',
  invite_modal: {
    title: 'Zaproś ludzi do Silverhand',
    subtitle: 'Aby zaprosić członków do organizacji, muszą zaakceptować zaproszenie.',
    to: 'Do',
    added_as: 'Dodany jako role',
    email_input_placeholder: 'janekkowalski@przykład.com',
  },
  invitation_statuses: {
    pending: 'Oczekujące',
    accepted: 'Zaakceptowane',
    expired: 'Wygasłe',
    revoked: 'Anulowane',
  },
  invitation_empty_placeholder: {
    title: 'Zaproś członków zespołu',
    description:
      'Twoja dzierżawa obecnie nie ma zaproszonych członków.\nAby pomóc w integracji, rozważ dodanie więcej członków lub administratorów.',
  },
  menu_options: {
    edit: 'Edytuj rolę dzierżawy',
    delete: 'Usuń użytkownika z dzierżawy',
    resend_invite: 'Ponownieś w zaproszenie',
    revoke: 'Anuluj zaproszenie',
    delete_invitation_record: 'Usuń ten rekord zaproszenia',
  },
  edit_modal: {
    title: 'Zmień role dla {{name}}',
  },
  delete_user_confirm: 'Czy na pewno chcesz usunąć tego użytkownika z tej dzierżawy?',
  assign_admin_confirm:
    'Czy na pewno chcesz uczynić wybranego użytkownika/ów administratorem? Przyznanie uprawnień administratora spowoduje nadanie użytkownikowi/om następujących uprawnień.<ul><li>Zmiana planu rozliczeniowego dzierżawy</li><li>Dodawanie lub usuwanie współpracowników</li><li>Usunięcie dzierżawy</li></ul>',
  revoke_invitation_confirm: 'Czy na pewno chcesz anulować to zaproszenie?',
  delete_invitation_confirm: 'Czy na pewno chcesz usunąć ten rekord zaproszenia?',
  messages: {
    invitation_sent: 'Zaproszenie wysłane.',
    invitation_revoked: 'Zaproszenie anulowane.',
    invitation_resend: 'Zaproszenie wysłane ponownie.',
    invitation_deleted: 'Rekord zaproszenia usunięty.',
  },
  errors: {
    email_required: 'E-mail zapraszanego jest wymagany.',
    email_exists: 'Adres e-mail już istnieje.',
    member_exists: 'Ten użytkownik jest już członkiem tej organizacji.',
    pending_invitation_exists:
      'Istnieje oczekujące zaproszenie. Usuń powiązany adres e-mail lub anuluj zaproszenie.',
    invalid_email: 'Adres e-mail jest nieprawidłowy. Upewnij się, że jest w odpowiednim formacie.',
    max_member_limit: 'Osiągnąłeś limit maksymalnej liczby członków ({{limit}}) dla tej dzierżawy.',
  },
};

export default Object.freeze(tenant_members);
