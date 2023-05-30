const domain = {
  status: {
    connecting: 'Connecting',
    in_used: 'In used',
    failed_to_connect: 'Failed to connect',
  },
  update_endpoint_alert: {
    description:
      'Your custom domain has been successfully configured. Don’t forget to update the domain which you have used to {{domain}} if you had configured the resources below previously.',
    endpoint_url: 'Endpoint URL of <a>{{link}}</a>',
    application_settings_link_text: 'Application Settings',
    callback_url: 'Callback URL of <a>{{link}}</a>',
    social_connector_link_text: 'Social connector',
    api_identifier: 'API identifier of <a>{{link}}</a>',
    uri_management_api_link_text: 'URI Management API',
    tip: 'After change settings, you can test it in our sign-in experience <a>{{link}}</a>.',
  },
  custom: {
    custom_domain: 'Custom Domain',
    custom_domain_description:
      'Replace the default domain with your own domain to maintain consistency with your brand and personalize the sign-in experience for your users.',
    custom_domain_field: 'Custom domain',
    custom_domain_placeholder: 'yourdomain.com',
    add_domain: 'Add domain',
    invalid_domain_format: 'Invalid domain format',
    steps: {
      add_records: {
        title: 'Add the following DNS records to your DNS provider',
        generating_dns_records: 'Generating the DNS records...',
        table: {
          type_field: 'Type',
          name_field: 'Name',
          value_field: 'Value',
        },
        finish_and_continue: 'Finish and Continue',
      },
      verify_domain: {
        title: 'Verify the connection of DNS records automatically',
        description:
          'The process will be carried out automatically, which may take a few minutes (up to 24 hours). You can exit this interface while it runs.',
        error_message: 'Failed to verify. Please check your domain name or DNS Records.',
      },
      generate_ssl_cert: {
        title: 'Generate an SSL certificate automatically',
        description:
          'The process will be carried out automatically, which may take a few minutes (up to 24 hours). You can exit this interface while it runs.',
        error_message: 'Failed to generate the SSL Certification. ',
      },
      enable_domain: 'Enable your custom domain automatically',
    },
    deletion: {
      delete_domain: 'Delete domain',
      reminder: 'Delete custom domain',
      description: 'Are you sure you want to delete this custom domain?',
      in_used_description: 'Are you sure you want to delete this custom domain "{{domain}}"?',
      in_used_tip:
        'If you’ve set up this custom domain in your social connector provider or application endpoint before, you’ll need to modify the URI to the Logto custom domain "{{domain}}" first. This is necessary for the social sign-in button to work properly.',
      deleted: 'Delete custom domain successfully!',
    },
  },
  default: {
    default_domain: 'Default domain',
    default_domain_description:
      'We provide a default domain name that can be used directly online. It is always available, ensuring that your application can always be accessed for sign-in, even if you switch to a custom domain.',
    default_domain_field: 'Logto default domain',
  },
};

export default domain;
