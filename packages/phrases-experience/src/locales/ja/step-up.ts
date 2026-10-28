const step_up = {
  verify_your_identity: '本人確認',
  choose_method_description: '続行するには、次のいずれかの方法で本人確認を行ってください。',
  password: 'パスワード',
  password_description: 'アカウントのパスワードを入力',
  enter_password_description: '続行するには、アカウントのパスワードを入力してください。',
  enter_verification_code_description: '{{identifier}} に送信された確認コードを入力してください。',
  subject_proof_description:
    '続行するには、あなたのアカウントにリンクされたアカウントで本人確認を行ってください。その後、認証方法を設定できます。',
  subject_mismatch: 'アカウントが一致しません',
  subject_mismatch_description:
    '使用したアカウントはあなたのアカウントにリンクされていません。リンク済みのアカウントを使用し、必要に応じてプロバイダーでアカウントを切り替えてください。',
  no_method_available: '利用可能な認証方法がありません',
  no_method_available_description:
    'お使いのアカウントには、この認証を完了できる方法がありません。管理者にお問い合わせください。',
};

export default Object.freeze(step_up);
