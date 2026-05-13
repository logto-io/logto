import { extendedIdTokenClaimsByScope, UserScope } from '@logto/core-kit';
import { Controller, useFormContext } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';

import FormCard from '@/components/FormCard';
import Checkbox from '@/ds-components/Checkbox';
import TextLink from '@/ds-components/TextLink';
import useIdTokenConfig from '@/pages/CustomizeJwt/use-id-token-config';

import { type ApplicationForm } from '../../utils';

import styles from './AdditionalScopesForm.module.scss';

const scopes = Object.values(UserScope).filter((scope) => extendedIdTokenClaimsByScope[scope]);

function AdditionalScopesForm() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { control } = useFormContext<ApplicationForm>();
  const { data: idTokenConfig, isLoading } = useIdTokenConfig();

  const enabledClaims = idTokenConfig?.enabledExtendedClaims ?? [];

  return (
    <FormCard
      title="protected_app.id_token_claims.card_title"
      description="protected_app.id_token_claims.card_description"
    >
      <div className={styles.fieldHeader}>
        <div className={styles.fieldTitle}>{t('protected_app.id_token_claims.field_title')}</div>
        <div className={styles.fieldDescription}>
          <Trans components={{ a: <TextLink to="/customize-jwt" /> }}>
            {t('protected_app.id_token_claims.field_description')}
          </Trans>
        </div>
      </div>
      <div className={styles.table}>
        <div className={styles.headerRow}>
          <div>{t('protected_app.id_token_claims.table_column_scope')}</div>
          <div>{t('protected_app.id_token_claims.table_column_claims_forwarded')}</div>
        </div>
        <Controller
          name="protectedAppMetadata.additionalScopes"
          control={control}
          render={({ field: { value = [], onChange } }) => (
            <>
              {scopes.map((scope) => {
                const claims = extendedIdTokenClaimsByScope[scope];

                if (!claims) {
                  return null;
                }

                const checked = value.includes(scope);
                const enabledScopeClaims = claims.filter((claim) => enabledClaims.includes(claim));
                const disabledScopeClaims = claims.filter(
                  (claim) => !enabledClaims.includes(claim)
                );

                return (
                  <div key={scope} className={styles.scopeRow}>
                    <div className={styles.scopeCell}>
                      <Checkbox
                        checked={checked}
                        onChange={() => {
                          onChange(
                            checked ? value.filter((item) => item !== scope) : [...value, scope]
                          );
                        }}
                      />
                      <span className={styles.scopeLabel}>{scope}</span>
                    </div>
                    <div className={styles.claimsCell}>
                      {isLoading && (
                        <>
                          {claims.map((claim) => (
                            <span key={claim} className={styles.claimTag}>
                              {claim}
                            </span>
                          ))}
                        </>
                      )}
                      {!isLoading && (
                        <>
                          {enabledScopeClaims.map((claim) => (
                            <span key={claim} className={`${styles.claimTag} ${styles.enabled}`}>
                              {claim}
                            </span>
                          ))}
                          {disabledScopeClaims.map((claim) => (
                            <span key={claim} className={styles.claimTag}>
                              {claim}
                            </span>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        />
      </div>
      <div className={styles.tableFootnote}>
        <Trans components={{ a: <TextLink to="/customize-jwt" /> }}>
          {t('protected_app.id_token_claims.disabled_claims_hint')}
        </Trans>
      </div>
    </FormCard>
  );
}

export default AdditionalScopesForm;
