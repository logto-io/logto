import { noSpaceRegEx } from '@logto/core-kit';
import type { Scope } from '@logto/schemas';
import { useForm } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import ContactUsPhraseLink from '@/components/ContactUsPhraseLink';
import PlanName from '@/components/PlanName';
import QuotaGuardFooter from '@/components/QuotaGuardFooter';
import Button from '@/ds-components/Button';
import FormField from '@/ds-components/FormField';
import ModalLayout from '@/ds-components/ModalLayout';
import TextInput from '@/ds-components/TextInput';
import useApi from '@/hooks/use-api';
import useCurrentSubscriptionPlan from '@/hooks/use-current-subscription-plan';
import * as modalStyles from '@/scss/modal.module.scss';
import { trySubmitSafe } from '@/utils/form';
import { isOverQuota } from '@/utils/quota';

type Props = {
  resourceId: string;
  totalResourceCount: number;
  onClose: (scope?: Scope) => void;
};

type CreatePermissionFormData = Pick<Scope, 'name' | 'description'>;

function CreatePermissionModal({ resourceId, totalResourceCount, onClose }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data: currentPlan } = useCurrentSubscriptionPlan();
  const {
    handleSubmit,
    register,
    formState: { isSubmitting, errors },
  } = useForm<CreatePermissionFormData>();

  const api = useApi();

  const onSubmit = handleSubmit(
    trySubmitSafe(async (formData) => {
      if (isSubmitting) {
        return;
      }

      const createdScope = await api
        .post(`api/resources/${resourceId}/scopes`, { json: formData })
        .json<Scope>();

      onClose(createdScope);
    })
  );

  const isScopesPerResourceOverQuota = isOverQuota({
    quotaKey: 'scopesPerResourceLimit',
    plan: currentPlan,
    usage: totalResourceCount,
  });

  return (
    <ReactModal
      isOpen
      shouldCloseOnEsc
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={() => {
        onClose();
      }}
    >
      <ModalLayout
        title="api_resource_details.permission.create_title"
        subtitle="api_resource_details.permission.create_subtitle"
        learnMoreLink="https://docs.logto.io/docs/recipes/rbac/manage-permissions-and-roles#manage-role-permissions"
        footer={
          isScopesPerResourceOverQuota && currentPlan ? (
            <QuotaGuardFooter>
              <Trans
                components={{
                  a: <ContactUsPhraseLink />,
                  planName: <PlanName name={currentPlan.name} />,
                }}
              >
                {t('upsell.paywall.scopes_per_resource', {
                  count: currentPlan.quota.scopesPerResourceLimit,
                })}
              </Trans>
            </QuotaGuardFooter>
          ) : (
            <Button
              isLoading={isSubmitting}
              htmlType="submit"
              title="api_resource_details.permission.confirm_create"
              size="large"
              type="primary"
              onClick={onSubmit}
            />
          )
        }
        onClose={onClose}
      >
        <form>
          <FormField isRequired title="api_resource_details.permission.name">
            <TextInput
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              placeholder={t('api_resource_details.permission.name_placeholder')}
              {...register('name', {
                required: true,
                pattern: {
                  value: noSpaceRegEx,
                  message: t('api_resource_details.permission.forbidden_space_in_name'),
                },
              })}
              error={errors.name?.message}
            />
          </FormField>
          <FormField isRequired title="api_resource_details.permission.description">
            <TextInput
              placeholder={t('api_resource_details.permission.description_placeholder')}
              {...register('description', { required: true })}
              error={Boolean(errors.description)}
            />
          </FormField>
        </form>
      </ModalLayout>
    </ReactModal>
  );
}

export default CreatePermissionModal;
