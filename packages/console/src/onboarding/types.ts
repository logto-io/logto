import type { SignInIdentifier } from '@logto/schemas';
import { z } from 'zod';

export enum OnboardingRoute {
  Onboarding = 'onboarding',
}

export enum OnboardingPage {
  Welcome = 'welcome',
  /** @deprecated Merged `about-user` to `welcome` page. */
  AboutUser = 'about-user',
  SignInExperience = 'sign-in-experience',
  Congrats = 'congrats',
}

export enum Project {
  Personal = 'personal',
  Company = 'company',
}

/** @deprecated Open-source options was for cloud preview use, no longer needed. Use default `Cloud` value for placeholder. */
enum DeploymentType {
  OpenSource = 'open-source',
  Cloud = 'cloud',
}

export enum Title {
  Developer = 'developer',
  TeamLead = 'team-lead',
  Ceo = 'ceo',
  Cto = 'cto',
  Product = 'product',
  Others = 'others',
}

export enum CompanySize {
  Scale1 = '1',
  Scale2 = '2-49',
  Scale3 = '50-199',
  Scale4 = '200-999',
  Scale5 = '1000+',
}

export enum Reason {
  Passwordless = 'passwordless',
  Efficiency = 'efficiency',
  AccessControl = 'access-control',
  MultiTenancy = 'multi-tenancy',
  Enterprise = 'enterprise',
  Others = 'others',
}

const questionnaireGuard = z.object({
  project: z.nativeEnum(Project),
  /** @deprecated Open-source options was for cloud preview use, no longer needed. Use default `Cloud` value for placeholder. */
  deploymentType: z.nativeEnum(DeploymentType).optional().default(DeploymentType.Cloud),
  titles: z.array(z.nativeEnum(Title)).optional(),
  companyName: z.string().optional(),
  companySize: z.nativeEnum(CompanySize).optional(),
  reasons: z.array(z.nativeEnum(Reason)).optional(),
});

export type Questionnaire = z.infer<typeof questionnaireGuard>;

export const userOnboardingDataGuard = z.object({
  questionnaire: questionnaireGuard.optional(),
  isOnboardingDone: z.boolean().optional(),
});

export type UserOnboardingData = z.infer<typeof userOnboardingDataGuard>;

export enum Authentication {
  Password = 'password',
  VerificationCode = 'verificationCode',
}

export type OnboardingSieConfig = {
  logo?: string;
  color: string;
  identifier: SignInIdentifier;
  authentications: Authentication[];
  socialTargets?: string[];
};
