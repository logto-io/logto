import { SignInIdentifier } from '@logto/schemas';
import classNames from 'classnames';
import type { TFuncKey } from 'i18next';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import Divider from '@/components/Divider';
import DynamicT from '@/components/DynamicT';
import { useSieMethods } from '@/hooks/use-sie';
import useSocialRegister from '@/hooks/use-social-register';
import type { SocialRelatedUserInfo } from '@/types/guard';
import { maskEmail, maskPhone } from '@/utils/format';

import * as styles from './index.module.scss';
import useBindSocialRelatedUser from './use-social-link-related-user';

type Props = {
  readonly className?: string;
  readonly connectorId: string;
  readonly relatedUser: SocialRelatedUserInfo;
};

const getCreateAccountContent = (
  signUpMethods: string[]
): { desc: TFuncKey; buttonText: TFuncKey } => {
  if (
    signUpMethods.includes(SignInIdentifier.Email) &&
    signUpMethods.includes(SignInIdentifier.Phone)
  ) {
    return {
      desc: 'description.social_link_email_or_phone',
      buttonText: 'action.link_another_email_or_phone',
    };
  }

  if (signUpMethods.includes(SignInIdentifier.Email)) {
    return {
      desc: 'description.social_link_email',
      buttonText: 'action.link_another_email',
    };
  }

  if (signUpMethods.includes(SignInIdentifier.Phone)) {
    return {
      desc: 'description.social_link_phone',
      buttonText: 'action.link_another_phone',
    };
  }

  return {
    desc: 'description.social_create_account',
    buttonText: 'action.create_account_without_linking',
  };
};

const SocialLinkAccount = ({ connectorId, className, relatedUser }: Props) => {
  const { t } = useTranslation();
  const { signUpMethods } = useSieMethods();

  const bindSocialRelatedUser = useBindSocialRelatedUser();
  const registerWithSocial = useSocialRegister(connectorId);

  const content = getCreateAccountContent(signUpMethods);

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

      <div className={styles.desc}>
        <DynamicT forKey={content.desc} />
      </div>

      <Button
        title={content.buttonText}
        type="secondary"
        onClick={() => {
          void registerWithSocial(connectorId);
        }}
      />
    </div>
  );
};

export default SocialLinkAccount;
