import type { Application } from '@logto/schemas';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import useSWR from 'swr';

import Plus from '@/assets/images/plus.svg';
import ApplicationIcon from '@/components/ApplicationIcon';
import Button from '@/components/Button';
import CardTitle from '@/components/CardTitle';
import CopyToClipboard from '@/components/CopyToClipboard';
import ItemPreview from '@/components/ItemPreview';
import Pagination from '@/components/Pagination';
import Table from '@/components/Table';
import type { RequestError } from '@/hooks/use-api';
import * as modalStyles from '@/scss/modal.module.scss';
import * as resourcesStyles from '@/scss/resources.module.scss';
import { applicationTypeI18nKey } from '@/types/applications';

import CreateForm from './components/CreateForm';
import * as styles from './index.module.scss';

const pageSize = 20;

const applicationsPathname = '/applications';
const createApplicationPathname = `${applicationsPathname}/create`;
const buildDetailsPathname = (id: string) => `${applicationsPathname}/${id}`;

const Applications = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isCreateNew = pathname === createApplicationPathname;
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [query, setQuery] = useSearchParams();
  const search = query.toString();
  const pageIndex = Number(query.get('page') ?? '1');
  const { data, error, mutate } = useSWR<[Application[], number], RequestError>(
    `/api/applications?page=${pageIndex}&page_size=${pageSize}`
  );
  const isLoading = !data && !error;
  const [applications, totalCount] = data ?? [];

  return (
    <div className={resourcesStyles.container}>
      <div className={resourcesStyles.headline}>
        <CardTitle title="applications.title" subtitle="applications.subtitle" />
        <Button
          icon={<Plus />}
          title="applications.create"
          type="primary"
          size="large"
          onClick={() => {
            navigate({
              pathname: createApplicationPathname,
              search,
            });
          }}
        />
        <Modal
          shouldCloseOnEsc
          isOpen={isCreateNew}
          className={modalStyles.content}
          overlayClassName={modalStyles.overlay}
          onRequestClose={() => {
            navigate({
              pathname: applicationsPathname,
              search,
            });
          }}
        >
          <CreateForm
            onClose={(createdApp) => {
              if (createdApp) {
                toast.success(t('applications.application_created', { name: createdApp.name }));
                navigate(buildDetailsPathname(createdApp.id), { replace: true });

                return;
              }
              navigate({
                pathname: applicationsPathname,
                search,
              });
            }}
          />
        </Modal>
      </div>
      <Table
        className={resourcesStyles.table}
        rowGroups={[{ key: 'applications', data: applications }]}
        rowIndexKey="id"
        isLoading={isLoading}
        errorMessage={error?.body?.message ?? error?.message}
        columns={[
          {
            title: t('applications.application_name'),
            dataIndex: 'name',
            colSpan: 6,
            render: ({ id, name, type }) => (
              <ItemPreview
                title={name}
                subtitle={t(`${applicationTypeI18nKey[type]}.title`)}
                icon={<ApplicationIcon className={styles.icon} type={type} />}
                to={buildDetailsPathname(id)}
              />
            ),
          },
          {
            title: t('applications.app_id'),
            dataIndex: 'id',
            colSpan: 10,
            render: ({ id }) => <CopyToClipboard value={id} variant="text" />,
          },
        ]}
        placeholder={
          <Button
            title="applications.create"
            type="outline"
            onClick={() => {
              navigate({
                pathname: createApplicationPathname,
                search,
              });
            }}
          />
        }
        clickRowHandler={({ id }) =>
          () => {
            navigate(buildDetailsPathname(id));
          }}
        onRetry={async () => mutate(undefined, true)}
      />
      <Pagination
        pageIndex={pageIndex}
        totalCount={totalCount}
        pageSize={pageSize}
        className={styles.pagination}
        onChange={(page) => {
          setQuery({ page: String(page) });
        }}
      />
    </div>
  );
};

export default Applications;
