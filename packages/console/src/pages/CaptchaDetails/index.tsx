import type { CaptchaProvider } from '@logto/schemas';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import useSWR, { useSWRConfig } from 'swr';

import Delete from '@/assets/icons/delete.svg?react';
import File from '@/assets/icons/file.svg?react';
import Reset from '@/assets/icons/reset.svg?react';
import DetailsPage from '@/components/DetailsPage';
import DetailsPageHeader from '@/components/DetailsPage/DetailsPageHeader';
import Drawer from '@/components/Drawer';
import Markdown from '@/components/Markdown';
import PageMeta from '@/components/PageMeta';
import ConfirmModal from '@/ds-components/ConfirmModal';
import DynamicT from '@/ds-components/DynamicT';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';
import type { RequestError } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import useTenantPathname from '@/hooks/use-tenant-pathname';

import CaptchaLogo from '../Security/CaptchaLogo';
import CreateCaptchaForm from '../Security/CreateCaptchaForm';
import { captchaProviders } from '../Security/CreateCaptchaForm/constants';

import CaptchaContent from './CaptchaContent';
import styles from './index.module.scss';

function CaptchaDetails() {
  const { mutate: mutateGlobal } = useSWRConfig();
  const [isDeleted, setIsDeleted] = useState(false);
  const [isReadMeOpen, setIsReadMeOpen] = useState(false);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data, error, mutate, isLoading } = useSWR<CaptchaProvider, RequestError>(
    `api/captcha-provider`
  );

  const api = useApi();
  const { navigate } = useTenantPathname();

  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreateCaptchaFormOpen, setIsCreateCaptchaFormOpen] = useState(false);

  const captchaMetadata = useMemo(() => {
    if (!data) {
      return;
    }

    return captchaProviders.find((provider) => provider.type === data.config.type);
  }, [data]);

  useEffect(() => {
    setIsDeleteAlertOpen(false);
  }, []);

  const handleDelete = async () => {
    if (isDeleting) {
      return;
    }
    setIsDeleting(true);

    try {
      await api.delete(`api/captcha-provider`);

      setIsDeleted(true);

      toast.success(t('security.captcha_details.captcha_deleted'));
      await mutateGlobal('api/captcha-provider');

      navigate('/security', {
        replace: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DetailsPage
      backLink="/security"
      backLinkTitle="security.captcha_details.back_to_security"
      isLoading={isLoading}
      error={error}
      className={styles.captchaDetailsPage}
      onRetry={() => {
        void mutate();
      }}
    >
      <PageMeta titleKey="security.captcha_details.page_title" />
      {captchaMetadata && data && (
        <>
          <DetailsPageHeader
            icon={<CaptchaLogo Logo={captchaMetadata.logo} LogoDark={captchaMetadata.logoDark} />}
            title={<DynamicT forKey={captchaMetadata.name} />}
            identifier={{ name: 'ID', value: data.id }}
            additionalActionButton={{
              title: 'security.captcha_details.check_readme',
              icon: <File />,
              onClick: () => {
                setIsReadMeOpen(true);
              },
            }}
            actionMenuItems={[
              {
                title: 'security.captcha_details.options_change_captcha',
                icon: <Reset />,
                onClick: () => {
                  setIsCreateCaptchaFormOpen(true);
                },
              },
              {
                type: 'danger',
                title: 'general.delete',
                icon: <Delete />,
                onClick: () => {
                  setIsDeleteAlertOpen(true);
                },
              },
            ]}
          />
          <Drawer
            title={<DynamicT forKey={captchaMetadata.name} />}
            subtitle={<DynamicT forKey={captchaMetadata.description} />}
            isOpen={isReadMeOpen}
            onClose={() => {
              setIsReadMeOpen(false);
            }}
          >
            <Markdown className={styles.readme}>{captchaMetadata.readme}</Markdown>
          </Drawer>
          <TabNav>
            <TabNavItem href="/security/captcha">
              {t('security.captcha_details.connection')}
            </TabNavItem>
          </TabNav>
          <CaptchaContent
            isDeleted={isDeleted}
            captchaProvider={data}
            onUpdate={(captchaProvider) => {
              void mutate(captchaProvider);
            }}
          />
          <ConfirmModal
            isOpen={isDeleteAlertOpen}
            confirmButtonText="general.delete"
            isLoading={isLoading}
            onCancel={() => {
              setIsDeleteAlertOpen(false);
            }}
            onConfirm={handleDelete}
          >
            {t('security.captcha_details.deletion_description')}
          </ConfirmModal>
          <CreateCaptchaForm
            isOpen={isCreateCaptchaFormOpen}
            onClose={() => {
              setIsCreateCaptchaFormOpen(false);
            }}
          />
        </>
      )}
    </DetailsPage>
  );
}

export default CaptchaDetails;
