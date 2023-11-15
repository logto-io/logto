const organizations = {
  /** UNTRANSLATED */
  organization: 'Organization',
  page_title: '組織',
  title: '組織',
  subtitle:
    'チーム、ビジネス顧客、およびパートナー企業を表すものであり、組織としてアプリケーションにアクセスします。',
  organization_id: '組織ID',
  members: 'メンバー',
  create_organization: '組織を作成',
  setup_organization: '組織を設定',
  organization_list_placeholder_title: '組織',
  organization_list_placeholder_text:
    '組織は、通常、SaaSまたはSaaSのようなマルチテナントアプリで使用されます。組織機能により、B2B顧客はパートナーや顧客をよりよく管理し、エンドユーザーがアプリケーションにアクセスする方法をカスタマイズできます。',
  organization_name_placeholder: '私の組織',
  organization_description_placeholder: '組織の簡単な説明',
  organization_permission: '組織権限',
  organization_permission_other: '組織権限',
  organization_permission_description:
    '組織権限とは、組織のコンテキストでリソースにアクセスするための承認を指します。組織権限は、意味のある文字列として表され、また名前および一意の識別子としても機能します。',
  organization_permission_delete_confirm:
    'この権限を削除すると、この権限を含むすべての組織ロールがこの権限を失い、この権限を持っていたユーザーはそのアクセスを失います。',
  create_permission_placeholder: '任命履歴を読む',
  permission: '権限',
  permission_other: '権限',
  organization_role: '組織役割',
  organization_role_other: '組織役割',
  organization_role_description:
    '組織役割は、ユーザーに割り当てることができる権限のグループ化です。権限は事前に定義された組織権限から取得する必要があります。',
  organization_role_delete_confirm:
    'これを行うと、影響を受けるユーザーからこの役割に関連する権限が削除され、組織ロール、組織のメンバー、および組織権限の関係が削除されます。',
  role: '役割',
  create_role_placeholder: '閲覧のみの権限を持つユーザー',
  search_placeholder: '組織名またはIDで検索',
  search_permission_placeholder: '検索して権限を選択',
  search_role_placeholder: '検索して役割を選択',
  empty_placeholder: '🤔 You don’t have any {{entity}} set up yet.',
  /** UNTRANSLATED */
  organization_and_member: 'Organization and member',
  /** UNTRANSLATED */
  organization_and_member_description:
    'Organization is a group of users and can represent the teams, business customers, and partner companies, with each user being a "Member". Those can be fundamental entities to handle your multi-tenant requirements.',
  guide: {
    title: 'ガイドで始める',
    subtitle: 'ガイドを使用してアプリの開発プロセスをスタートさせます',
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
        title: 'イラストを操作して、接続方法を確認してください',
        description:
          "Let's take an example. John, Sarah are in different organizations with different roles in the context of different organizations. Hover over the different modules and see what happens.",
      },
    },
    step_1: 'ステップ1：組織権限を定義する',
    step_2: 'ステップ2：組織役割を定義する',
    step_2_description:
      '「組織役割」は、最初に各組織に付与された一連の役割を表します。これらの役割は、前のスクリーンで設定したグローバルな権限によって決定されます。組織権限と同様に、初回設定が完了すると、新しい組織を作成するたびにこれを毎回行う必要はありません。',
    step_3: 'ステップ3：最初の組織を作成する',
    step_3_description:
      "Let's create your first organization. It comes with a unique ID and serves as a container for handling various more business-toward identities, such as partners, customers, and their access control.",
    /** UNTRANSLATED */
    more_next_steps: 'More next steps',
    /** UNTRANSLATED */
    add_members: 'Add members to your organization',
    /** UNTRANSLATED */
    add_members_action: 'Bulk add members and assign roles',
    /** UNTRANSLATED */
    add_enterprise_connector: 'Add enterprise SSO',
    /** UNTRANSLATED */
    add_enterprise_connector_action: 'Set up enterprise SSO',
    /** UNTRANSLATED */
    organization_permissions: 'Organization permissions',
    /** UNTRANSLATED */
    permission_name: 'Permission name',
    /** UNTRANSLATED */
    permissions: 'Permissions',
    /** UNTRANSLATED */
    organization_roles: 'Organization roles',
    /** UNTRANSLATED */
    role_name: 'Role name',
    /** UNTRANSLATED */
    organization_name: 'Organization name',
    /** UNTRANSLATED */
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
