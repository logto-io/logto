import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import useBindSocial from '@/hooks/use-bind-social';
import { useSieMethods } from '@/hooks/use-sie';
import { SearchParameters, UserFlow } from '@/types';
import { queryStringify } from '@/utils';

import OtherMethodsLink from '../OtherMethodsLink';
import * as styles from './index.module.scss';

type Props = {
  className?: string;
  connectorId: string;
};

const SocialCreateAccount = ({ connectorId, className }: Props) => {
  const { t } = useTranslation();
  const { relatedUser, registerWithSocial, bindSocialRelatedUser } = useBindSocial();
  const { signInMethods } = useSieMethods();

  return (
    <div className={classNames(styles.container, className)}>
      {relatedUser && (
        <>
          <div className={styles.desc}>{t('description.social_bind_with_existing')}</div>
          <Button
            title="action.bind"
            i18nProps={{ address: relatedUser }}
            onClick={() => {
              bindSocialRelatedUser(connectorId);
            }}
          />
        </>
      )}
      <div className={styles.desc}>{t('description.social_create_account')}</div>
      <Button
        title="action.create"
        type={relatedUser ? 'secondary' : 'primary'}
        onClick={() => {
          registerWithSocial(connectorId);
        }}
      />
      <OtherMethodsLink
        methods={signInMethods.map(({ identifier }) => identifier)}
        template="social_bind_with"
        flow={UserFlow.signIn}
        className={styles.desc}
        search={queryStringify({ [SearchParameters.bindWithSocial]: connectorId })}
      />
    </div>
  );
};

export default SocialCreateAccount;
