const cloud = {
  console_sso: {
    back_to_list: 'Retour au SSO de la console',
    create: 'Ajouter un connecteur',
    title: 'SSO de la console',
    description:
      'Configurez votre propre fournisseur d’identité pour vous connecter à Logto Console avec l’authentification unique.',
    domain_bound: 'Associé',
    domain_pending: 'Vérification en cours',
    domain_add_placeholder: 'Ajouter un domaine de messagerie',
    domain_membership_notice:
      'Les domaines vérifiés contrôlent la découverte SSO de Logto Cloud Console. Ils ne donnent pas accès aux tenants.',
    domain_bound_description:
      'Ce domaine est actif pour Console SSO. Son enregistrement TXT de vérification a été supprimé.',
    domain_dns_instructions:
      'Ajoutez cet enregistrement TXT chez votre fournisseur DNS pour vérifier la propriété du domaine.',
    domain_waiting_for_dns:
      'En attente de l’enregistrement TXT. Nous vérifions à nouveau toutes les 10 secondes.',
    domain_proven_unbound:
      'La propriété du domaine est vérifiée, mais son association est incomplète. Résolvez le problème et réessayez.',
    domain_remove_description:
      'Supprimer {{domain}} de Console SSO ? La suppression d’un domaine associé arrête la découverte SSO pour ses adresses e-mail.',
    domain_invalid: 'Saisissez un domaine de messagerie valide.',
    domain_conflict: 'Ce domaine est déjà associé à un autre connecteur Console SSO.',
    domain_invalid_provider: 'Terminez la configuration de connexion avant d’associer ce domaine.',
    domain_dns_timeout: 'La vérification DNS a échoué. Nous réessaierons automatiquement.',
    domain_recovery:
      'La modification du domaine est incomplète. Relancez la vérification pour la terminer.',
    start_over: 'Recommencer',
    start_over_confirmation:
      'Recommencer peut supprimer votre configuration SSO inachevée. Voulez-vous continuer ?',
    resume_creation:
      'Une création inachevée a été trouvée. Continuez avec le même fournisseur pour récupérer ce connecteur.',
  },
  general: {
    onboarding: 'Intégration',
  },
  create_tenant: {
    page_title: 'Créer un locataire',
    title: 'Créez votre premier locataire',
    description:
      'Un locataire est un environnement isolé où vous pouvez gérer les identités des utilisateurs, les applications et toutes les autres ressources Logto.',
    invite_collaborators: 'Invitez vos collaborateurs par e-mail',
    hear_about_us: {
      title: 'Comment avez-vous entendu parler de Logto pour la première fois ?',
      detail_placeholder: 'Dites-nous en plus (facultatif)',
      options: {
        search_engine: 'Moteur de recherche (Google, Bing...)',
        ai_assistant: 'Assistant IA (ChatGPT, Claude, Gemini...)',
        github_oss: 'GitHub ou annuaires open source',
        friend_colleague: 'Un ami ou un collègue',
        powered_by: "Page de connexion d'une application utilisant Logto",
        content_social: 'Réseaux sociaux, article ou vidéo (YouTube, X, Reddit...)',
        other: 'Autre',
      },
    },
  },
  social_callback: {
    title: 'Connexion réussie',
    description:
      'Vous vous êtes connecté avec succès en utilisant votre compte social. Pour assurer une intégration fluide et accéder à toutes les fonctionnalités de Logto, nous vous recommandons de configurer votre propre connecteur social.',
    notice:
      "Veuillez éviter d'utiliser le connecteur de démonstration à des fins de production. Une fois que vous aurez terminé les tests, veuillez supprimer le connecteur de démonstration et configurer votre propre connecteur avec vos identifiants.",
  },
  tenant: {
    create_tenant: 'Créer un locataire',
  },
};

export default Object.freeze(cloud);
