const oss_onboarding = {
  page_title: '入门',
  title: '简单介绍一下你自己',
  description: '告诉我们一点关于你和你的项目的信息，这将帮助我们为所有人打造更好的 Logto。',
  email: {
    label: '邮箱地址',
    description: '如果我们需要就你的账户联系你，会使用这个邮箱地址。',
    placeholder: 'email@example.com',
  },
  newsletter: '接收来自 Logto 的产品更新、安全通知和精选内容。',
  project: {
    label: '我使用 Logto 是为了',
    personal: '个人项目',
    company: '公司项目',
  },
  company_name: {
    label: '公司名称',
    placeholder: 'Acme.co',
  },
  company_size: {
    label: '你的公司规模有多大？',
  },
  errors: {
    email_required: '邮箱地址为必填项',
    email_invalid: '请输入有效的邮箱地址',
    company_name_required: '公司名称为必填项',
    company_size_required: '公司规模为必填项',
  },
};

export default Object.freeze(oss_onboarding);
