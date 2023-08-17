const applications = {
  page_title: 'Applications',
  title: 'Applications',
  subtitle:
    'Set up Logto authentication for your native, single page, machine to machine, or traditional application',
  subtitle_with_app_type: 'Set up Logto authentication for your {{name}} application',
  create: 'Create Application',
  application_name: 'Application name',
  application_name_placeholder: 'My App',
  application_description: 'Application description',
  application_description_placeholder: 'Enter your application description',
  select_application_type: 'Select an application type',
  no_application_type_selected: 'You haven’t selected any application type yet',
  application_created:
    'The application {{name}} has been successfully created.\nNow finish your application settings.',
  app_id: 'App ID',
  type: {
    native: {
      title: 'Native App',
      subtitle: 'An app that runs in a native environment',
      description: 'E.g., iOS app, Android app',
    },
    spa: {
      title: 'Single Page App',
      subtitle: 'An app that runs in a web browser and dynamically updates data in place',
      description: 'E.g., React DOM app, Vue app',
    },
    traditional: {
      title: 'Traditional Web',
      subtitle: 'An app that renders and updates pages by the web server alone',
      description: 'E.g., Next.js, PHP',
    },
    machine_to_machine: {
      title: 'Machine-to-Machine',
      subtitle: 'An app (usually a service) that directly talks to resources',
      description: 'E.g., Backend service',
    },
  },
  guide: {
    header_title: 'Select a framework or tutorial',
    modal_header_title: 'Start with SDK and guides',
    header_subtitle: 'Jumpstart your app development process with our pre-built SDK and tutorials.',
    start_building: 'Start Building',
    categories: {
      featured: 'Popular and for you',
      Traditional: 'Traditional web app',
      SPA: 'Single page app',
      Native: 'Native',
      MachineToMachine: 'Machine-to-machine',
    },
    filter: {
      title: 'Filter framework',
      placeholder: 'Search for framework',
    },
    select_a_framework: 'Select a framework',
    checkout_tutorial: 'Checkout {{name}} tutorial',
    get_sample_file: 'Get Sample',
    title: 'The application has been successfully created',
    subtitle:
      'Now follow the steps below to finish your app settings. Please select the SDK type to continue.',
    description_by_sdk:
      'This quick start guide demonstrates how to integrate Logto into {{sdk}} app',
    do_not_need_tutorial:
      'If you don’t need a tutorial, you can continue without a framework guide',
    create_without_framework: 'Create app without framework',
    finish_and_done: 'Finish and done',
    cannot_find_guide: "Can't find your guide?",
    describe_guide_looking_for: 'Describe the guide you are looking for',
    describe_guide_looking_for_placeholder: 'E.g., I want to integrate Logto into my Angular app.',
    request_guide_successfully: 'Your request has been successfully submitted. Thank you!',
  },
  placeholder_title: 'Select an application type to continue',
  placeholder_description:
    'Logto uses an application entity for OIDC to help with tasks such as identifying your apps, managing sign-in, and creating audit logs.',
};

export default Object.freeze(applications);
