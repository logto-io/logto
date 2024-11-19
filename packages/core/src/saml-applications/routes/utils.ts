import {
  type SamlApplicationResponse,
  type SamlApplicationSecret,
  type Application,
  type SamlApplicationConfig,
} from '@logto/schemas';

export const ensembleSamlApplication = ({
  application,
  samlConfig,
  samlSecret,
}: {
  application: Application;
  samlConfig: Pick<SamlApplicationConfig, 'attributeMapping' | 'entityId' | 'acsUrl'>;
  samlSecret?: SamlApplicationSecret | SamlApplicationSecret[];
}): SamlApplicationResponse => {
  return {
    ...application,
    ...samlConfig,
    secrets: samlSecret ? (Array.isArray(samlSecret) ? samlSecret : [samlSecret]) : [],
  };
};
