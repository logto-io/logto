const organizations = {
  organization: '組織',
  page_title: '組織',
  title: '組織',
  subtitle:
    '組織は、チーム、ビジネスクライアント、およびパートナー企業が貴社のアプリケーションを使用するユーザーの集まりです。',
  organization_template: '組織テンプレート',
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
  organization_and_member: '組織とメンバー',
  organization_and_member_description:
    '組織はユーザーの集まりであり、チーム、ビジネス顧客、パートナー企業を表しており、各ユーザーが「メンバー」となります。これらは貴社のマルチテナント要件を処理するための基本的な実体となることがあります。',
  guide: {
    title: 'ガイドで始める',
    subtitle: 'ガイドを活用して組織設定をスタートしましょう',
    introduction: {
      title: 'Logtoでの組織の動作を理解しましょう',
      section_1: {
        title: '組織はユーザー（アイデンティティ）のグループです',
      },
      section_2: {
        title: '組織テンプレートはマルチテナントアプリのアクセス制御に設計されています',
        description:
          'マルチテナントSaaSアプリケーションでは、複数の組織がしばしば同じアクセス制御テンプレートを共有することがよくあります。これは、アクセス権限と役割を含みます。Logtoでは、これを"組織テンプレート"と呼んでいます。',
        permission_description:
          '組織権限は、組織のコンテキストでリソースにアクセスするための承認を指します。',
        role_description: '組織役割は、メンバーに割り当てることができる組織権限のグループ化です。',
      },
      section_3: {
        title: 'イラストを操作して、接続方法を確認してください',
        description:
          '例えば、John、Sarahはそれぞれ異なる組織に異なる役割で属しています。異なる組織のコンテキストにおけるそれぞれのモジュールにホバーして、その結果を確認してください。',
      },
    },
    step_1: 'ステップ1：組織権限を定義する',
    step_2: 'ステップ2：組織役割を定義する',
    step_3: 'ステップ3：最初の組織を作成する',
    step_3_description:
      '最初の組織を作成しましょう。これには一意のIDが付属し、様々なビジネス向けのアイデンティティを処理するためのコンテナとして機能します。',
    more_next_steps: 'さらなる次のステップ',
    add_members: '組織にメンバーを追加する',
    add_members_action: '複数のメンバーを追加して役割を割り当てる',
    organization_permissions: '組織権限',
    permission_name: '権限名',
    permissions: '権限',
    organization_roles: '組織役割',
    role_name: '役割名',
    organization_name: '組織名',
    admin: '管理者',
    member: 'メンバー',
    guest: 'ゲスト',
    role_description: '役割"{{role}}"は異なる組織をまたいで同じ組織テンプレートを共有します。',
    john: 'ジョン',
    john_tip:
      'ジョンは電子メールアドレス"john@email.com"で単一の識別子として2つの組織に属しています。組織Aの管理者であり、組織Bのゲストでもあります。',
    sarah: 'サラ',
    sarah_tip:
      'サラは電子メールアドレス"sarah@email.com"で単一の識別子として1つの組織に属しています。組織Bの管理者です。',
  },
};

export default Object.freeze(organizations);
