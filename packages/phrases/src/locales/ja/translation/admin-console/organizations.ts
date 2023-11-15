const organizations = {
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
  guide: {
    title: 'ガイドで始める',
    subtitle: 'ガイドを使用してアプリの開発プロセスをスタートさせます',
    introduction: {
      section_1: {
        title: 'まず、Logtoで組織がどのように機能するかを理解しましょう',
        description:
          'マルチテナントのSaaSアプリでは、しばしば同じセットの権限と役割を持つ複数の組織を作成しますが、組織のコンテキストではさまざまなアクセスレベルを制御するのに重要な役割を果たすことができます。各テナントはLogto組織のようであり、自然に同じアクセス制御の「テンプレート」を共有します。これを「組織テンプレート」と呼びます。',
      },
      section_2: {
        title: '組織テンプレートは2つの部分で構成されます',
        organization_permission_description:
          '組織権限とは、組織のコンテキストでリソースにアクセスするための承認を指します。組織権限は、意味のある文字列として表され、また名前および一意の識別子としても機能します。',
        organization_role_description:
          '組織役割は、ユーザーに割り当てることができる権限のグループ化です。権限は事前に定義された組織権限から取得する必要があります。',
      },
      section_3: {
        title: 'イラストを操作して、接続方法を確認してください',
        description:
          '例を挙げましょう。ジョン、サラ、トニーはそれぞれ異なる組織に所属し、それぞれ異なる役割を持っています。異なる組織のコンテキストで、異なるアクセスを持っていることを確認してください。',
      },
    },
    step_1: 'ステップ1：組織権限を定義する',
    step_2: 'ステップ2：組織役割を定義する',
    step_2_description:
      '「組織役割」は、最初に各組織に付与された一連の役割を表します。これらの役割は、前のスクリーンで設定したグローバルな権限によって決定されます。組織権限と同様に、初回設定が完了すると、新しい組織を作成するたびにこれを毎回行う必要はありません。',
    step_3: 'ステップ3：最初の組織を作成する',
    step_3_description:
      '最初の組織を作成しましょう。これには固有のIDが付いており、パートナーや顧客などさまざまなビジネス向けアイデンティティの取り扱いを行うためのコンテナとして機能します。',
    more_next_steps: 'さらに次のステップ',
    add_members: '組織にメンバーを追加する',
    add_members_action: 'メンバーを一括追加して役割を割り当てる',
    add_enterprise_connector: 'エンタープライズSSOを追加',
    add_enterprise_connector_action: 'エンタープライズSSOを設定',
    organization_permissions: '組織権限',
    permission_name: '権限名',
    permissions: '権限',
    organization_roles: '組織役割',
    role_name: '役割名',
    organization_name: '組織名',
    admin: '管理者',
    admin_description: '役割「管理者」は、さまざまな組織で同じ組織テンプレートを共有します。',
    member: 'メンバー',
    member_description: '役割「メンバー」は、さまざまな組織で同じ組織テンプレートを共有します。',
    guest: 'ゲスト',
    guest_description: '役割「ゲスト」は、さまざまな組織で同じ組織テンプレートを共有します。',
    create_more_roles:
      '組織テンプレート設定でさらに多くの役割を作成できます。これらの組織役割は異なる組織に適用されます。',
    read_resource: 'read:resource',
    edit_resource: 'edit:resource',
    delete_resource: 'delete:resource',
    ellipsis: '……',
    johnny:
      'ジョニーは、メールアドレス「john@email.com」を通じて2つの組織に所属しています。組織Aの管理者であり、組織Bのゲストです。',
    sarah:
      'サラは、メールアドレス「sarah@email.com」を通じて1つの組織に所属しています。組織Bの管理者です。',
    tony: 'トニーは、メールアドレス「tony@email.com」を通じて1つの組織に所属しています。組織Cのメンバーです。',
  },
};

export default Object.freeze(organizations);
