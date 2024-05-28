const tenant_members = {
  members: 'Membres',
  invitations: 'Invitations',
  invite_members: 'Inviter des membres',
  user: 'Utilisateur',
  roles: 'Rôles',
  admin: 'Administrateur',
  collaborator: 'Collaborateur',
  invitation_status: "Statut de l'invitation",
  inviter: 'Invitant',
  expiration_date: "Date d'expiration",
  invite_modal: {
    title: 'Inviter des personnes à Silverhand',
    subtitle: "Pour inviter des membres à une organisation, ils doivent accepter l'invitation.",
    to: 'À',
    added_as: 'Ajouté en tant que rôles',
    email_input_placeholder: 'johndoe@example.com',
  },
  invitation_statuses: {
    pending: 'En attente',
    accepted: 'Accepté',
    expired: 'Expiré',
    revoked: 'Révoqué',
  },
  invitation_empty_placeholder: {
    title: "Inviter des membres d'équipe",
    description:
      "Votre locataire n'a actuellement aucun membre invité.\nPour aider à votre intégration, envisagez d'ajouter plus de membres ou d'administrateurs.",
  },
  menu_options: {
    edit: "Modifier le rôle de l'utilisateur",
    delete: "Supprimer l'utilisateur du locataire",
    resend_invite: "Renvoyer l'invitation",
    revoke: "Révoquer l'invitation",
    delete_invitation_record: "Supprimer cet enregistrement d'invitation",
  },
  edit_modal: {
    title: 'Modifier les rôles de {{name}}',
  },
  delete_user_confirm: 'Êtes-vous sûr de vouloir supprimer cet utilisateur de ce locataire?',
  assign_admin_confirm:
    "Êtes-vous sûr de vouloir rendre le(s) utilisateur(s) sélectionné(s) administrateur? Accorder l'accès administrateur donnera au(x) utilisateur(s) les autorisations suivantes.<ul><li>Modifier le plan de facturation du locataire</li><li>Ajouter ou supprimer des collaborateurs</li><li>Supprimer le locataire</li></ul>",
  revoke_invitation_confirm: 'Êtes-vous sûr de vouloir révoquer cette invitation?',
  delete_invitation_confirm: "Êtes-vous sûr de vouloir supprimer cet enregistrement d'invitation?",
  messages: {
    invitation_sent: 'Invitation envoyée.',
    invitation_revoked: 'Invitation révoquée.',
    invitation_resend: 'Invitation renvoyée.',
    invitation_deleted: "Enregistrement de l'invitation supprimé.",
  },
  errors: {
    email_required: "L'adresse e-mail de l'invité est requise.",
    email_exists: "L'adresse e-mail existe déjà.",
    member_exists: 'Cet utilisateur est déjà membre de cette organisation.',
    pending_invitation_exists:
      "Une invitation en attente existe. Supprimez l'e-mail associé ou révoquez l'invitation.",
    invalid_email:
      "L'adresse e-mail est invalide. Veuillez vous assurer qu'elle est dans le bon format.",
    max_member_limit:
      'Vous avez atteint le nombre maximum de membres ({{limit}}) pour ce locataire.',
  },
};

export default Object.freeze(tenant_members);
