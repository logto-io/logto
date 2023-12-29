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
    company_name_field: 'Company name',
    company_name_placeholder: 'Acme.co',
    /** UNTRANSLATED */
    stage_field: 'What stage is your product currently in?',
    stage_options: {
      /** UNTRANSLATED */
      new_product: 'Start a new project and looking for a quick, out-of-the-box solution',
      /** UNTRANSLATED */
      existing_product:
        'Migrate from current authentication (e.g., self-built, Auth0, Cognito, Microsoft)',
      /** UNTRANSLATED */
      target_enterprise_ready:
        'I just landed bigger clients and now make my product ready to sell to enterprises',
    },
    /** UNTRANSLATED */
    additional_features_field: 'Do you have anything else you want us to know?',
    additional_features_options: {
      /** UNTRANSLATED */
      customize_ui_and_flow:
        'Need the ability to bring my own UI, or customize my own flows via Logto API',
      /** UNTRANSLATED */
      compliance: 'SOC2 and GDPR are must-haves',
      /** UNTRANSLATED */
      export_user_data: 'Need the ability to export user data from Logto',
      /** UNTRANSLATED */
      budget_control: 'I have very tight budget control',
      /** UNTRANSLATED */
      bring_own_auth: 'Have my own auth services and just need some Logto features',
      /** UNTRANSLATED */
      others: 'None of these above',
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
