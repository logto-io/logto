const applications = {
  title: 'Applications',
  subtitle:
    'Set up a mobile, single page or traditional application to use Logto for authentication',
  create: 'Create Application',
  application_name: 'Application name',
  application_name_placeholder: 'My App',
  application_description: 'Application description',
  application_description_placeholder: 'Enter your application description',
  select_application_type: 'Select an application type',
  no_application_type_selected: 'You haven’t selected any application type yet',
  application_created:
    'The application {{name}} has been successfully created! \nNow finish your application settings.',
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
      title: 'Machine to Machine',
      subtitle: 'An app (usually a service) that directly talks to resources',
      description: 'E.g., Backend service',
    },
  },
  guide: {
    get_sample_file: 'Get Sample',
    header_description:
      'Follow a step by step guide to integrate your application or click the right button to get our sample project',
    title: 'The application has been successfully created',
    subtitle:
      'Now follow the steps below to finish your app settings. Please select the SDK type to continue.',
    description_by_sdk:
      'This quick start guide demonstrates how to integrate Logto into {{sdk}} app',
  },
};

export default applications;
