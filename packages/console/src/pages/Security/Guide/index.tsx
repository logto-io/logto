import type { CaptchaProvider, CaptchaType } from '@logto/schemas';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';

import Close from '@/assets/icons/close.svg?react';
import Markdown from '@/components/Markdown';
import Button from '@/ds-components/Button';
import CardTitle from '@/ds-components/CardTitle';
import DynamicT from '@/ds-components/DynamicT';
import IconButton from '@/ds-components/IconButton';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import useApi from '@/hooks/use-api';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import { splitMarkdownByTitle } from '@/pages/Connectors/utils';
import modalStyles from '@/scss/modal.module.scss';
import { trySubmitSafe } from '@/utils/form';

import CaptchaFormFields from '../CaptchaFormFields';
import { captchaProviders } from '../CreateCaptchaForm/constants';
import { type CaptchaFormType } from '../types';

import styles from './index.module.scss';

type Props = {
  readonly type: CaptchaType;
  readonly onClose: () => void;
};

function Guide({ type, onClose }: Props) {
  const captchaMetadata = captchaProviders.find((provider) => provider.type === type);
  const { navigate } = useTenantPathname();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const api = useApi();

  const methods = useForm<CaptchaFormType>({
    reValidateMode: 'onBlur',
    defaultValues: {
      siteKey: '',
      secretKey: '',
      projectId: '',
    },
  });

  const {
    formState: { isSubmitting, errors },
    handleSubmit,
    register,
  } = methods;

  const onSubmit = handleSubmit(
    trySubmitSafe(async (data) => {
      if (isSubmitting) {
        return;
      }

      await api
        .put('api/captcha-provider', {
          json: {
            config: {
              ...data,
              type,
            },
          },
        })
        .json<CaptchaProvider>();

      toast.success(t('general.saved'));
      navigate('/security/captcha');
    })
  );

  if (!captchaMetadata) {
    return null;
  }

  const { name, description, readme } = captchaMetadata;
  const { title, content } = splitMarkdownByTitle(readme);

  return (
    <Modal
      shouldCloseOnEsc
      isOpen
      className={modalStyles.fullScreen}
      onRequestClose={() => {
        onClose();
      }}
    >
      <div className={styles.container}>
        <div className={styles.header}>
          <IconButton
            size="large"
            onClick={() => {
              onClose();
            }}
          >
            <Close className={styles.closeIcon} />
          </IconButton>
          <div className={styles.separator} />
          <CardTitle
            size="small"
            title={<DynamicT forKey={name} />}
            subtitle={<DynamicT forKey={description} />}
          />
        </div>
        <div className={styles.content}>
          <OverlayScrollbar className={styles.readme}>
            <div className={styles.readmeTitle}>README: {title}</div>
            <Markdown className={styles.readmeContent}>{content}</Markdown>
          </OverlayScrollbar>
          <div className={styles.setup}>
            <FormProvider {...methods}>
              <form autoComplete="off" onSubmit={onSubmit}>
                <div className={styles.block}>
                  <div className={styles.blockTitle}>
                    <div className={styles.number}>1</div>
                    <div>{t('connectors.guide.parameter_configuration')}</div>
                  </div>
                  <CaptchaFormFields
                    metadata={captchaMetadata}
                    errors={errors}
                    register={register}
                  />
                </div>
                <div className={styles.footer}>
                  <Button
                    title="connectors.save_and_done"
                    type="primary"
                    htmlType="submit"
                    isLoading={isSubmitting}
                  />
                </div>
              </form>
            </FormProvider>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default Guide;
