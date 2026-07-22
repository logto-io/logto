const cloud = {
  general: {
    onboarding: 'Onboarding',
  },
  create_tenant: {
    page_title: 'Create tenant',
    title: 'Create your first tenant',
    description:
      'A tenant is an isolated environment where you can manage user identities, applications, and all other Logto resources.',
    invite_collaborators: 'Invite your collaborators by email',
    hear_about_us: {
      title: 'How did you first hear about Logto?',
      detail_placeholder: 'Tell us more (optional)',
      options: {
        search_engine: 'Search engine (Google, Bing...)',
        ai_assistant: 'AI assistant (ChatGPT, Claude, Gemini...)',
        github_oss: 'GitHub or open-source directories',
        friend_colleague: 'A friend or colleague',
        powered_by: 'Sign-in page of an app using Logto',
        content_social: 'Social media, article, or video (YouTube, X, Reddit...)',
        other: 'Other',
      },
    },
  },
  social_callback: {
    title: "You've successfully signed in",
    description:
      'You have successfully signed in using your social account. To ensure seamless integration and access to all the features of Logto, we recommend that you proceed to configure your own social connector.',
    notice:
      "Please avoid using the demo connector for production purposes. Once you've completed testing, kindly delete the demo connector and set up your own connector with your credentials.",
  },
  tenant: {
    create_tenant: 'Create tenant',
  },
};

export default Object.freeze(cloud);
