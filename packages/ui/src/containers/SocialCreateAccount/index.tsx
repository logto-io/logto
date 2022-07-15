import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import useBindSocial from '@/hooks/use-bind-social';
import { SearchParameters } from '@/types';
import { queryStringify } from '@/utils';

import SignInMethodsLink from '../SignInMethodsLink';
import * as styles from './index.module.scss';

type Props = {
  className?: string;
  connectorId: string;
};

const SocialCreateAccount = ({ connectorId, className }: Props) => {
  const { t } = useTranslation();
  const { relatedUser, localSignInMethods, registerWithSocial, bindSocialRelatedUser } =
    useBindSocial();

  return (
    <div className={classNames(styles.container, className)}>
      {relatedUser && (
        <>
          <div className={styles.desc}>{t('description.social_bind_with_existing')}</div>
          <Button
            onClick={() => {
              bindSocialRelatedUser(connectorId);
            }}
          >
            {t('action.bind', { address: relatedUser })}
          </Button>
        </>
      )}
      <div className={styles.desc}>{t('description.social_create_account')}</div>
      <Button
        type={relatedUser ? 'secondary' : 'primary'}
        onClick={() => {
          registerWithSocial(connectorId);
        }}
      >
        {t('action.create')}
      </Button>
      <SignInMethodsLink
        signInMethods={localSignInMethods}
        template="social_bind_with"
        className={styles.desc}
        search={queryStringify({ [SearchParameters.bindWithSocial]: connectorId })}
      />
    </div>
  );
};

export default SocialCreateAccount;
