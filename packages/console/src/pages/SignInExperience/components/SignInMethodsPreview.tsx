import type { SignInExperience } from '@logto/schemas';
import { SignInMethodKey, SignInMethodState } from '@logto/schemas';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import UnnamedTrans from '@/components/UnnamedTrans';
import useConnectorGroups from '@/hooks/use-connector-groups';

import * as styles from './SignInMethodsChangePreview.module.scss';

type Props = {
  data: SignInExperience;
};

const SignInMethodsPreview = ({ data }: Props) => {
  const { data: groups, error } = useConnectorGroups();
  const { signInMethods, socialSignInConnectorTargets } = data;
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const connectorNames = useMemo(() => {
    if (!groups) {
      return null;
    }

    return socialSignInConnectorTargets.map((connectorTarget) => {
      const group = groups.find(({ target }) => target === connectorTarget);

      if (!group) {
        return null;
      }

      return (
        <UnnamedTrans key={connectorTarget} className={styles.connector} resource={group.name} />
      );
    });
  }, [groups, socialSignInConnectorTargets]);

  return (
    <div>
      {!groups && !error && <div>loading</div>}
      {!groups && error && <div>{error.body?.message ?? error.message}</div>}
      {groups &&
        Object.values(SignInMethodKey)
          .filter((key) => signInMethods[key] !== SignInMethodState.Disabled)
          .map((key) => (
            <div key={key}>
              {t('sign_in_exp.sign_in_methods.methods', { context: key })}
              {key === SignInMethodKey.Social && <span>: {connectorNames}</span>}
            </div>
          ))}
    </div>
  );
};

export default SignInMethodsPreview;
