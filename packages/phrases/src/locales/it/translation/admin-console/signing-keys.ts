const signing_keys = {
  title: 'Chiavi di firma',
  description: 'Gestisci in modo sicuro le chiavi di firma utilizzate dalle tue applicazioni.',
  private_key: 'Chiavi private OIDC',
  private_keys_description: 'Le chiavi private OIDC vengono utilizzate per firmare i token JWT.',
  cookie_key: 'Chiavi dei cookie OIDC',
  cookie_keys_description: 'Le chiavi dei cookie OIDC vengono utilizzate per firmare i cookie.',
  private_keys_in_use: 'Chiavi private in uso',
  cookie_keys_in_use: 'Chiavi dei cookie in uso',
  rotate_private_keys: 'Ruota le chiavi private',
  rotate_cookie_keys: 'Ruota le chiavi dei cookie',
  rotate_private_keys_description:
    'Questa azione creerà una nuova chiave di firma privata, ruoterà la chiave attuale e rimuoverà la chiave precedente. I tuoi token JWT firmati con la chiave attuale rimarranno validi fino alla cancellazione o a un altro ciclo di rotazione.',
  rotate_cookie_keys_description:
    'Questa azione creerà una nuova chiave dei cookie, ruoterà la chiave attuale e rimuoverà la chiave precedente. I tuoi cookie con la chiave attuale rimarranno validi fino alla cancellazione o a un altro ciclo di rotazione.',
  select_private_key_algorithm: "Seleziona l'algoritmo di firma per la nuova chiave privata",
  rotate_button: 'Ruota',
  table_column: {
    id: 'ID',
    status: 'Stato',
    algorithm: 'Algoritmo di firma della chiave',
  },
  status: {
    current: 'Attuale',
    previous: 'Precedente',
  },
  reminder: {
    rotate_private_key:
      'Sei sicuro di voler ruotare le <strong>chiavi private OIDC</strong>? I nuovi token JWT emessi saranno firmati dalla nuova chiave. I token JWT esistenti rimarranno validi finché non ruoti nuovamente.',
    rotate_cookie_key:
      'Sei sicuro di voler ruotare le <strong>chiavi dei cookie OIDC</strong>? I nuovi cookie generati nelle sessioni di accesso saranno firmati dalla nuova chiave dei cookie. I cookie esistenti rimarranno validi finché non ruoti nuovamente.',
    delete_private_key:
      'Sei sicuro di voler eliminare la <strong>chiave privata OIDC</strong>? I token JWT esistenti firmati con questa chiave privata non saranno più validi.',
    delete_cookie_key:
      'Sei sicuro di voler eliminare la <strong>chiave dei cookie OIDC</strong>? Le sessioni di accesso precedenti con i cookie firmati con questa chiave dei cookie non saranno più valide. È richiesta una nuova autenticazione per questi utenti.',
  },
  messages: {
    rotate_key_success: 'Chiavi di firma ruotate con successo.',
    delete_key_success: 'Chiave eliminata con successo.',
  },
};

export default Object.freeze(signing_keys);
