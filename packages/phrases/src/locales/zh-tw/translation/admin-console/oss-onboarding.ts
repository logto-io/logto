const oss_onboarding = {
  page_title: '入門',
  title: '簡單介紹一下你自己',
  description: '告訴我們一些關於你和你的專案的資訊，這將幫助我們為所有人打造更好的 Logto。',
  email: {
    label: '電子郵件地址',
    description: '如果我們需要就你的帳戶聯絡你，會使用這個電子郵件地址。',
    placeholder: 'email@example.com',
  },
  newsletter: '接收來自 Logto 的產品更新、安全通知和精選內容。',
  project: {
    label: '我使用 Logto 是為了',
    personal: '個人專案',
    company: '公司專案',
  },
  project_name: {
    label: '專案名稱',
    placeholder: '我的專案',
  },
  company_name: {
    label: '公司名稱',
    placeholder: 'Acme.co',
  },
  company_size: {
    label: '你的公司規模有多大？',
  },
  errors: {
    email_required: '電子郵件地址為必填項',
    email_invalid: '請輸入有效的電子郵件地址',
    project_name_too_long: '專案名稱不能超過 200 個字元',
  },
};

export default Object.freeze(oss_onboarding);
