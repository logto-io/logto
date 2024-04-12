const role_details = {
  back_to_roles: 'Torna ai Ruoli',
  identifier: 'Identificatore',
  delete_description:
    'Ciò cancellerà anche i permessi associati a questo ruolo dagli utenti coinvolti e cancellerà la corrispondenza tra ruoli, utenti e permessi.',
  role_deleted: '{{name}} è stato cancellato con successo.',
  general_tab: 'Generale',
  users_tab: 'Utenti',
  m2m_apps_tab: 'App macchina-to-macchina',
  permissions_tab: 'Permessi',
  settings: 'Impostazioni',
  settings_description:
    "I ruoli sono un raggruppamento di autorizzazioni che possono essere assegnate agli utenti. Forniscono anche un modo per aggregare le autorizzazioni definite per diverse API, rendendo più efficiente l'aggiunta, la rimozione o la regolazione delle autorizzazioni rispetto all'assegnazione individuale agli utenti.",
  field_name: 'Nome',
  field_description: 'Descrizione',
  type_m2m_role_tag: 'Ruolo app macchina-to-macchina',
  type_user_role_tag: 'Ruolo utente',
  permission: {
    assign_button: 'Assegna permessi',
    assign_title: 'Assegna permessi',
    assign_subtitle:
      'Assegna autorizzazioni a questo ruolo. Il ruolo acquisirà le autorizzazioni aggiunte e gli utenti con questo ruolo erediteranno queste autorizzazioni.',
    assign_form_field: 'Assegna permessi',
    added_text_one: '{{count, number}} permesso aggiunto',
    added_text_other: '{{count, number}} autorizzazioni aggiunte',
    api_permission_count_one: '{{count, number}} permesso',
    api_permission_count_other: '{{count, number}} autorizzazioni',
    confirm_assign: 'Assegna permessi',
    permission_assigned:
      'Le autorizzazioni selezionate sono state assegnate con successo a questo ruolo',
    deletion_description:
      "Se questa autorizzazione viene rimossa, l'utente interessato con questo ruolo perderà l'accesso garantito da questa autorizzazione.",
    permission_deleted: 'La permissione "{{name}}" è stata rimossa con successo da questo ruolo',
    empty: 'Nessuna autorizzazione disponibile',
  },
  users: {
    assign_button: 'Assegna utenti',
    name_column: 'Utente',
    app_column: 'App',
    latest_sign_in_column: 'Ultimo accesso',
    delete_description:
      "Resterà nella tua raccolta di utenti ma perderà l'autorizzazione per questo ruolo.",
    deleted: '{{name}} è stato rimosso con successo da questo ruolo',
    assign_title: 'Assegna utenti',
    assign_subtitle:
      'Assegna utenti a questo ruolo. Trova utenti appropriati cercando nome, email, telefono o ID utente.',
    assign_field: 'Assegna utenti',
    confirm_assign: 'Assegna utenti',
    assigned_toast_text: 'Gli utenti selezionati sono stati assegnati con successo a questo ruolo',
    empty: 'Nessun utente disponibile',
  },
  applications: {
    assign_button: 'Assegna applicazioni',
    name_column: 'Applicazione',
    app_column: 'App',
    description_column: 'Descrizione',
    delete_description:
      "Rimarrà nel pool delle tue applicazioni ma perderà l'autorizzazione per questo ruolo.",
    deleted: '{{name}} è stato rimosso con successo da questo ruolo',
    assign_title: 'Assegna applicazioni',
    assign_subtitle:
      'Assegna applicazioni a questo ruolo. Trova le applicazioni appropriate cercando nome, descrizione o ID app.',
    assign_field: 'Assegna applicazioni',
    confirm_assign: 'Assegna applicazioni',
    assigned_toast_text:
      'Le applicazioni selezionate sono state assegnate con successo a questo ruolo',
    empty: 'Nessuna applicazione disponibile',
  },
};

export default Object.freeze(role_details);
