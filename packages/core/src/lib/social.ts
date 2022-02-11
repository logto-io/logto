import { getSocialConnectorInstanceById } from '@/connectors';
import { SocialUserInfo } from '@/connectors/types';
import RequestError from '@/errors/RequestError';

const getConnector = async (connectorId: string) => {
  try {
    return await getSocialConnectorInstanceById(connectorId);
  } catch (error: unknown) {
    // Throw a new error with status 422 when connector not found.
    if (error instanceof RequestError && error.code === 'entity.not_found') {
      throw new RequestError({
        code: 'session.invalid_connector_id',
        status: 422,
        data: { connectorId },
      });
    }
    throw error;
  }
};

export const getUserInfoByConnectorCode = async (
  connectorId: string,
  code: string
): Promise<SocialUserInfo> => {
  const connector = await getConnector(connectorId);
  const accessToken = await connector.getAccessToken(code);

  return connector.getUserInfo(accessToken);
};
