import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import Divider from '@/components/Divider';
import useBindSocialRelatedUser from '@/hooks/use-social-link-related-user';
import useSocialRegister from '@/hooks/use-social-register';
import type { SocialRelatedUserInfo } from '@/types/guard';
import { maskEmail, maskPhone } from '@/utils/format';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  connectorId: string;
  relatedUser: SocialRelatedUserInfo;
};

const SocialLinkAccount = ({ connectorId, className, relatedUser }: Props) => {
  const { t } = useTranslation();

  const bindSocialRelatedUser = useBindSocialRelatedUser();
  const registerWithSocial = useSocialRegister(connectorId);

  const { type, value } = relatedUser;

  return (
    <div className={classNames(styles.container, className)}>
      <div className={styles.desc}>{t('description.social_bind_with_existing')}</div>

      <Button
        title="action.bind"
        i18nProps={{ address: type === 'email' ? maskEmail(value) : maskPhone(value) }}
        onClick={() => {
          void bindSocialRelatedUser({
            connectorId,
            ...(type === 'email' ? { email: value } : { phone: value }),
          });
        }}
      />

      <Divider label="description.or" className={styles.divider} />

      <div className={styles.desc}>{t('description.social_create_account')}</div>

      <Button
        title="action.create"
        type="secondary"
        onClick={() => {
          void registerWithSocial(connectorId);
        }}
      />
    </div>
  );
};

export default SocialLinkAccount;
