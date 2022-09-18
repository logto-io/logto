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
            title="action.bind"
            properties={{ address: relatedUser }}
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
