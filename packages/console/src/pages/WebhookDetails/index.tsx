import { type Hook } from '@logto/schemas';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';

import Delete from '@/assets/images/delete.svg';
import Forbidden from '@/assets/images/forbidden.svg';
import More from '@/assets/images/more.svg';
import Shield from '@/assets/images/shield.svg';
import WebhookDark from '@/assets/images/webhook-dark.svg';
import Webhook from '@/assets/images/webhook.svg';
import ActionMenu, { ActionMenuItem } from '@/components/ActionMenu';
import Card from '@/components/Card';
import ConfirmModal from '@/components/ConfirmModal';
import CopyToClipboard from '@/components/CopyToClipboard';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import DetailsPage from '@/components/DetailsPage';
import DynamicT from '@/components/DynamicT';
import PageMeta from '@/components/PageMeta';
import Status from '@/components/Status';
import TabNav, { TabNavItem } from '@/components/TabNav';
import { WebhookDetailsTabs } from '@/consts';
import useApi, { type RequestError } from '@/hooks/use-api';
import useTheme from '@/hooks/use-theme';

import * as styles from './index.module.scss';
import { type WebhookDetailsOutletContext } from './types';

function WebhookDetails() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { data, error, mutate } = useSWR<Hook, RequestError>(id && `api/hooks/${id}`);
  const isLoading = !data && !error;
  const api = useApi();

  const theme = useTheme();
  const WebhookIcon = theme === 'light' ? Webhook : WebhookDark;

  const [isDeleteFormOpen, setIsDeleteFormOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDisableFormOpen, setIsDisableFormOpen] = useState(false);
  const [isUpdatingEnableState, setIsUpdatingEnableState] = useState(false);
  const [isEnabled, setIsEnabled] = useState(data?.enabled ?? true);

  useEffect(() => {
    setIsDeleteFormOpen(false);
    setIsDisableFormOpen(false);
  }, [pathname]);

  const onDelete = async () => {
    if (!data || isDeleting) {
      return;
    }

    setIsDeleting(true);

    try {
      await api.delete(`api/hooks/${data.id}`);
      toast.success(t('webhook_details.deleted', { name: data.name }));
      navigate('/webhooks');
    } finally {
      setIsDeleting(false);
    }
  };

  const onToggleEnableState = async () => {
    if (!data || isUpdatingEnableState) {
      return;
    }

    setIsUpdatingEnableState(true);

    try {
      const { enabled } = await api
        .patch(`api/hooks/${data.id}`, { json: { enabled: !isEnabled } })
        .json<Hook>();
      setIsEnabled(enabled);
      setIsDisableFormOpen(false);
      toast.success(
        t(enabled ? 'webhook_details.webhook_reactivated' : 'webhook_details.webhook_disabled')
      );
    } finally {
      setIsUpdatingEnableState(false);
    }
  };

  return (
    <DetailsPage
      backLink="/webhooks"
      backLinkTitle="webhook_details.back_to_webhooks"
      isLoading={isLoading}
      error={error}
      onRetry={mutate}
    >
      <PageMeta titleKey="webhook_details.page_title" />
      {data && (
        <>
          <Card className={styles.header}>
            <WebhookIcon className={styles.webhookIcon} />
            <div className={styles.metadata}>
              <div className={styles.title}>{data.name}</div>
              <div>
                {isEnabled ? (
                  <div>Success Rate (WIP)</div>
                ) : (
                  <Status status="disabled" variant="outlined">
                    <DynamicT forKey="webhook_details.not_in_use" />
                  </Status>
                )}
                <div className={styles.verticalBar} />
                <div className={styles.text}>ID</div>
                <CopyToClipboard size="small" value={data.id} />
              </div>
            </div>
            <div>
              <ActionMenu
                buttonProps={{ icon: <More className={styles.icon} />, size: 'large' }}
                title={t('general.more_options')}
              >
                <ActionMenuItem
                  icon={isEnabled ? <Forbidden /> : <Shield />}
                  iconClassName={styles.icon}
                  onClick={async () => {
                    if (isEnabled) {
                      setIsDisableFormOpen(true);
                      return;
                    }
                    await onToggleEnableState();
                  }}
                >
                  <DynamicT
                    forKey={
                      isEnabled
                        ? 'webhook_details.disable_webhook'
                        : 'webhook_details.reactivate_webhook'
                    }
                  />
                </ActionMenuItem>
                <ActionMenuItem
                  icon={<Delete />}
                  type="danger"
                  onClick={() => {
                    setIsDeleteFormOpen(true);
                  }}
                >
                  <DynamicT forKey="webhook_details.delete_webhook" />
                </ActionMenuItem>
              </ActionMenu>
              <DeleteConfirmModal
                isOpen={isDeleteFormOpen}
                isLoading={isDeleting}
                onCancel={() => {
                  setIsDeleteFormOpen(true);
                }}
                onConfirm={onDelete}
              >
                <div>{t('webhook_details.deletion_reminder')}</div>
              </DeleteConfirmModal>
              <ConfirmModal
                isOpen={isDisableFormOpen}
                isLoading={isUpdatingEnableState}
                confirmButtonText="webhook_details.disable_webhook"
                onCancel={async () => {
                  setIsDisableFormOpen(false);
                }}
                onConfirm={onToggleEnableState}
              >
                <DynamicT forKey="webhook_details.disable_reminder" />
              </ConfirmModal>
            </div>
          </Card>
          <TabNav>
            <TabNavItem href={`/webhooks/${data.id}/${WebhookDetailsTabs.Settings}`}>
              <DynamicT forKey="webhook_details.settings_tab" />
            </TabNavItem>
          </TabNav>
          <Outlet
            context={
              {
                hook: data,
                isDeleting,
                onHookUpdated: (hook) => {
                  void mutate(hook);
                },
              } satisfies WebhookDetailsOutletContext
            }
          />
        </>
      )}
    </DetailsPage>
  );
}

export default WebhookDetails;
