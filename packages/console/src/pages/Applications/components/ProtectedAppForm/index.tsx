import { isLocalhost, validateUriOrigin } from '@logto/core-kit';
import { ApplicationType, type Application, type RequestErrorBody } from '@logto/schemas';
import { isValidSubdomain } from '@logto/shared/universal';
import { condString, conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import { HTTPError } from 'ky';
import { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';
import useSWRImmutable from 'swr/immutable';

import ContactUsPhraseLink from '@/components/ContactUsPhraseLink';
import PlanName from '@/components/PlanName';
import QuotaGuardFooter from '@/components/QuotaGuardFooter';
import { isDevFeaturesEnabled, isCloud } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import Button, { type Props as ButtonProps } from '@/ds-components/Button';
import FormField from '@/ds-components/FormField';
import TextInput from '@/ds-components/TextInput';
import TextLink from '@/ds-components/TextLink';
import useApi from '@/hooks/use-api';
import useApplicationsUsage from '@/hooks/use-applications-usage';
import useTenantPathname from '@/hooks/use-tenant-pathname';

import styles from './index.module.scss';

type Props = {
  readonly className?: string;
  readonly buttonAlignment?: 'left' | 'right';
  readonly buttonText?: ButtonProps['title'];
  readonly buttonSize?: ButtonProps['size'];
  /** Detailed instructions are displayed when creating from get-started page */
  readonly hasDetailedInstructions?: boolean;
  readonly hasRequiredLabel?: boolean;
  readonly onCreateSuccess?: (createdApp: Application) => void;
};

// TODO: refactor this component to reduce complexity
// eslint-disable-next-line complexity
function ProtectedAppForm({
  className,
  buttonAlignment = 'right',
  buttonSize = 'large',
  buttonText = 'protected_app.form.create_application',
  hasDetailedInstructions,
  hasRequiredLabel,
  onCreateSuccess,
}: Props) {
  const { data } = useSWRImmutable<ProtectedAppsDomainConfig>(isCloud && 'api/systems/application');
  const {
    currentPlan: { name: planName, quota },
    currentSku,
    currentSubscriptionQuota,
  } = useContext(SubscriptionDataContext);
  const { hasAppsReachedLimit } = useApplicationsUsage();
  const defaultDomain = data?.protectedApps.defaultDomain ?? '';
  const { navigate } = useTenantPathname();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProtectedAppForm>({ mode: 'onBlur' });

  const api = useApi({ hideErrorToast: true });

  const onSubmit = handleSubmit(async (data) => {
    if (isSubmitting) {
      return;
    }

    try {
      const createdApp = await api
        .post('api/applications', {
          json: {
            // App name is subdomain on create, but user can change it later in app details.
            name: data.subDomain,
            type: ApplicationType.Protected,
            protectedAppMetadata: data,
          },
        })
        .json<Application>();
      toast.success(t('applications.application_created'));
      onCreateSuccess?.(createdApp);
      navigate(`/applications/${createdApp.id}`);
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        const { code, message } = await error.response.json<RequestErrorBody>();

        if (code === 'application.protected_application_subdomain_exists') {
          setError('subDomain', { type: 'custom', message });
          return;
        }

        if (error.response.status !== 401) {
          toast.error(message);
          return;
        }

        throw error;
      }

      throw error;
    }
  });

  return (
    <form className={className}>
      <div className={styles.formFieldWrapper}>
        {hasDetailedInstructions && (
          <div className={styles.withDashedLine}>
            <div className={styles.index}>1</div>
            <div className={styles.dashedLine} />
          </div>
        )}
        <FormField
          isRequired={hasRequiredLabel}
          className={styles.field}
          title="protected_app.form.url_field_label"
          description={conditional(
            hasDetailedInstructions && 'protected_app.form.url_field_description'
          )}
          descriptionPosition={conditional(hasDetailedInstructions && 'top')}
          tip={conditional(!hasDetailedInstructions && t('protected_app.form.url_field_tooltip'))}
        >
          <TextInput
            inputContainerClassName={styles.input}
            {...register('origin', {
              required: true,
              validate: (value) => {
                if (!validateUriOrigin(value)) {
                  return t('protected_app.form.errors.invalid_url');
                }

                if (isLocalhost(value)) {
                  return t('protected_app.form.errors.localhost');
                }

                return true;
              },
            })}
            placeholder={t('protected_app.form.url_field_placeholder')}
            error={
              // Error message can only be string, manually add link to the message
              errors.origin?.message === t('protected_app.form.errors.localhost') ? (
                <Trans
                  components={{
                    a: (
                      <TextLink to="https://docs.logto.io/docs/recipes/protected-app/#local-development" />
                    ),
                  }}
                >
                  {t('protected_app.form.errors.localhost')}
                </Trans>
              ) : (
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                errors.origin?.message ||
                (errors.origin?.type === 'required' && t('protected_app.form.errors.url_required'))
              )
            }
          />
        </FormField>
      </div>
      <div className={styles.formFieldWrapper}>
        {hasDetailedInstructions && <div className={styles.index}>2</div>}
        <FormField
          isRequired={hasRequiredLabel}
          className={styles.field}
          title="protected_app.form.domain_field_label"
          description={`protected_app.form.domain_field_description${
            hasDetailedInstructions ? '' : '_short'
          }`}
          descriptionPosition={conditional(hasDetailedInstructions && 'top')}
          tip={conditional(
            !hasDetailedInstructions &&
              t('protected_app.form.domain_field_tooltip', { domain: defaultDomain })
          )}
        >
          <div className={styles.domainFieldWrapper}>
            <TextInput
              className={styles.subdomain}
              inputContainerClassName={styles.input}
              {...register('subDomain', {
                required: true,
                validate: (value) =>
                  isValidSubdomain(value) || t('protected_app.form.errors.invalid_domain_format'),
              })}
              placeholder={t('protected_app.form.domain_field_placeholder')}
              error={
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                errors.subDomain?.message ||
                (errors.subDomain?.type === 'required' &&
                  t('protected_app.form.errors.domain_required'))
              }
            />
            {defaultDomain && (
              <div className={styles.domain}>
                {condString(defaultDomain && `.${defaultDomain}`)}
              </div>
            )}
          </div>
        </FormField>
      </div>
      {hasAppsReachedLimit ? (
        <QuotaGuardFooter>
          <Trans
            components={{
              a: <ContactUsPhraseLink />,
              planName: <PlanName skuId={currentSku.id} name={planName} />,
            }}
          >
            {t('upsell.paywall.applications', {
              count:
                (isDevFeaturesEnabled
                  ? currentSubscriptionQuota.applicationsLimit
                  : quota.applicationsLimit) ?? 0,
            })}
          </Trans>
        </QuotaGuardFooter>
      ) : (
        <Button
          className={classNames(
            styles.submitButton,
            buttonAlignment === 'left' && styles.leftAligned
          )}
          size={buttonSize}
          type="primary"
          title={buttonText}
          isLoading={isSubmitting}
          onClick={onSubmit}
        />
      )}
    </form>
  );
}

export default ProtectedAppForm;
