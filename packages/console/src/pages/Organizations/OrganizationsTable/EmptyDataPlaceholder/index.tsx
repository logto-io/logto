import { Theme } from '@logto/schemas';
import { useTranslation } from 'react-i18next';

import Plus from '@/assets/icons/plus.svg';
import OrganizationEmptyDark from '@/assets/images/organization-empty-dark.svg';
import OrganizationEmpty from '@/assets/images/organization-empty.svg';
import Button, { type Props as ButtonProps } from '@/ds-components/Button';
import useConfigs from '@/hooks/use-configs';
import useTheme from '@/hooks/use-theme';

import * as styles from './index.module.scss';

type Props = {
  /** Override the default button properties in the placeholder */
  readonly buttonProps?: ButtonProps;
};

function EmptyDataPlaceholder({ buttonProps }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.organizations' });
  const { configs } = useConfigs();
  const theme = useTheme();
  const PlaceholderImage = theme === Theme.Light ? OrganizationEmpty : OrganizationEmptyDark;
  const isInitialSetup = !configs?.organizationCreated;

  return (
    <div className={styles.placeholder}>
      <PlaceholderImage className={styles.image} />
      <div className={styles.title}>{t('organization_list_placeholder_title')}</div>
      <div className={styles.text}>{t('organization_list_placeholder_text')}</div>
      <Button
        className={styles.button}
        type="primary"
        size="large"
        icon={<Plus />}
        title={
          isInitialSetup ? 'organizations.setup_organization' : 'organizations.create_organization'
        }
        {...buttonProps}
      />
    </div>
  );
}

export default EmptyDataPlaceholder;
