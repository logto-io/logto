const signing_keys = {
  title: 'Clés de signature',
  description: 'Gérez de manière sécurisée les clés de signature utilisées par vos applications.',
  private_key: 'Clés privées OIDC',
  private_keys_description: 'Les clés privées OIDC sont utilisées pour signer les jetons JWT.',
  cookie_key: 'Clés de cookies OIDC',
  cookie_keys_description: 'Les clés de cookies OIDC sont utilisées pour signer les cookies.',
  private_keys_in_use: "Clés privées en cours d'utilisation",
  cookie_keys_in_use: "Clés de cookies en cours d'utilisation",
  rotate_private_keys: 'Faire tourner les clés privées',
  rotate_cookie_keys: 'Faire tourner les clés de cookies',
  rotate_private_keys_description:
    "Cette action créera une nouvelle clé de signature privée, fera tourner la clé actuelle et supprimera votre clé précédente. Vos jetons JWT signés avec la clé actuelle resteront valides jusqu'à leur suppression ou une nouvelle rotation.",
  rotate_cookie_keys_description:
    "Cette action créera une nouvelle clé de cookie, fera tourner la clé actuelle et supprimera votre clé précédente. Vos cookies avec la clé actuelle resteront valides jusqu'à leur suppression ou une nouvelle rotation.",
  select_private_key_algorithm:
    "Sélectionnez l'algorithme de clé de signature pour la nouvelle clé privée",
  rotate_button: 'Faire tourner',
  table_column: {
    id: 'ID',
    status: 'Statut',
    algorithm: 'Algorithme de clé de signature',
  },
  status: {
    current: 'Actuel',
    previous: 'Précédent',
  },
  reminder: {
    rotate_private_key:
      "Êtes-vous sûr de vouloir faire tourner les <strong>clés privées OIDC</strong>? Les nouveaux jetons JWT émis seront signés par la nouvelle clé. Les jetons JWT existants resteront valides jusqu'à votre prochaine rotation.",
    rotate_cookie_key:
      "Êtes-vous sûr de vouloir faire tourner les <strong>clés de cookies OIDC</strong>? Les nouveaux cookies générés dans les sessions de connexion seront signés par la nouvelle clé de cookie. Les cookies existants resteront valides jusqu'à votre prochaine rotation.",
    delete_private_key:
      'Êtes-vous sûr de vouloir supprimer la <strong>clé privée OIDC</strong>? Les jetons JWT existants signés avec cette clé de signature privée ne seront plus valides.',
    delete_cookie_key:
      'Êtes-vous sûr de vouloir supprimer la <strong>clé de cookie OIDC</strong>? Les anciennes sessions de connexion avec des cookies signés avec cette clé de cookie ne seront plus valides. Une ré-authentification est requise pour ces utilisateurs.',
  },
  messages: {
    rotate_key_success: 'Rotation des clés de signature effectuée avec succès.',
    delete_key_success: 'Clé supprimée avec succès.',
  },
};

export default Object.freeze(signing_keys);
