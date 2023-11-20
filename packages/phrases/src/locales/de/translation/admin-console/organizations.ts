const organizations = {
  /** UNTRANSLATED */
  organization: 'Organization',
  page_title: 'Organisationen',
  title: 'Organisationen',
  /** UNTRANSLATED */
  subtitle:
    'An organization is a collection of users which includes teams, business clients, and partner firms that use your applications.',
  /** UNTRANSLATED */
  organization_template: 'Organization template',
  organization_id: 'Organisations-ID',
  members: 'Mitglieder',
  create_organization: 'Organisation erstellen',
  setup_organization: 'Richten Sie Ihre Organisation ein',
  organization_list_placeholder_title: 'Organisation',
  organization_list_placeholder_text:
    'Organisation wird normalerweise in SaaS- oder SaaS-ähnlichen Multi-Tenancy-Anwendungen verwendet. Die Funktion "Organisationen" ermöglicht es Ihren B2B-Kunden, ihre Partner und Kunden besser zu verwalten und die Art und Weise anzupassen, wie Endbenutzer auf ihre Anwendungen zugreifen.',
  organization_name_placeholder: 'Meine Organisation',
  organization_description_placeholder: 'Eine kurze Beschreibung der Organisation',
  organization_permission: 'Organisationsberechtigung',
  organization_permission_other: 'Organisationsberechtigungen',
  organization_permission_description:
    'Eine Organisationsberechtigung bezieht sich auf die Autorisierung zum Zugriff auf eine Ressource im Kontext der Organisation. Eine Organisationsberechtigung sollte als aussagekräftiger String repräsentiert werden, der auch als Name und eindeutiger Bezeichner dient.',
  organization_permission_delete_confirm:
    'Wenn diese Berechtigung gelöscht wird, verlieren alle Organisationsrollen, einschließlich dieser Berechtigung, diese Berechtigung. Benutzer, die diese Berechtigung hatten, verlieren den Zugriff, der durch sie gewährt wurde.',
  create_permission_placeholder: 'Terminkalenderverlauf lesen',
  permission: 'Berechtigung',
  permission_other: 'Berechtigungen',
  organization_role: 'Organisationsrolle',
  organization_role_other: 'Organisationsrollen',
  organization_role_description:
    'Eine Organisationsrolle ist eine Gruppierung von Berechtigungen, die Benutzern zugewiesen werden können. Die Berechtigungen müssen aus den vordefinierten Organisationsberechtigungen stammen.',
  organization_role_delete_confirm:
    'Dadurch werden die mit dieser Rolle verbundenen Berechtigungen von den betroffenen Benutzern entfernt und die Beziehungen zwischen Organisationsrollen, Mitgliedern in der Organisation und Organisationsberechtigungen gelöscht.',
  role: 'Rolle',
  create_role_placeholder: 'Benutzer mit nur Lesezugriff',
  search_placeholder: 'Nach Organisation suchen',
  search_permission_placeholder: 'Geben Sie zum Suchen und Auswählen von Berechtigungen ein',
  search_role_placeholder: 'Geben Sie zum Suchen und Auswählen von Rollen ein',
  empty_placeholder: '🤔 Sie haben noch keine {{entity}} eingerichtet.',
  /** UNTRANSLATED */
  organization_and_member: 'Organization and member',
  /** UNTRANSLATED */
  organization_and_member_description:
    'Organization is a group of users and can represent the teams, business customers, and partner companies, with each user being a "Member". Those can be fundamental entities to handle your multi-tenant requirements.',
  guide: {
    title: 'Starten Sie mit Anleitungen',
    /** UNTRANSLATED */
    subtitle: 'Jumpstart your organization settings with our guides',
    introduction: {
      /** UNTRANSLATED */
      title: "Let's understand how organization works in Logto",
      section_1: {
        /** UNTRANSLATED */
        title: 'An organization is a group of users (identities)',
      },
      section_2: {
        /** UNTRANSLATED */
        title: 'Organization template is designed for multi-tenant apps access control',
        /** UNTRANSLATED */
        description:
          'In multi-tenant SaaS applications, multiple organizations often share the same access control template, which includes permissions and roles. In Logto, we call it "organization template."',
        /** UNTRANSLATED */
        permission_description:
          'Organization permission refers to the authorization to access a resource in the context of organization.',
        /** UNTRANSLATED */
        role_description:
          'Organization role is a grouping of organization permissions that can be assigned to members.',
      },
      section_3: {
        title: 'Interagieren Sie mit der Abbildung, um zu sehen, wie alles zusammenhängt',
        description:
          "Let's take an example. John, Sarah are in different organizations with different roles in the context of different organizations. Hover over the different modules and see what happens.",
      },
    },
    step_1: 'Schritt 1: Organisationsberechtigungen definieren',
    step_2: 'Schritt 2: Organisationsrollen definieren',
    step_3: 'Schritt 3: Erstellen Sie Ihre erste Organisation',
    /** UNTRANSLATED */
    step_3_description:
      "Let's create your first organization. It comes with a unique ID and serves as a container for handling various more business-toward identities.",
    more_next_steps: 'Weitere Schritte',
    add_members: 'Fügen Sie Mitglieder zu Ihrer Organisation hinzu',
    add_members_action: 'Massenhafte Mitglieder hinzufügen und Rollen zuweisen',
    organization_permissions: 'Organisationsberechtigungen',
    permission_name: 'Berechtigungsname',
    permissions: 'Berechtigungen',
    organization_roles: 'Organisationsrollen',
    role_name: 'Rollenname',
    organization_name: 'Organisationsname',
    admin: 'Admin',
    /** UNTRANSLATED */
    member: 'Member',
    /** UNTRANSLATED */
    guest: 'Guest',
    /** UNTRANSLATED */
    role_description:
      'Role "{{role}}" shares the same organization template across different organizations.',
    /** UNTRANSLATED */
    john: 'John',
    /** UNTRANSLATED */
    john_tip:
      'John belongs to two organizations with the email "john@email.com" as the single identifier. He is the admin of organization A as well as the guest of organization B.',
    /** UNTRANSLATED */
    sarah: 'Sarah',
    /** UNTRANSLATED */
    sarah_tip:
      'Sarah belongs to one organization with the email "sarah@email.com" as the single identifier. She is the admin of organization B.',
  },
};

export default Object.freeze(organizations);
