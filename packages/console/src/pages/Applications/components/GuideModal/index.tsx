import React from 'react';
import Modal from 'react-modal';

import Guide from '@/pages/Guide';
import * as modalStyles from '@/scss/modal.module.scss';
import { SupportedJavascriptLibraries } from '@/types/applications';
import { GuideForm } from '@/types/guide';

import LibrarySelector from '../LibrarySelector';

type Props = {
  appName: string;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: GuideForm) => Promise<void>;
};

const GuideModal = ({ appName, isOpen, onClose, onComplete }: Props) => (
  <Modal isOpen={isOpen} className={modalStyles.fullScreen}>
    <Guide
      bannerComponent={<LibrarySelector />}
      title={appName}
      subtitle="applications.get_started.header_description"
      defaultSubtype={SupportedJavascriptLibraries.React}
      onClose={onClose}
      onComplete={onComplete}
    />
  </Modal>
);

export default GuideModal;
