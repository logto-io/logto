import {
  type Application,
  ApplicationType,
  SsoConnectorIdpInitiatedAuthConfigs,
  type CreateSsoConnectorIdpInitiatedAuthConfig,
  type SsoConnectorIdpInitiatedAuthConfig,
} from '@logto/schemas';
import { conditional, type DeepPartial } from '@silverhand/essentials';
import { t } from 'i18next';
import { toast } from 'react-hot-toast';

const applicationsSearchParams = new URLSearchParams([
  ['types', ApplicationType.Traditional],
  ['types', ApplicationType.SPA],
  ['isThirdParty', 'false'],
]);

export const applicationsSearchUrl = `api/applications?${applicationsSearchParams.toString()}`;

export const buildIdpInitiatedAuthConfigEndpoint = (connectorId: string) =>
  `api/sso-connectors/${connectorId}/idp-initiated-auth-config`;

type IdpInitiatedAuthConfigData = Pick<
  SsoConnectorIdpInitiatedAuthConfig,
  'defaultApplicationId' | 'autoSendAuthorizationRequest'
> & {
  authParameters: string;
  redirectUri: string | undefined;
  clientIdpInitiatedAuthCallbackUri: string | undefined;
};

const authParametersGuard = SsoConnectorIdpInitiatedAuthConfigs.createGuard.shape.authParameters;

export type IdpInitiatedAuthConfigFormData = {
  isIdpInitiatedSsoEnabled: boolean;
  config?: IdpInitiatedAuthConfigData;
};

export const parseResponseToFormData = (
  response: SsoConnectorIdpInitiatedAuthConfig | undefined,
  applications: Application[] = []
): DeepPartial<IdpInitiatedAuthConfigFormData> => {
  if (!response) {
    return {
      isIdpInitiatedSsoEnabled: false,
      config: {
        // Set default values
        defaultApplicationId: applications[0]?.id,
        autoSendAuthorizationRequest: false,
      },
    };
  }

  const {
    defaultApplicationId,
    autoSendAuthorizationRequest,
    redirectUri,
    clientIdpInitiatedAuthCallbackUri,
    authParameters,
  } = response;

  return {
    isIdpInitiatedSsoEnabled: true,
    config: {
      defaultApplicationId,
      autoSendAuthorizationRequest,
      redirectUri: conditional(redirectUri),
      clientIdpInitiatedAuthCallbackUri: conditional(clientIdpInitiatedAuthCallbackUri),
      authParameters: JSON.stringify(authParameters, null, 2),
    },
  };
};

const safeParseAuthParameters = (authParameters: string) => {
  try {
    const data = authParametersGuard.parse(JSON.parse(authParameters));
    return { success: true, data };
  } catch (error: unknown) {
    return { success: false, error };
  }
};

export const parseFormDataToRequestPayload = ({
  defaultApplicationId,
  autoSendAuthorizationRequest = false,
  clientIdpInitiatedAuthCallbackUri,
  redirectUri,
  authParameters,
}: IdpInitiatedAuthConfigData):
  | {
      success: true;
      data: Partial<CreateSsoConnectorIdpInitiatedAuthConfig>;
    }
  | { success: false } => {
  // Directly sign in flow
  if (autoSendAuthorizationRequest) {
    const parsedAuthParameters = safeParseAuthParameters(authParameters);

    if (!parsedAuthParameters.success) {
      toast.error(t('admin_console.errors.invalid_parameters_format'));
      return { success: false };
    }

    return {
      success: true,
      data: {
        defaultApplicationId,
        autoSendAuthorizationRequest,
        redirectUri,
        authParameters: parsedAuthParameters.data,
      },
    };
  }

  // Client redirect flow
  return {
    success: true,
    data: {
      defaultApplicationId,
      autoSendAuthorizationRequest,
      clientIdpInitiatedAuthCallbackUri,
    },
  };
};
