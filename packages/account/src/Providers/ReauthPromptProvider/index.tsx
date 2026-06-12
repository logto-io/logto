import DynamicT from '@experience/shared/components/DynamicT';
import { useLogto } from '@logto/react';
import type { ReactNode } from 'react';
import { useCallback, useMemo, useState } from 'react';

import ConfirmModal from '@ac/components/ConfirmModal';
import { accountCenterBasePath, setRouteRestore } from '@ac/utils/account-center-route';

import ReauthPromptContext from './ReauthPromptContext';

const redirectUri = `${window.location.origin}${accountCenterBasePath}`;

type Props = {
  readonly children: ReactNode;
};

const ReauthPromptProvider = ({ children }: Props) => {
  const { signIn } = useLogto();
  const [isOpen, setIsOpen] = useState(false);

  const requestReauthPrompt = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closePrompt = useCallback(() => {
    setIsOpen(false);
  }, []);

  const confirmReauth = useCallback(() => {
    closePrompt();
    setRouteRestore(window.location.pathname);

    void signIn({ redirectUri });
  }, [closePrompt, signIn]);

  const contextValue = useMemo(
    () => ({
      requestReauthPrompt,
    }),
    [requestReauthPrompt]
  );

  return (
    <ReauthPromptContext.Provider value={contextValue}>
      {children}
      <ConfirmModal
        isOpen={isOpen}
        title="error.something_went_wrong"
        confirmText="action.sign_in"
        cancelText="action.cancel"
        onConfirm={confirmReauth}
        onCancel={closePrompt}
      >
        <DynamicT forKey="error.invalid_session" />
      </ConfirmModal>
    </ReauthPromptContext.Provider>
  );
};

export default ReauthPromptProvider;
