import { extendedIdTokenClaimsByScope, UserScope } from '@logto/core-kit';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormCard from '@/components/FormCard';
import Checkbox from '@/ds-components/Checkbox';
import FormField from '@/ds-components/FormField';

import { type ApplicationForm } from '../../utils';

import styles from './AdditionalScopesForm.module.scss';

const scopes = Object.values(UserScope).filter((scope) => extendedIdTokenClaimsByScope[scope]);

function AdditionalScopesForm() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { control } = useFormContext<ApplicationForm>();

  return (
    <FormCard
      title="protected_app.id_token_claims.card_title"
      description="protected_app.id_token_claims.card_description"
    >
      <FormField
        title="protected_app.id_token_claims.field_title"
        description="protected_app.id_token_claims.field_description"
        descriptionPosition="top"
      >
        <Controller
          name="protectedAppMetadata.additionalScopes"
          control={control}
          render={({ field: { value = [], onChange } }) => (
            <div className={styles.scopeGroups}>
              {scopes.map((scope) => {
                const claims = extendedIdTokenClaimsByScope[scope];

                if (!claims) {
                  return null;
                }

                return (
                  <div key={scope} className={styles.scopeGroup}>
                    <Checkbox
                      label={scope}
                      checked={value.includes(scope)}
                      onChange={() => {
                        onChange(
                          value.includes(scope)
                            ? value.filter((item) => item !== scope)
                            : [...value, scope]
                        );
                      }}
                    />
                    <div className={styles.claims}>
                      {t('protected_app.id_token_claims.claims_label', {
                        claims: claims.join(', '),
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        />
      </FormField>
    </FormCard>
  );
}

export default AdditionalScopesForm;
