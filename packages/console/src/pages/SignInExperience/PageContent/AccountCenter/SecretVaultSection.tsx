import { useTranslation } from 'react-i18next';

import FormCard from '@/components/FormCard';
import DynamicT from '@/ds-components/DynamicT';
import FormField from '@/ds-components/FormField';
import Tag from '@/ds-components/Tag';

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
          tip={t(
            'sign_in_exp.account_center.sections.secret_vault.third_party_token_storage.third_party_token_tooltip'
          )}
        >
          <div className={styles.groupFields}>
            <div className={styles.fieldRow}>
              <div>
                <div className={styles.statusLine}>
                  <div className={styles.fieldName}>
                    <DynamicT forKey="sign_in_exp.account_center.sections.secret_vault.third_party_token_storage.third_party_access_token_retrieval" />
                  </div>
                  <Tag
                    type="state"
                    status={isAccountApiEnabled ? 'success' : 'info'}
                    variant="plain"
                  >
                    <DynamicT
                      forKey={
                        isAccountApiEnabled
                          ? 'sign_in_exp.account_center.field_options.enabled'
                          : 'sign_in_exp.account_center.field_options.disabled'
                      }
                    />
                  </Tag>
                </div>
                <div className={styles.description}>
                  <DynamicT forKey="sign_in_exp.account_center.sections.secret_vault.third_party_token_storage.third_party_token_description" />
                </div>
              </div>
            </div>
          </div>
        </FormField>
      </div>
    </FormCard>
  );
}

export default SecretVaultSection;
