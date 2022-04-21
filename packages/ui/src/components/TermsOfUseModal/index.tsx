import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import reactStringReplace from 'react-string-replace';

import ConfirmModal from '../ConfirmModal';
import TextLink from '../TextLink';
import * as styles from './index.module.scss';

type Props = {
  isOpen?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  termsUrl: string;
};

const TermsOfUseModal = ({ isOpen = false, termsUrl, onConfirm, onClose }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });

  const terms = t('description.terms_of_use');
  const content = t('description.agree_with_terms_modal', { terms });

  const modalContent: ReactNode = reactStringReplace(content, terms, () => (
    <TextLink
      className={styles.link}
      text="description.terms_of_use"
      href={termsUrl}
      target="_blank"
      type="secondary"
    />
  ));

  return (
    <ConfirmModal
      className={styles.content}
      isOpen={isOpen}
      onConfirm={onConfirm}
      onClose={onClose}
    >
      {modalContent}
    </ConfirmModal>
  );
};

export default TermsOfUseModal;
