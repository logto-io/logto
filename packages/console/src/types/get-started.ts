export type StepMetadata = {
  title?: string;
  subtitle?: string;
  metadata: string; // Markdown formatted string
};

export type GetStartedForm = {
  redirectUris: string[];
  postLogoutRedirectUris: string[];
  connectorConfigJson: string;
};
