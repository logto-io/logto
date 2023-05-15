import { withAppInsights } from '@logto/app-insights/react';
import { type HookEvent, type Hook, Theme } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import useSWR from 'swr';

import Plus from '@/assets/images/plus.svg';
import WebhookDark from '@/assets/images/webhook-dark.svg';
import Webhook from '@/assets/images/webhook.svg';
import WebhooksEmptyDark from '@/assets/images/webhooks-empty-dark.svg';
import WebhooksEmpty from '@/assets/images/webhooks-empty.svg';
import Button from '@/components/Button';
import DynamicT from '@/components/DynamicT';
import ItemPreview from '@/components/ItemPreview';
import ListPage from '@/components/ListPage';
import TablePlaceholder from '@/components/Table/TablePlaceholder';
import { hookEventLabel } from '@/consts/webhooks';
import { type RequestError } from '@/hooks/use-api';
import useTheme from '@/hooks/use-theme';

import CreateFormModal from './components/CreateFormModal';
import * as styles from './index.module.scss';

const webhooksPathname = '/webhooks';
const createWebhookPathname = `${webhooksPathname}/create`;

const buildDetailsPathname = (id: string) => `${webhooksPathname}/${id}`;

function Webhooks() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { pathname } = useLocation();
  const isCreateNew = pathname === createWebhookPathname;
  const { data, error, mutate } = useSWR<Hook[], RequestError>('api/hooks');
  const isLoading = !data && !error;
  const navigate = useNavigate();
  const theme = useTheme();
  const WebhookIcon = theme === Theme.Light ? Webhook : WebhookDark;

  return (
    <ListPage
      title={{ title: 'webhooks.title', subtitle: 'webhooks.subtitle' }}
      pageMeta={{ titleKey: 'webhooks.page_title' }}
      createButton={{
        title: 'webhooks.create',
        onClick: () => {
          navigate(createWebhookPathname);
        },
      }}
      table={{
        rowGroups: [{ key: 'hooks', data }],
        rowIndexKey: 'id',
        isLoading,
        errorMessage: error?.body?.message ?? error?.message,
        columns: [
          {
            title: <DynamicT forKey="webhooks.table.name" />,
            dataIndex: 'name',
            colSpan: 5,
            render: ({ id, name }) => {
              return (
                <ItemPreview
                  icon={<WebhookIcon className={styles.icon} />}
                  title={name || t('general.unnamed')}
                  to={buildDetailsPathname(id)}
                />
              );
            },
          },
          {
            title: <DynamicT forKey="webhooks.table.events" />,
            dataIndex: 'events',
            colSpan: 6,
            render: ({ event, events }) => {
              const eventArray = conditional(events.length > 0 && events) ?? [event];
              return (
                eventArray
                  // eslint-disable-next-line unicorn/prefer-native-coercion-functions
                  .filter((_event): _event is HookEvent => Boolean(_event))
                  .map((_event) => t(hookEventLabel[_event]))
                  .join(', ')
              );
            },
          },
          {
            title: <DynamicT forKey="webhooks.table.success_rate" />,
            dataIndex: 'successRate',
            colSpan: 3,
            render: () => {
              return <div>WIP</div>;
            },
          },
          {
            title: <DynamicT forKey="webhooks.table.requests" />,
            dataIndex: 'Requests',
            colSpan: 2,
            render: () => {
              return <div>WIP</div>;
            },
          },
        ],
        rowClickHandler: ({ id }) => {
          navigate(buildDetailsPathname(id));
        },
        placeholder: (
          <TablePlaceholder
            image={<WebhooksEmpty />}
            imageDark={<WebhooksEmptyDark />}
            title="webhooks.placeholder.title"
            description="webhooks.placeholder.description"
            action={
              <Button
                title="webhooks.placeholder.create_webhook"
                type="primary"
                size="large"
                icon={<Plus />}
                onClick={() => {
                  navigate(createWebhookPathname);
                }}
              />
            }
          />
        ),
      }}
      widgets={
        <CreateFormModal
          isOpen={isCreateNew}
          onClose={(createdHook?: Hook) => {
            if (createdHook) {
              void mutate();
              toast.success(t('webhooks.webhook_created', { name: createdHook.name }));
              navigate(buildDetailsPathname(createdHook.id), { replace: true });
              return;
            }

            navigate(webhooksPathname);
          }}
        />
      }
    />
  );
}

export default withAppInsights(Webhooks);
