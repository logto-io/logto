import content from './content.js';
import password_policy from './password-policy.js';
import sign_up_and_sign_in from './sign-up-and-sign-in.js';

const sign_in_exp = {
  page_title: 'Sign-in experience',
  title: 'Sign-in experience',
  description: 'Customize the sign in UI to match your brand and view in real time',
  tabs: {
    branding: 'Branding',
    sign_up_and_sign_in: 'Sign-up and sign-in',
    content: 'Content',
    password_policy: 'Password policy',
  },
  welcome: {
    title: 'Customize sign-in experience',
    description:
      'Get started fast with your first sign-in setup. This guide walks you through all the necessary settings.',
    get_started: 'Get started',
    apply_remind:
      'Please note that sign-in experience will apply to all applications under this account.',
  },
  color: {
    title: 'COLOR',
    primary_color: 'Brand color',
    dark_primary_color: 'Brand color (Dark)',
    dark_mode: 'Enable dark mode',
    dark_mode_description:
      'Your app will have an auto-generated dark mode theme based on your brand color and Logto algorithm. You are free to customize.',
    dark_mode_reset_tip: 'Recalculate dark mode color based on brand color.',
    reset: 'Recalculate',
  },
  branding: {
    title: 'BRANDING AREA',
    ui_style: 'Style',
    favicon: 'Favicon',
    logo_image_url: 'App logo image URL',
    logo_image_url_placeholder: 'https://your.cdn.domain/logo.png',
    dark_logo_image_url: 'App logo image URL (Dark)',
    dark_logo_image_url_placeholder: 'https://your.cdn.domain/logo-dark.png',
    logo_image: 'App logo',
    dark_logo_image: 'App logo (Dark)',
    logo_image_error: 'App logo: {{error}}',
    favicon_error: 'Favicon: {{error}}',
  },
  custom_css: {
    title: 'Custom CSS',
    css_code_editor_title: 'Personalize your UI with custom CSS',
    css_code_editor_description1: 'See the example of custom CSS.',
    css_code_editor_description2: '<a>{{link}}</a>',
    css_code_editor_description_link_content: 'Learn more',
    css_code_editor_content_placeholder:
      'Enter your custom CSS to tailor the styles of anything to your exact specifications. Express your creativity and make your UI stand out.',
  },
  sign_up_and_sign_in,
  content,
  password_policy,
  setup_warning: {
    no_connector_sms:
      'No SMS connector set-up yet. Before completing the configuration, users will not be able to sign in with this method. <a>{{link}}</a> in "Connectors"',
    no_connector_email:
      'No email connector set-up yet. Before completing the configuration, users will not be able to sign in with this method. <a>{{link}}</a> in "Connectors"',
    no_connector_social:
      'You haven’t set up any social connector yet. Add connectors first to apply social sign-in methods. <a>{{link}}</a> in “Connectors”.',
    setup_link: 'Set up',
  },
  save_alert: {
    description:
      'You are implementing new sign-in and sign-up procedures. All of your users may be affected by the new set-up. Are you sure to commit to the change?',
    before: 'Before',
    after: 'After',
    sign_up: 'Sign-up',
    sign_in: 'Sign-in',
    social: 'Social',
  },
  preview: {
    title: 'Sign-in preview',
    live_preview: 'Live preview',
    live_preview_tip: 'Save to preview changes',
    native: 'Native',
    desktop_web: 'Desktop Web',
    mobile_web: 'Mobile Web',
    desktop: 'Desktop',
    mobile: 'Mobile',
  },
};

export default Object.freeze(sign_in_exp);
