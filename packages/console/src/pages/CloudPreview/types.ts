export enum CloudPreviewPage {
  Welcome = 'welcome',
  About = 'about',
  SignInExperience = 'sign-in-experience',
}

export enum Project {
  Personal = 'personal',
  Company = 'company',
}

export enum DeploymentType {
  Opensource = 'opensource',
  Cloud = 'cloud',
}

export type Questionnaire = {
  project: Project;
  deploymentType: DeploymentType;
};
