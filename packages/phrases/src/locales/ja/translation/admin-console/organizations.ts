const organizations = {
  organization: '組織',
  page_title: '組織',
  title: '組織',
  subtitle:
    '組織は通常、SaaSや類似したマルチテナントアプリで使用され、お客様（チーム、組織、または企業全体）を代表します。 組織はB2B認証および承認の基本的な要素として機能します。',
  organization_template: '組織テンプレート',
  organization_id: '組織ID',
  members: 'メンバー',
  create_organization: '組織を作成',
  setup_organization: '組織を設定',
  organization_list_placeholder_title: '組織',
  organization_list_placeholder_text:
    '組織はSaaSや類似したマルチテナントアプリでよく使用され、クライアントが組織を作成・管理し、メンバーを招待し、役割を割り当てるようなアプリを開発できるようにします。',
  organization_name_placeholder: '私の組織',
  organization_description_placeholder: '組織の簡単な説明',
  organization_permission: '組織権限',
  organization_permission_other: '組織権限',
  create_permission_placeholder: '任命履歴を読む',
  organization_role: '組織役割',
  organization_role_other: '組織役割',
  organization_role_description:
    '組織役割は、ユーザーに割り当てることができる権限のグループ化です。権限は事前に定義された組織権限から取得する必要があります。',
  role: '役割',
  search_placeholder: '組織名またはIDで検索',
  search_role_placeholder: '検索して役割を選択',
  empty_placeholder: '🤔 あなたはまだ{{entity}}を設定していません。',
  organization_and_member: '組織とメンバー',
  organization_and_member_description:
    '組織はユーザーのグループであり、チーム、ビジネス顧客、およびパートナー企業を代表し、各ユーザーが「メンバー」です。 これらはマルチテナント要件を処理するための基本的なエンティティです。',
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
        role_description_deprecated:
          '組織役割は、ユーザーに割り当てることができる権限のグループ化です。権限は事前に定義された組織権限から取得する必要があります。',
        role_description:
          '組織の役割は、メンバーに割り当てることができる組織の権限またはAPIの権限のグループです。',
      },
      section_3: {
        title: '組織の役割にAPI権限を割り当てることはできますか？',
        description:
          'はい、組織の役割にAPI権限を割り当てることができます。 Logtoは組織の役割を効果的に管理する柔軟性を提供し、それらの役割に組織権限とAPI権限の両方を含めることができます。',
      },
      section_4: {
        title: 'イラストを操作して、接続方法を確認してください',
        description:
          '例として、John、Sarahは異なる組織に所属し、それぞれ異なる組織のコンテキストで異なる役割を担っています。 異なるモジュールにカーソルを合わせて、それぞれの動作を確認しましょう。',
      },
    },
    organization_permissions: '組織権限',
    organization_roles: '組織役割',
    admin: '管理者',
    member: 'メンバー',
    guest: 'ゲスト',
    role_description: '役割「{{role}}」は、異なる組織で同じ組織テンプレートを共有しています。',
    john: 'John',
    john_tip:
      'Johnは、異なる組織に所属し、単一の識別子として「john@email.com」のメールアドレスを持っています。 彼は組織Aの管理者であり、組織Bのゲストでもあります。',
    sarah: 'Sarah',
    sarah_tip:
      'Sarahは、単一の識別子として「sarah@email.com」のメールアドレスを持つ1つの組織に属しています。 彼女は組織Bの管理者です。',
  },
};

export default Object.freeze(organizations);
