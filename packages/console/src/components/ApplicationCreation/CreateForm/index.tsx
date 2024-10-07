import { type AdminConsoleKey } from '@logto/phrases';
import type { Application } from '@logto/schemas';
import { ApplicationType, ReservedPlanId } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { type ReactElement, useContext, useMemo } from 'react';
import { useController, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';
import { useSWRConfig } from 'swr';

import { GtagConversionId, reportConversion } from '@/components/Conversion/utils';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import DynamicT from '@/ds-components/DynamicT';
import FormField from '@/ds-components/FormField';
import ModalLayout from '@/ds-components/ModalLayout';
import RadioGroup, { Radio } from '@/ds-components/RadioGroup';
import TextInput from '@/ds-components/TextInput';
import useApi from '@/hooks/use-api';
import useApplicationsUsage from '@/hooks/use-applications-usage';
import useCurrentUser from '@/hooks/use-current-user';
import TypeDescription from '@/pages/Applications/components/TypeDescription';
import modalStyles from '@/scss/modal.module.scss';
import { applicationTypeI18nKey } from '@/types/applications';
import { trySubmitSafe } from '@/utils/form';

import Footer from './Footer';
import styles from './index.module.scss';

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
  const {
    currentSubscription: { isAddOnAvailable, planId },
  } = useContext(SubscriptionDataContext);
  const { user } = useCurrentUser();
  const { mutate: mutateGlobal } = useSWRConfig();

  const {
    field: { onChange, value, name, ref },
  } = useController({
    name: 'type',
    control,
    rules: { required: true },
  });

  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const api = useApi();

  const { hasMachineToMachineAppsReachedLimit } = useApplicationsUsage();

  const onSubmit = handleSubmit(
    trySubmitSafe(async (data) => {
      if (isSubmitting) {
        return;
      }

      const createdApp = await api.post('api/applications', { json: data }).json<Application>();

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
      return 'applications.subtitle';
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
        paywall={conditional(
          isAddOnAvailable &&
            watch('type') === ApplicationType.MachineToMachine &&
            planId !== ReservedPlanId.Pro &&
            ReservedPlanId.Pro
        )}
        hasAddOnTag={
          isAddOnAvailable &&
          watch('type') === ApplicationType.MachineToMachine &&
          hasMachineToMachineAppsReachedLimit
        }
        size={defaultCreateType ? 'medium' : 'large'}
        footer={
          <Footer
            selectedType={value}
            isLoading={isSubmitting}
            isThirdParty={isDefaultCreateThirdParty}
            onClickCreate={onSubmit}
          />
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
                  // Other application types (e.g. "Protected") should not show up in the creation modal
                  .filter((value) =>
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
