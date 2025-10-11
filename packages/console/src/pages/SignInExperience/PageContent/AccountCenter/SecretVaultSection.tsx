import { useTranslation } from 'react-i18next';

import Tip from '@/assets/icons/tip.svg?react';
import FormCard from '@/components/FormCard';
import DynamicT from '@/ds-components/DynamicT';
import FormField from '@/ds-components/FormField';
import IconButton from '@/ds-components/IconButton';
import Select from '@/ds-components/Select';
import { ToggleTip } from '@/ds-components/Tip';

import styles from './index.module.scss';

type Props = {
  readonly isAccountApiEnabled: boolean;
};

function SecretVaultSection({ isAccountApiEnabled }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <FormCard
      title="sign_in_exp.account_center.sections.secret_vault.title"
      description="sign_in_exp.account_center.sections.secret_vault.description"
      learnMoreLink={{ href: 'https://docs.logto.io/secret-vault', targetBlank: true }}
    >
      <div className={styles.cardContent}>
        <FormField
          title="sign_in_exp.account_center.sections.secret_vault.third_party_token_storage.title"
          headlineSpacing="large"
        >
          <div className={styles.groupFields}>
            <div className={styles.fieldRow}>
              <div className={styles.fieldLabel}>
                <div className={styles.fieldName}>
                  <DynamicT forKey="sign_in_exp.account_center.sections.secret_vault.third_party_token_storage.third_party_access_token_retrieval" />
                  <ToggleTip
                    anchorClassName={styles.tipIcon}
                    content={t(
                      'sign_in_exp.account_center.sections.secret_vault.third_party_token_storage.third_party_access_token_retrieval_tooltip'
                    )}
                  >
                    <IconButton size="small">
                      <Tip />
                    </IconButton>
                  </ToggleTip>
                </div>
              </div>
              <div className={styles.fieldControl}>
                <Select<string>
                  isReadOnly
                  value={isAccountApiEnabled ? 'enabled' : 'disabled'}
                  options={[
                    {
                      value: isAccountApiEnabled ? 'enabled' : 'disabled',
                      title: t(
                        isAccountApiEnabled
                          ? 'sign_in_exp.account_center.field_options.enabled'
                          : 'sign_in_exp.account_center.field_options.disabled'
                      ),
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        </FormField>
      </div>
    </FormCard>
  );
}

export default SecretVaultSection;
