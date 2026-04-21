const oss_onboarding = {
  page_title: 'Onboarding',
  title: 'Bize biraz kendinizden bahsedin',
  description:
    'Bize kendinizden ve projenizden biraz bahsedin. Bu, herkes icin daha iyi bir Logto oluşturmamiza yardimci olur.',
  email: {
    label: 'E-posta adresi',
    description: 'Hesabinizla ilgili sizinle iletisime gecmemiz gerekirse bu adresi kullanacagiz.',
    placeholder: 'email@example.com',
  },
  newsletter:
    'Logto’dan urun guncellemeleri, guvenlik bildirimleri ve ozenle secilmis icerikler alin.',
  project: {
    label: 'Logto’yu su amacla kullaniyorum',
    personal: 'Kisisel proje',
    company: 'Sirket projesi',
  },
  company_name: {
    label: 'Sirket adi',
    placeholder: 'Acme.co',
  },
  company_size: {
    label: 'Sirketinizin buyuklugu nedir?',
  },
  errors: {
    email_required: 'E-posta adresi gerekli',
    email_invalid: 'Gecerli bir e-posta adresi girin',
  },
};

export default Object.freeze(oss_onboarding);
