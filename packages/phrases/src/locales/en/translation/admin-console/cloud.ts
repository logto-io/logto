const cloud = {
  general: {
    onboarding: 'Onboarding',
  },
  welcome: {
    page_title: 'Welcome',
    title: "Welcome to Logto Cloud! We'd love to learn a bit about you.",
    description:
      'Let‘s make your Logto experience unique to you by getting to know you better. Your information is safe with us.',
    project_field: 'I’m using Logto for',
    project_options: {
      personal: 'Personal project',
      company: 'Company project',
    },
    title_field: 'Select applicable title(s)',
    title_options: {
      developer: 'Developer',
      team_lead: 'Team Lead',
      ceo: 'CEO',
      cto: 'CTO',
      product: 'Product',
      others: 'Others',
    },
    company_name_field: 'Company name',
    company_name_placeholder: 'Acme.co',
    company_size_field: 'How’s your company size?',
    company_options: {
      size_1: '1',
      size_2_49: '2-49',
      size_50_199: '50-199',
      size_200_999: '200-999',
      size_1000_plus: '1000+',
    },
    reason_field: 'I’m signing up because',
    reason_options: {
      passwordless: 'Finding passwordless authentication and UI kit',
      efficiency: 'Finding out-of-the-box identity infrastructure',
      access_control: 'Controlling user access based on roles and responsibilities',
      multi_tenancy: 'Seeking strategies for a multi-tenancy product',
      enterprise: 'Finding SSO solutions for enterprise readiness',
      others: 'Others',
    },
  },
  sie: {
    page_title: 'Customize sign-in experience',
    title: 'Let’s first customize your sign-in experience with ease',
    inspire: {
      title: 'Create compelling examples',
      description:
        'Feeling unsure about sign in experience? Just click the "Inspire Me" and let the magic happen!',
      inspire_me: 'Inspire me',
    },
    logo_field: 'App Logo',
    color_field: 'Brand color',
    identifier_field: 'Identifier',
    identifier_options: {
      email: 'Email',
      phone: 'Phone',
      user_name: 'Username',
    },
    authn_field: 'Authentication',
    authn_options: {
      password: 'Password',
      verification_code: 'Verification code',
    },
    social_field: 'Social sign in',
    finish_and_done: 'Finish and done',
    preview: {
      mobile_tab: 'Mobile',
      web_tab: 'Web',
    },
    connectors: {
      unlocked_later: 'Unlocked later',
      unlocked_later_tip:
        'Once you have completed the onboarding process and entered the product, you will have access to even more social sign-in methods.',
      notice:
        'Please avoid using the demo connector for production purposes. Once you’ve completed testing, kindly delete the demo connector and set up your own connector with your credentials.',
    },
  },
  socialCallback: {
    title: "You've successfully signed in",
    description:
      'You have successfully signed in using your social account. To ensure seamless integration and access to all the features of Logto, we recommend that you proceed to configure your own social connector.',
  },
  tenant: {
    create_tenant: 'Create tenant',
  },
};

export default Object.freeze(cloud);
