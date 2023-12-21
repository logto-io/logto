const organizations = {
  organization: '組織',
  page_title: '組織',
  title: '組織',
  subtitle:
    '組織とは、チーム、ビジネス顧客、およびパートナー企業で構成されるユーザーの集合体で、アプリケーションを使用します。',
  organization_template: 'Organization template',
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
    '組織はユーザーのグループであり、チーム、ビジネス顧客、およびパートナー企業を代表し、各ユーザーが「メンバー」です。これらはマルチテナント要件を処理するための基本的なエンティティです。',
  guide: {
    title: 'ガイドで始める',
    subtitle: 'ガイドを使って組織設定をスタートしましょう',
    introduction: {
      title: 'Logtoで組織がどのように機能するかを理解しましょう',
      section_1: {
        title: '組織はユーザー（アイデンティティ）のグループです',
      },
      section_2: {
        title: '組織テンプレートはマルチテナントアプリのアクセス制御向けに設計されています',
        description:
          'マルチテナントSaaSアプリケーションでは、複数の組織がしばしば同じアクセス制御テンプレートを共有します。これには権限や役割が含まれます。Logtoではこれを「組織テンプレート」と呼びます。',
        permission_description:
          '組織権限とは、組織のコンテキストでリソースにアクセスするための承認です。',
        role_description:
          '組織役割は、ユーザーに割り当てることができる権限のグループ化です。権限は事前に定義された組織権限から取得する必要があります。',
      },
      section_3: {
        title: 'イラストを操作して、接続方法を確認してください',
        description:
          '例として、John、Sarahは異なる組織に所属し、それぞれ異なる組織のコンテキストで異なる役割を担っています。異なるモジュールにカーソルを合わせて、それぞれの動作を確認しましょう。',
      },
    },
    step_1: 'ステップ1：組織権限を定義する',
    step_2: 'ステップ2：組織役割を定義する',
    step_3: 'ステップ3：最初の組織を作成する',
    step_3_description:
      '最初の組織を作成しましょう。これにはユニークなIDが付いており、さまざまなビジネスに関連するエンティティを取り扱うコンテナとなります。',
    more_next_steps: 'その他の次のステップ',
    add_members: '組織にメンバーを追加',
    add_members_action: 'メンバーを一括追加して役割を割り当てる',
    organization_permissions: '組織権限',
    permission_name: '権限名',
    permissions: '権限',
    organization_roles: '組織役割',
    role_name: '役割名',
    organization_name: '組織名',
    admin: '管理者',
    member: 'メンバー',
    guest: 'ゲスト',
    role_description: '役割「{{role}}」は、異なる組織で同じ組織テンプレートを共有しています。',
    john: 'John',
    john_tip:
      'Johnは、異なる組織に所属し、単一の識別子として「john@email.com」のメールアドレスを持っています。彼は組織Aの管理者であり、組織Bのゲストでもあります。',
    sarah: 'Sarah',
    sarah_tip:
      'Sarahは、単一の識別子として「sarah@email.com」のメールアドレスを持つ1つの組織に属しています。彼女は組織Bの管理者です。',
  },
};

export default Object.freeze(organizations);
