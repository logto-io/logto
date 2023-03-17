const cloud = {
  welcome: {
    title: 'Welcome and let’s create your own Logto Cloud Preview',
    description:
      'Whether you’re an open-source or cloud user, take a tour of the showcase and experience the full value of Logto. Cloud preview also serves as a preliminary version of Logto Cloud.',
    project_field: 'I’m using Logto for',
    project_options: {
      personal: 'Personal project',
      company: 'Company project',
    },
    deployment_type_field: 'Prefer open-source or cloud?',
    deployment_type_options: {
      open_source: 'Open-Source',
      cloud: 'Cloud',
    },
  },
  about: {
    title: 'A little bit about you',
    description:
      'Let‘s make your Logto experience unique to you by getting to know you better. Your information is safe with us.',
    title_field: 'Your title',
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
  congrats: {
    title: 'Great news! You are qualified to earn Logto Cloud early credit!',
    description:
      'Don’t miss out on a chance to enjoy a free <strong>60 days</strong> subscription to Logto Cloud after its official launch! Contact the Logto team now to learn more.',
    check_out_button: 'Check out the live preview',
    reserve_title: 'Reserve your time with Logto team',
    reserve_description: 'Credit is only eligible once upon validation.',
    book_button: 'Schedule now',
    join_description: 'Join our public <a>{{link}}</a> to connect and chat with other developers.',
    discord_link: 'discord channel',
    enter_admin_console: 'Enter Logto Cloud Preview',
  },
  gift: {
    title: 'Use Logto Cloud free for 60 days. Join the front-runners now!',
    description: 'Book a one-on-one session with our team for early credit.',
    reserve_title: 'Reserve your time with Logto team',
    reserve_description: 'Credit is only eligible once upon evaluation.',
    book_button: 'Book',
  },
  sie: {
    title: 'Let’s first customize your experience with ease',
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
  broadcast: '📣 You are participating in Logto Cloud Preview',
  socialCallback: {
    title: "You've successfully signed in!",
    description:
      'You have successfully signed in using your social account. To ensure seamless integration and access to all the features of Logto, we recommend that you proceed to configure your own social connector.',
  },
};

export default cloud;
