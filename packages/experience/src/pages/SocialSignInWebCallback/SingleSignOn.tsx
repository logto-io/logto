import LoadingLayer from '@/components/LoadingLayer';
import useNativeMessageListener from '@/hooks/use-native-message-listener';
import { useSieMethods } from '@/hooks/use-sie';

import useSingleSignOnListener from './use-single-sign-on-listener';

type Props = {
  connectorId: string;
};

const SingleSignOn = ({ connectorId }: Props) => {
  const { socialConnectors } = useSieMethods();

  /* To avoid register duplicated native message listeners,
    we only add the native message listener if there are no social connectors.
    Set the bypass flag to true if there are social connectors.
  */
  useNativeMessageListener(socialConnectors.length > 0);

  const { loading } = useSingleSignOnListener(connectorId);

  return loading ? <LoadingLayer /> : null;
};

export default SingleSignOn;
