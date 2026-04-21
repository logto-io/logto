const oss_onboarding = {
  page_title: 'オンボーディング',
  title: 'あなたについて少し教えてください',
  description:
    'あなた自身とプロジェクトについて少し教えてください。Logto をより良くするために役立ちます。',
  email: {
    label: 'メールアドレス',
    description: 'アカウントについて連絡が必要な場合、このアドレスを使用します。',
    placeholder: 'email@example.com',
  },
  newsletter: 'Logto から製品アップデート、セキュリティ通知、厳選コンテンツを受け取る。',
  project: {
    label: 'Logto の利用目的',
    personal: '個人プロジェクト',
    company: '会社のプロジェクト',
  },
  project_name: {
    label: 'プロジェクト名',
    placeholder: '私のプロジェクト',
  },
  company_name: {
    label: '会社名',
    placeholder: 'Acme.co',
  },
  company_size: {
    label: '会社の規模はどれくらいですか？',
  },
  errors: {
    email_required: 'メールアドレスは必須です',
    email_invalid: '有効なメールアドレスを入力してください',
  },
};

export default Object.freeze(oss_onboarding);
