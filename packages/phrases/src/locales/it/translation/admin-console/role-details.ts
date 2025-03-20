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
  field_is_default: 'Ruolo predefinito',
  field_is_default_description:
    "Imposta questo ruolo come ruolo predefinito per i nuovi utenti. Possono essere impostati più ruoli predefiniti. Ciò influenzerà anche i ruoli predefiniti per gli utenti creati tramite l'API di gestione.",
  type_m2m_role_tag: 'Ruolo macchina a macchina',
  type_user_role_tag: 'Ruolo utente',
  m2m_role_notification:
    "Assegna questo ruolo di macchina a macchina a un'applicazione di macchina a macchina per concedere l'accesso alle risorse API relative. <a>Crea prima un'applicazione di macchina a macchina</a> se non l'hai ancora fatto.",
  permission: {
    assign_button: 'Assegna permessi',
    assign_title: 'Assegna permessi',
    assign_subtitle:
      'Assegna autorizzazioni a questo ruolo. Il ruolo acquisirà le autorizzazioni aggiunte e gli utenti con questo ruolo erediteranno queste autorizzazioni.',
    assign_form_field: 'Assegna permessi',
    added_text: '{{count, number}} permesso aggiunto',
    added_text_other: '{{count, number}} autorizzazioni aggiunte',
    api_permission_count: '{{count, number}} permesso',
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
    assign_title: 'Assegna utenti a {{name}}',
    assign_subtitle: 'Trova utenti appropriati cercando per nome, email, telefono o ID utente.',
    assign_field: 'Assegna utenti',
    confirm_assign: 'Assegna utenti',
    assigned_toast_text: 'Gli utenti selezionati sono stati assegnati con successo a questo ruolo',
    empty: 'Nessun utente disponibile',
  },
  applications: {
    assign_button: 'Assegna applicazioni macchina a macchina',
    name_column: 'Applicazione',
    app_column: 'Applicazione macchina a macchina',
    description_column: 'Descrizione',
    delete_description:
      "Rimarrà nel pool delle tue applicazioni ma perderà l'autorizzazione per questo ruolo.",
    deleted: '{{name}} è stato rimosso con successo da questo ruolo',
    assign_title: 'Assegna applicazioni macchina a macchina a {{name}}',
    assign_subtitle:
      "Trova le applicazioni macchina a macchina appropriate cercando per nome, descrizione o ID dell'app.",
    assign_field: 'Assegna applicazioni macchina a macchina',
    confirm_assign: 'Assegna applicazioni macchina a macchina',
    assigned_toast_text:
      'Le applicazioni selezionate sono state assegnate con successo a questo ruolo',
    empty: 'Nessuna applicazione disponibile',
  },
};

export default Object.freeze(role_details);
