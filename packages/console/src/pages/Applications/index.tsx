import type { Application } from '@logto/schemas';
import classNames from 'classnames';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useSWR from 'swr';

import Plus from '@/assets/images/plus.svg';
import ApplicationIcon from '@/components/ApplicationIcon';
import Button from '@/components/Button';
import CardTitle from '@/components/CardTitle';
import CopyToClipboard from '@/components/CopyToClipboard';
import ItemPreview from '@/components/ItemPreview';
import Pagination from '@/components/Pagination';
import TableEmpty from '@/components/Table/TableEmpty';
import TableError from '@/components/Table/TableError';
import TableLoading from '@/components/Table/TableLoading';
import type { RequestError } from '@/hooks/use-api';
import useModalControl from '@/hooks/use-modal-control';
import * as modalStyles from '@/scss/modal.module.scss';
import * as resourcesStyles from '@/scss/resources.module.scss';
import * as tableStyles from '@/scss/table.module.scss';
import { applicationTypeI18nKey } from '@/types/applications';

import CreateForm from './components/CreateForm';
import * as styles from './index.module.scss';

const pageSize = 20;

const Applications = () => {
  const navigate = useNavigate();
  const { open, isOpen } = useModalControl('create_application');
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [query, setQuery] = useSearchParams();
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
            open();
          }}
        />
        <Modal
          shouldCloseOnEsc
          isOpen={isOpen}
          className={modalStyles.content}
          overlayClassName={modalStyles.overlay}
          onRequestClose={() => {
            navigate(-1);
          }}
        >
          <CreateForm
            onClose={(createdApp) => {
              if (createdApp) {
                toast.success(t('applications.application_created', { name: createdApp.name }));
                navigate(`/applications/${createdApp.id}`, { replace: true });

                return;
              }
              navigate(-1);
            }}
          />
        </Modal>
      </div>{' '}
      <div className={resourcesStyles.table}>
        <div className={tableStyles.scrollable}>
          <table className={classNames(!data && tableStyles.empty)}>
            <colgroup>
              <col className={styles.applicationName} />
              <col />
            </colgroup>

            <thead>
              <tr>
                <th>{t('applications.application_name')}</th>
                <th>{t('applications.app_id')}</th>
              </tr>
            </thead>

            <tbody>
              {!data && error && (
                <TableError
                  columns={2}
                  content={error.body?.message ?? error.message}
                  onRetry={async () => mutate(undefined, true)}
                />
              )}
              {isLoading && <TableLoading columns={2} />}
              {applications?.length === 0 && (
                <TableEmpty columns={2}>
                  <Button
                    title="applications.create"
                    type="outline"
                    onClick={() => {
                      open();
                    }}
                  />
                </TableEmpty>
              )}
              {applications?.map(({ id, name, type }) => (
                <tr
                  key={id}
                  className={tableStyles.clickable}
                  onClick={() => {
                    navigate(`/applications/${id}`);
                  }}
                >
                  <td>
                    <ItemPreview
                      title={name}
                      subtitle={t(`${applicationTypeI18nKey[type]}.title`)}
                      icon={<ApplicationIcon className={styles.icon} type={type} />}
                      to={`/applications/${id}`}
                    />
                  </td>
                  <td>
                    <CopyToClipboard value={id} variant="text" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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
