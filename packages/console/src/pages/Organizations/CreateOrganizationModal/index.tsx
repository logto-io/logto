import { type Organization, type CreateOrganization, ReservedPlanId } from '@logto/schemas';
import { cond, conditional } from '@silverhand/essentials';
import { useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import AddOnNoticeFooter from '@/components/AddOnNoticeFooter';
import ContactUsPhraseLink from '@/components/ContactUsPhraseLink';
import QuotaGuardFooter from '@/components/QuotaGuardFooter';
import { isCloud } from '@/consts/env';
import { addOnPricingExplanationLink } from '@/consts/external-links';
import { organizationAddOnUnitPrice } from '@/consts/subscriptions';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import Button from '@/ds-components/Button';
import FormField from '@/ds-components/FormField';
import ModalLayout from '@/ds-components/ModalLayout';
import TextInput from '@/ds-components/TextInput';
import TextLink from '@/ds-components/TextLink';
import useApi from '@/hooks/use-api';
import useUserPreferences from '@/hooks/use-user-preferences';
import modalStyles from '@/scss/modal.module.scss';
import { trySubmitSafe } from '@/utils/form';
import { isPaidPlan, isFeatureEnabled } from '@/utils/subscription';

import styles from './index.module.scss';

type Props = {
  readonly isOpen: boolean;
  readonly onClose: (createdId?: string) => void;
};

function CreateOrganizationModal({ isOpen, onClose }: Props) {
  const api = useApi();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    currentSubscription: { planId, isAddOnAvailable, isEnterprisePlan },
    currentSubscriptionQuota,
  } = useContext(SubscriptionDataContext);
  const {
    data: { organizationUpsellNoticeAcknowledged },
    update,
  } = useUserPreferences();
  const isOrganizationsDisabled =
    isCloud &&
    !isFeatureEnabled(currentSubscriptionQuota.organizationsLimit) &&
    planId !== ReservedPlanId.Pro;

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Partial<CreateOrganization>>();
  const submit = handleSubmit(
    trySubmitSafe(async (json) => {
      const { id } = await api
        .post('api/organizations', {
          json,
        })
        .json<Organization>();
      onClose(id);
    })
  );

  // Reset form on open
  useEffect(() => {
    if (isOpen) {
      reset({});
    }
  }, [isOpen, reset]);

  return (
    <ReactModal
      isOpen={isOpen}
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={() => {
        onClose();
      }}
    >
      <ModalLayout
        title="organizations.create_organization"
        paywall={conditional(
          isAddOnAvailable && planId !== ReservedPlanId.Pro && ReservedPlanId.Pro
        )}
        hasAddOnTag={isAddOnAvailable}
        footer={
          cond(
            isAddOnAvailable &&
              // Just in case the enterprise plan has reached the resource limit, we still need to show charge notice.
              isPaidPlan(planId, isEnterprisePlan) &&
              !organizationUpsellNoticeAcknowledged && (
                <AddOnNoticeFooter
                  isLoading={isSubmitting}
                  buttonTitle="general.create"
                  onClick={async () => {
                    void update({ organizationUpsellNoticeAcknowledged: true });
                    await submit();
                  }}
                >
                  <Trans
                    components={{
                      span: <span className={styles.strong} />,
                      a: <TextLink to={addOnPricingExplanationLink} />,
                    }}
                  >
                    {t('upsell.add_on.footer.organization', {
                      price: organizationAddOnUnitPrice,
                      planName: t(
                        isEnterprisePlan ? 'subscription.enterprise' : 'subscription.pro_plan'
                      ),
                    })}
                  </Trans>
                </AddOnNoticeFooter>
              )
          ) ??
          (isOrganizationsDisabled ? (
            <QuotaGuardFooter>
              <Trans
                components={{
                  a: <ContactUsPhraseLink />,
                }}
              >
                {t('upsell.paywall.organizations')}
              </Trans>
            </QuotaGuardFooter>
          ) : (
            <Button
              type="primary"
              title="general.create"
              isLoading={isSubmitting}
              onClick={submit}
            />
          ))
        }
        onClose={onClose}
      >
        <form>
          <FormField isRequired title="general.name">
            <TextInput
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              placeholder={t('organizations.organization_name_placeholder')}
              error={Boolean(errors.name)}
              {...register('name', { required: true })}
            />
          </FormField>
          <FormField title="general.description">
            <TextInput
              error={Boolean(errors.description)}
              placeholder={t('organizations.organization_description_placeholder')}
              {...register('description')}
            />
          </FormField>
        </form>
      </ModalLayout>
    </ReactModal>
  );
}

export default CreateOrganizationModal;
