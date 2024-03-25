import { z } from 'zod';

export const userOnboardingDataKey = 'onboarding';

export enum Project {
  Personal = 'personal',
  Company = 'company',
}

/** @deprecated Open-source options was for cloud preview use, no longer needed. Use default `Cloud` value for placeholder. */
enum DeploymentType {
  OpenSource = 'open-source',
  Cloud = 'cloud',
}

/** @deprecated */
export enum Title {
  Developer = 'developer',
  TeamLead = 'team-lead',
  Ceo = 'ceo',
  Cto = 'cto',
  Product = 'product',
  Others = 'others',
}

/** @deprecated */
export enum CompanySize {
  Scale1 = '1',
  Scale2 = '2-49',
  Scale3 = '50-199',
  Scale4 = '200-999',
  Scale5 = '1000+',
}

/** @deprecated */
export enum Reason {
  Passwordless = 'passwordless',
  Efficiency = 'efficiency',
  AccessControl = 'access-control',
  MultiTenancy = 'multi-tenancy',
  Enterprise = 'enterprise',
  Others = 'others',
}

export enum Stage {
  NewProduct = 'new-product',
  ExistingProduct = 'existing-product',
  TargetEnterpriseReady = 'target-enterprise-ready',
}

export enum AdditionalFeatures {
  CustomizeUiAndFlow = 'customize-ui-and-flow',
  Compliance = 'compliance',
  ExportUserDataFromLogto = 'export-user-data-from-logto',
  BudgetControl = 'budget-control',
  BringOwnAuth = 'bring-own-auth',
  Others = 'others',
}

const questionnaireGuard = z.object({
  project: z.nativeEnum(Project).optional(),
  /** @deprecated Open-source options was for cloud preview use, no longer needed. Use default `Cloud` value for placeholder. */
  deploymentType: z.nativeEnum(DeploymentType).optional().default(DeploymentType.Cloud),
  /** @deprecated */
  titles: z.array(z.nativeEnum(Title)).optional(),
  companyName: z.string().optional(),
  /** @deprecated */
  companySize: z.nativeEnum(CompanySize).optional(),
  /** @deprecated */
  reasons: z.array(z.nativeEnum(Reason)).optional(),
  stage: z.nativeEnum(Stage).optional(),
  additionalFeatures: z.array(z.nativeEnum(AdditionalFeatures)).optional(),
});

export type Questionnaire = z.infer<typeof questionnaireGuard>;

export const userOnboardingDataGuard = z.object({
  questionnaire: questionnaireGuard.optional(),
  isOnboardingDone: z.boolean().optional(),
});

export type UserOnboardingData = z.infer<typeof userOnboardingDataGuard>;
