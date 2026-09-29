const organization = {
  require_membership: "L'utilisateur doit être membre de l'organisation pour continuer.",
  role_names_not_found:
    "Des noms de rôles non valides ont été détectés : {{names,list(type:conjunction)}}. Veuillez créer ces rôles d'abord avant de continuer.",
  invitation_status_not_changeable: "Le statut de l'invitation ne peut plus être modifié.",
  accepted_user_id_required:
    "L'`acceptedUserId` est requis lors de l'acceptation d'une invitation.",
  invitee_already_member: "L'invité est déjà membre de l'organisation.",
  accepted_user_email_mismatch:
    "L'utilisateur qui accepte doit avoir la même adresse e-mail que l'invité.",
  expires_at_in_future: 'La valeur de `expiresAt` doit être dans le futur.',
};

export default Object.freeze(organization);
