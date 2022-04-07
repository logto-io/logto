import React from 'react';
import Modal from 'react-modal';

import GetStarted from '@/pages/GetStarted';
import * as modalStyles from '@/scss/modal.module.scss';
import { SupportedJavascriptLibraries } from '@/types/applications';
import { GetStartedForm } from '@/types/get-started';

import LibrarySelector from '../LibrarySelector';

type Props = {
  appName: string;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: GetStartedForm) => Promise<void>;
};

const GetStartedModal = ({ appName, isOpen, onClose, onComplete }: Props) => (
  <Modal isOpen={isOpen} className={modalStyles.fullScreen}>
    <GetStarted
      bannerComponent={<LibrarySelector />}
      title={appName}
      subtitle="applications.get_started.header_description"
      type="application"
      defaultSubtype={SupportedJavascriptLibraries.React}
      onClose={onClose}
      onComplete={onComplete}
    />
  </Modal>
);

export default GetStartedModal;
