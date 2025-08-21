import { type AdminConsoleKey } from '@logto/phrases';
import type { Application } from '@logto/schemas';
import { ApplicationType } from '@logto/schemas';
import { type ReactElement, useContext, useMemo } from 'react';
import { useController, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';
import useSWR, { useSWRConfig } from 'swr';

import { GtagConversionId, reportConversion } from '@/components/Conversion/utils';
import LearnMore from '@/components/LearnMore';
import { pricingLink, defaultPageSize, integrateLogto } from '@/consts';
import { isCloud, isDevFeaturesEnabled } from '@/consts/env';
import { latestProPlanId } from '@/consts/subscriptions';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { LinkButton } from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';
import FormField from '@/ds-components/FormField';
import ModalLayout from '@/ds-components/ModalLayout';
import RadioGroup, { Radio } from '@/ds-components/RadioGroup';
import TextInput from '@/ds-components/TextInput';
import { type RequestError } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import useApplicationsUsage from '@/hooks/use-applications-usage';
import useCurrentUser from '@/hooks/use-current-user';
import TypeDescription from '@/pages/Applications/components/TypeDescription';
import modalStyles from '@/scss/modal.module.scss';
import { applicationTypeI18nKey } from '@/types/applications';
import { trySubmitSafe } from '@/utils/form';
import { isPaidPlan } from '@/utils/subscription';
import { buildUrl } from '@/utils/url';

import Footer from './Footer';
import styles from './index.module.scss';

const applicationsEndpoint = 'api/applications';
const samlApplicationsLimit = 3;

type AvailableApplicationTypeForCreation = Extract<
  ApplicationType,
  | ApplicationType.Native
  | ApplicationType.SPA
  | ApplicationType.Traditional
  | ApplicationType.MachineToMachine
>;

type FormData = {
  type: ApplicationType;
  name: string;
  description?: string;
  isThirdParty?: boolean;
};

export type Props = {
  readonly isDefaultCreateThirdParty?: boolean;
  readonly defaultCreateType?: ApplicationType;
  readonly defaultCreateFrameworkName?: string;
  readonly onClose?: (createdApp?: Application) => void;
};

function CreateForm({
  defaultCreateType,
  defaultCreateFrameworkName,
  isDefaultCreateThirdParty,
  onClose,
}: Props) {
  const {
    handleSubmit,
    watch,
    control,
    register,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: { type: defaultCreateType, isThirdParty: isDefaultCreateThirdParty },
  });

  const { data } = useSWR<[Application[], number], RequestError>(
    !isCloud &&
      defaultCreateType === ApplicationType.SAML &&
      buildUrl(applicationsEndpoint, {
        page: String(1),
        page_size: String(defaultPageSize),
        isThirdParty: 'false',
        type: ApplicationType.SAML,
      })
  );
  const [_, samlAppTotalCount] = data ?? [];

  const {
    currentSubscription: { planId, isEnterprisePlan },
  } = useContext(SubscriptionDataContext);
  const { user } = useCurrentUser();
  const { mutate: mutateGlobal } = useSWRConfig();
  const isPaidTenant = isPaidPlan(planId, isEnterprisePlan);

  const {
    field: { onChange, value, name, ref },
  } = useController({
    name: 'type',
    control,
    rules: { required: true },
  });

  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const api = useApi();

  const {
    hasMachineToMachineAppsReachedLimit,
    hasSamlAppsReachedLimit,
    hasThirdPartyAppsReachedLimit,
  } = useApplicationsUsage();

  const applicationType = watch('type');
  const isThirdPartyApp = watch('isThirdParty');

  const paywall = useMemo(() => {
    if (isPaidTenant) {
      return;
    }

    if (applicationType === ApplicationType.MachineToMachine) {
      return latestProPlanId;
    }

    // TODO: remove this dev feature guard after the new app add-on feature is available for all plans.
    if (isDevFeaturesEnabled && applicationType === ApplicationType.SAML) {
      return latestProPlanId;
    }

    if (isDevFeaturesEnabled && isThirdPartyApp) {
      return latestProPlanId;
    }
  }, [applicationType, isPaidTenant, isThirdPartyApp]);

  const hasAddOnTag = useMemo(() => {
    if (!isPaidTenant) {
      return false;
    }

    if (applicationType === ApplicationType.MachineToMachine) {
      return hasMachineToMachineAppsReachedLimit;
    }

    // TODO: remove this dev feature guard after the new app add-on feature is available for all plans.
    if (isDevFeaturesEnabled && applicationType === ApplicationType.SAML) {
      return hasSamlAppsReachedLimit;
    }

    if (isDevFeaturesEnabled && isThirdPartyApp) {
      return hasThirdPartyAppsReachedLimit;
    }

    return false;
  }, [
    applicationType,
    hasMachineToMachineAppsReachedLimit,
    hasSamlAppsReachedLimit,
    hasThirdPartyAppsReachedLimit,
    isPaidTenant,
    isThirdPartyApp,
  ]);

  const onSubmit = handleSubmit(
    trySubmitSafe(async (data) => {
      if (isSubmitting) {
        return;
      }

      const appCreationEndpoint =
        data.type === ApplicationType.SAML ? 'api/saml-applications' : 'api/applications';

      const createdApp = await api.post(appCreationEndpoint, { json: data }).json<Application>();

      // Report the conversion event after the application is created. Note that the conversion
      // should be set as count once since this will be reported multiple times.
      reportConversion({ gtagId: GtagConversionId.CreateFirstApp, transactionId: user?.id });

      toast.success(t('applications.application_created'));
      // Trigger a refetch of the applications list
      void mutateGlobal((key) => typeof key === 'string' && key.startsWith('api/applications'));
      onClose?.(createdApp);
    })
  );

  const subtitleElement = useMemo<AdminConsoleKey | ReactElement>(() => {
    if (!defaultCreateFrameworkName) {
      return (
        <>
          <DynamicT forKey="applications.subtitle" />
          <LearnMore isRelativeDocUrl href={integrateLogto} />
        </>
      );
    }

    if (isDefaultCreateThirdParty) {
      return 'applications.create_subtitle_third_party';
    }

    return (
      <DynamicT
        forKey="applications.subtitle_with_app_type"
        interpolation={{ name: defaultCreateFrameworkName }}
      />
    );
  }, [defaultCreateFrameworkName, isDefaultCreateThirdParty]);

  return (
    <Modal
      shouldCloseOnEsc
      isOpen
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={() => {
        onClose?.();
      }}
    >
      <ModalLayout
        title="applications.create"
        subtitle={subtitleElement}
        paywall={paywall}
        hasAddOnTag={hasAddOnTag}
        size={defaultCreateType ? 'medium' : 'large'}
        footer={
          !isCloud &&
          defaultCreateType === ApplicationType.SAML &&
          typeof samlAppTotalCount === 'number' &&
          samlAppTotalCount >= samlApplicationsLimit ? (
            <div className={styles.container}>
              <div className={styles.description}>{t('upsell.paywall.saml_applications_oss')}</div>
              <LinkButton
                size="large"
                type="primary"
                title="upsell.paywall.logto_pricing_button_text"
                href={pricingLink}
                targetBlank="noopener"
              />
            </div>
          ) : (
            <Footer
              selectedType={value}
              isLoading={isSubmitting}
              isThirdParty={isDefaultCreateThirdParty}
              onClickCreate={onSubmit}
            />
          )
        }
        onClose={onClose}
      >
        <form>
          {!defaultCreateType && (
            <FormField title="applications.select_application_type">
              <RadioGroup
                ref={ref}
                className={styles.radioGroup}
                name={name}
                value={value}
                type="card"
                onChange={onChange}
              >
                {Object.values(ApplicationType)
                  .filter((value): value is AvailableApplicationTypeForCreation =>
                    [
                      ApplicationType.Native,
                      ApplicationType.SPA,
                      ApplicationType.Traditional,
                      ApplicationType.MachineToMachine,
                    ].includes(value)
                  )
                  .map((type) => (
                    <Radio
                      key={type}
                      value={type}
                      hasCheckIconForCard={type !== ApplicationType.MachineToMachine}
                    >
                      <TypeDescription
                        type={type}
                        title={t(`${applicationTypeI18nKey[type]}.title`)}
                        subtitle={t(`${applicationTypeI18nKey[type]}.subtitle`)}
                        description={t(`${applicationTypeI18nKey[type]}.description`)}
                      />
                    </Radio>
                  ))}
              </RadioGroup>
              {errors.type?.type === 'required' && (
                <div className={styles.error}>{t('applications.no_application_type_selected')}</div>
              )}
            </FormField>
          )}
          <FormField isRequired title="applications.application_name">
            <TextInput
              {...register('name', { required: true })}
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus={!!defaultCreateType}
              placeholder={t('applications.application_name_placeholder')}
              error={Boolean(errors.name)}
            />
          </FormField>
          <FormField title="applications.application_description">
            <TextInput
              {...register('description')}
              placeholder={t('applications.application_description_placeholder')}
            />
          </FormField>
          {defaultCreateType && <input hidden {...register('type')} value={defaultCreateType} />}
        </form>
      </ModalLayout>
    </Modal>
  );
}

export default CreateForm;
