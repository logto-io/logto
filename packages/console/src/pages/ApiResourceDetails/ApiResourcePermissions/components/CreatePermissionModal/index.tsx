import { noSpaceRegEx } from '@logto/core-kit';
import type { Scope, CreateScope } from '@logto/schemas';
import { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import ContactUsPhraseLink from '@/components/ContactUsPhraseLink';
import QuotaGuardFooter from '@/components/QuotaGuardFooter';
import SkuName from '@/components/SkuName';
import { manageRolePermissions } from '@/consts';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import Button from '@/ds-components/Button';
import FormField from '@/ds-components/FormField';
import ModalLayout from '@/ds-components/ModalLayout';
import TextInput from '@/ds-components/TextInput';
import useApi from '@/hooks/use-api';
import modalStyles from '@/scss/modal.module.scss';
import { trySubmitSafe } from '@/utils/form';

type Props = {
  readonly resourceId: string;
  readonly onClose: (scope?: Scope) => void;
};

type CreatePermissionFormData = Pick<CreateScope, 'name' | 'description'>;

function CreatePermissionModal({ resourceId, onClose }: Props) {
  const {
    currentSubscriptionQuota,
    currentSubscriptionResourceScopeUsage,
    currentSubscription: { planId },
    hasReachedSubscriptionQuotaLimit,
  } = useContext(SubscriptionDataContext);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

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

  const isScopesPerResourceReachLimit = hasReachedSubscriptionQuotaLimit(
    'scopesPerResourceLimit',
    currentSubscriptionResourceScopeUsage[resourceId] ?? 0
  );

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
        learnMoreLink={{ href: manageRolePermissions }}
        footer={
          isScopesPerResourceReachLimit ? (
            <QuotaGuardFooter>
              <Trans
                components={{
                  a: <ContactUsPhraseLink />,
                  planName: <SkuName skuId={planId} />,
                }}
              >
                {t('upsell.paywall.scopes_per_resource', {
                  count: currentSubscriptionQuota.scopesPerResourceLimit ?? 0,
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
          <FormField title="api_resource_details.permission.description">
            <TextInput
              placeholder={t('api_resource_details.permission.description_placeholder')}
              {...register('description')}
              error={Boolean(errors.description)}
            />
          </FormField>
        </form>
      </ModalLayout>
    </ReactModal>
  );
}

export default CreatePermissionModal;
