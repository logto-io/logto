const organizations = {
  page_title: 'Organisationen',
  title: 'Organisationen',
  subtitle:
    'Vertreten Sie die Teams, Geschäftskunden und Partnerunternehmen, die über Ihre Anwendungen als Organisationen zugreifen.',
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
  guide: {
    title: 'Starten Sie mit Anleitungen',
    subtitle: 'Starten Sie Ihren App-Entwicklungsprozess mit unseren Anleitungen',
    introduction: {
      section_1: {
        title: 'Zunächst einmal sollten Sie verstehen, wie Organisationen in Logto funktionieren',
        description:
          'In Multi-Tenant-SaaS-Anwendungen erstellen wir oft mehrere Organisationen mit demselben Satz von Berechtigungen und Rollen, aber im Kontext einer Organisation kann es eine wichtige Rolle spielen, um unterschiedliche Zugriffsebenen zu steuern. Denken Sie daran, dass jeder Mandant wie eine Logto-Organisation ist und sie natürlicherweise dieselbe Zugriffskontroll-“Vorlage” teilen. Wir nennen dies die "Organisation-Vorlage".',
      },
      section_2: {
        title: 'Die Organisation-Vorlage besteht aus zwei Teilen',
        organization_permission_description:
          'Eine Organisationsberechtigung bezieht sich auf die Autorisierung zum Zugriff auf eine Ressource im Kontext der Organisation. Eine Organisationsberechtigung sollte als aussagekräftiger String repräsentiert werden, der auch als Name und eindeutiger Bezeichner dient.',
        organization_role_description:
          'Eine Organisationsrolle ist eine Gruppierung von Berechtigungen, die Benutzern zugewiesen werden können. Die Berechtigungen müssen aus den vordefinierten Organisationsberechtigungen stammen.',
      },
      section_3: {
        title: 'Interagieren Sie mit der Abbildung, um zu sehen, wie alles zusammenhängt',
        description:
          'Nehmen wir ein Beispiel. John, Sarah und Tony gehören unterschiedlichen Organisationen an, mit unterschiedlichen Rollen im Kontext unterschiedlicher Organisationen. Zeigen Sie auf die verschiedenen Module und sehen Sie, was passiert.',
      },
    },
    step_1: 'Schritt 1: Organisationsberechtigungen definieren',
    step_2: 'Schritt 2: Organisationsrollen definieren',
    step_2_description:
      '"Organisation-Rollen" repräsentieren einen Satz von Rollen, die jeder Organisation zu Beginn zugewiesen werden. Diese Rollen werden durch die globalen Berechtigungen bestimmt, die Sie in der vorherigen Ansicht festgelegt haben. Ähnlich wie bei den Org-Berechtigungen müssen Sie diese Einstellung nach dem ersten Mal nicht mehr jedes Mal durchführen, wenn Sie eine neue Organisation erstellen.',
    step_3: 'Schritt 3: Erstellen Sie Ihre erste Organisation',
    step_3_description:
      'Erstellen Sie Ihre erste Organisation. Sie erhält eine eindeutige ID und dient als Container zur Verwaltung verschiedener identitätsbezogener Elemente wie Partner, Kunden und deren Zugriffskontrolle.',
    more_next_steps: 'Weitere Schritte',
    add_members: 'Fügen Sie Mitglieder zu Ihrer Organisation hinzu',
    add_members_action: 'Massenhafte Mitglieder hinzufügen und Rollen zuweisen',
    add_enterprise_connector: 'Unternehmens-SSO hinzufügen',
    add_enterprise_connector_action: 'Einrichten des Unternehmens-SSO',
    organization_permissions: 'Organisationsberechtigungen',
    permission_name: 'Berechtigungsname',
    permissions: 'Berechtigungen',
    organization_roles: 'Organisationsrollen',
    role_name: 'Rollenname',
    organization_name: 'Organisationsname',
    admin: 'Admin',
    admin_description:
      'Die Rolle "Admin" teilt sich über verschiedene Organisationen hinweg dieselbe Organisationsvorlage.',
    member: 'Mitglied',
    member_description:
      'Die Rolle "Mitglied" teilt sich über verschiedene Organisationen hinweg dieselbe Organisationsvorlage.',
    guest: 'Gast',
    guest_description:
      'Die Rolle "Gast" teilt sich über verschiedene Organisationen hinweg dieselbe Organisationsvorlage.',
    create_more_roles:
      'Sie können in den Einstellungen der Organisationsvorlage weitere Rollen erstellen. Diese Organisationsrollen gelten für verschiedene Organisationen.',
    read_resource: 'read:resource',
    edit_resource: 'edit:resource',
    delete_resource: 'delete:resource',
    ellipsis: '……',
    johnny:
      'Johnny gehört zwei Organisationen an und hat die E-Mail-Adresse "john@email.com" als einzigen Identifier. Er ist Admin der Organisation A und Gast der Organisation B.',
    sarah:
      'Sarah gehört einer Organisation an und hat die E-Mail-Adresse "sarah@email.com" als einzigen Identifier. Sie ist Admin der Organisation B.',
    tony: 'Tony gehört einer Organisation an und hat die E-Mail-Adresse "tony@email.com" als einzigen Identifier. Er ist Mitglied der Organisation C.',
  },
};

export default Object.freeze(organizations);
