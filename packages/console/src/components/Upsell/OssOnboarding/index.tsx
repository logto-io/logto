import classNames from 'classnames';
import { useState } from 'react';

import Logo from '@/assets/images/logo.svg?react';
import BookIcon from '@/assets/icons/book.svg?react';
import BuildingIcon from '@/assets/icons/building.svg?react';
import ProfileIcon from '@/assets/icons/profile.svg?react';
import ActionBar from '@/components/ActionBar';
import Button from '@/ds-components/Button';
import DangerousRaw from '@/ds-components/DangerousRaw';
import FormField from '@/ds-components/FormField';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import TextInput from '@/ds-components/TextInput';

import styles from './index.module.scss';

type Purpose = 'personal' | 'company' | 'learning';

type Props = {
  readonly onClose: () => void;
};

function OssOnboarding({ onClose }: Props) {
  const [email, setEmail] = useState('');
  const [purpose, setPurpose] = useState<Purpose>();
  const [companyName, setCompanyName] = useState('');
  const [subscribeToEmails, setSubscribeToEmails] = useState(false);

  const isSubmitDisabled = !email || !purpose;

  return (
    <div className={styles.app}>
      <div className={styles.topbar}>
        <Logo className={styles.logo} />
      </div>
      <OverlayScrollbar className={styles.contentContainer}>
        <div className={styles.content}>
          <div className={styles.title}>Welcome to Logto</div>
          <div className={styles.description}>
            Tell us a bit about yourself so we can tailor your experience
          </div>
          <FormField title={<DangerousRaw>Email address</DangerousRaw>} isRequired>
            <TextInput
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.currentTarget.value);
              }}
            />
          </FormField>
          <FormField title={<DangerousRaw>What will you use Logto for?</DangerousRaw>} isRequired>
            <div className={styles.purposeOptions}>
              <div
                role="button"
                tabIndex={0}
                className={classNames(styles.purposeCard, purpose === 'personal' && styles.selected)}
                onClick={() => {
                  setPurpose('personal');
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    setPurpose('personal');
                  }
                }}
              >
                <ProfileIcon className={styles.purposeIcon} />
                <span className={styles.purposeLabel}>Personal project</span>
              </div>
              <div
                role="button"
                tabIndex={0}
                className={classNames(styles.purposeCard, purpose === 'company' && styles.selected)}
                onClick={() => {
                  setPurpose('company');
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    setPurpose('company');
                  }
                }}
              >
                <BuildingIcon className={styles.purposeIcon} />
                <span className={styles.purposeLabel}>Company product</span>
              </div>
              <div
                role="button"
                tabIndex={0}
                className={classNames(styles.purposeCard, purpose === 'learning' && styles.selected)}
                onClick={() => {
                  setPurpose('learning');
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    setPurpose('learning');
                  }
                }}
              >
                <BookIcon className={styles.purposeIcon} />
                <span className={styles.purposeLabel}>Learning & evaluation</span>
              </div>
            </div>
          </FormField>
          {purpose === 'company' && (
            <FormField title={<DangerousRaw>Company name</DangerousRaw>}>
              <TextInput
                placeholder="Your company name"
                value={companyName}
                onChange={(event) => {
                  setCompanyName(event.currentTarget.value);
                }}
              />
            </FormField>
          )}
          <label className={styles.checkboxRow}>
            <input
              className={styles.checkboxInput}
              type="checkbox"
              checked={subscribeToEmails}
              onChange={() => {
                setSubscribeToEmails((previous) => !previous);
              }}
            />
            <span className={styles.checkboxLabel}>
              I agree to subscribe to Logto emails for product updates, blog posts, best practices,
              and related news
            </span>
          </label>
        </div>
      </OverlayScrollbar>
      <ActionBar>
        <Button
          type="primary"
          title={<DangerousRaw>Get started</DangerousRaw>}
          disabled={isSubmitDisabled}
          onClick={onClose}
        />
      </ActionBar>
    </div>
  );
}

export default OssOnboarding;
