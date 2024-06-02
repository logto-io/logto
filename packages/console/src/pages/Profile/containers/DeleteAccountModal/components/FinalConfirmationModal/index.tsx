import { useLogto } from '@logto/react';
import { ResponseError } from '@withtyped/client';
import { useContext, useState } from 'react';
import ReactModal from 'react-modal';

import { useCloudApi, useAuthedCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type TenantResponse } from '@/cloud/types/router';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import ModalLayout from '@/ds-components/ModalLayout';
import useRedirectUri from '@/hooks/use-redirect-uri';
import * as modalStyles from '@/scss/modal.module.scss';

import * as styles from '../../index.module.scss';

type Props = {
  readonly userId: string;
  readonly tenantsToDelete: readonly TenantResponse[];
  readonly tenantsToQuit: readonly TenantResponse[];
  readonly onClose: () => void;
};

/** The final confirmation modal for deletion, and where the deletion process happens. */
export default function FinalConfirmationModal({
  userId,
  tenantsToDelete,
  tenantsToQuit,
  onClose,
}: Props) {
  const { signOut } = useLogto();
  const { removeTenant } = useContext(TenantsContext);
  const postSignOutRedirectUri = useRedirectUri('signOut');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletionError, setDeletionError] = useState<Error>();
  const errorRequestId =
    deletionError instanceof ResponseError
      ? deletionError.response.headers.get('logto-cloud-request-id')
      : null;
  const cloudApi = useCloudApi();
  const authedCloudApi = useAuthedCloudApi();
  const deleteAccount = async () => {
    if (isDeleting) {
      return;
    }

    setIsDeleting(true);

    try {
      for (const tenant of tenantsToDelete) {
        // eslint-disable-next-line no-await-in-loop
        await cloudApi.delete(`/api/tenants/:tenantId`, {
          params: { tenantId: tenant.id },
        });
        removeTenant(tenant.id);
      }

      for (const tenant of tenantsToQuit) {
        // eslint-disable-next-line no-await-in-loop
        await authedCloudApi.delete('/api/tenants/:tenantId/members/:userId', {
          params: { tenantId: tenant.id, userId },
        });
        removeTenant(tenant.id);
      }

      // @ts-expect-error bump the version of @logto/cloud will fix this
      await cloudApi.delete('/api/me', {});
      await signOut(postSignOutRedirectUri.href);
    } catch (error) {
      setDeletionError(error instanceof Error ? error : new Error(String(error)));
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ReactModal
      shouldCloseOnEsc
      isOpen
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
    >
      {deletionError ? (
        <ModalLayout
          title="An error occurred"
          footer={<Button size="large" title="general.got_it" onClick={onClose} />}
        >
          <div className={styles.container}>
            <p>Sorry, something went wrong while deleting your account:</p>
            <p>
              <code>{deletionError.message}</code>
              {errorRequestId && (
                <>
                  <br />
                  <code>Request ID: {errorRequestId}</code>
                </>
              )}
            </p>
            <p>
              Please try again later. If the problem persists, please contact Logto team with the
              request ID.
            </p>
          </div>
        </ModalLayout>
      ) : (
        <ModalLayout
          title="Final confirmation"
          footer={
            <>
              <Button size="large" disabled={isDeleting} title="general.cancel" onClick={onClose} />
              <Button
                size="large"
                disabled={isDeleting}
                isLoading={isDeleting}
                type="danger"
                title="general.delete"
                onClick={deleteAccount}
              />
            </>
          }
        >
          <div className={styles.container}>
            You are about to start the deletion process and this action cannot be undone.
          </div>
        </ModalLayout>
      )}
    </ReactModal>
  );
}
