import { type FullSignInExperience } from '@logto/schemas';

export type SignInExperienceResponse = Omit<FullSignInExperience, 'socialSignInConnectorTargets'>;
