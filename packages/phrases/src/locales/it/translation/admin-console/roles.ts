const roles = {
  page_title: 'Ruoli',
  title: 'Ruoli',
  subtitle:
    "I ruoli includono le autorizzazioni che determinano ciò che un utente può fare. RBAC utilizza i ruoli per dare agli utenti l'accesso alle risorse necessarie per specifiche azioni.",
  create: 'Crea Ruolo',
  role_name: 'Nome ruolo',
  role_type: 'Tipo ruolo',
  type_user: 'Utente',
  type_machine_to_machine: 'Da macchina a macchina',
  role_description: 'Descrizione',
  role_name_placeholder: 'Inserisci il nome del tuo ruolo',
  role_description_placeholder: 'Inserisci la descrizione del tuo ruolo',
  col_roles: 'Ruoli',
  col_type: 'Tipo',
  col_description: 'Descrizione',
  col_assigned_entities: 'Assegnati',
  user_counts: '{{count}} utenti',
  application_counts: '{{count}} app',
  user_count: '{{count}} utente',
  application_count: '{{count}} app',
  assign_permissions: 'Assegna autorizzazioni',
  create_role_title: 'Crea Ruolo',
  create_role_description:
    'Usa i ruoli per organizzare le autorizzazioni e assegnarle agli utenti.',
  create_role_button: 'Crea Ruolo',
  role_created: 'Il ruolo {{name}} è stato creato con successo.',
  search: 'Cerca per nome, descrizione o ID del ruolo',
  placeholder_title: 'Ruoli',
  placeholder_description:
    'I ruoli sono un raggruppamento di autorizzazioni che possono essere assegnati agli utenti. Assicurati di aggiungere le autorizzazioni prima di creare i ruoli.',
  assign_roles: 'Assegna ruoli',
  management_api_access_notification:
    "Per accedere all'API di gestione di Logto, seleziona ruoli con autorizzazioni API di gestione <flag/>.",
  with_management_api_access_tip:
    "Questo ruolo da macchina a macchina include autorizzazioni per l'API di gestione di Logto",
  role_creation_hint: 'Non trovi il ruolo giusto? <a>Crea un ruolo</a>',
};

export default Object.freeze(roles);
