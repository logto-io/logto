/* eslint-disable no-restricted-syntax -- The inherited Kubo bundle form uses narrow DOM casts; keep prerequisite integration scoped until form controls expose typed values. */
import { useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';

import welcomeImage from '@/assets/images/wizard/welcome-pixel.png';
import FormCardLayout from '@/components/FormCard/FormCardLayout';
import Button from '@/ds-components/Button';
import TextInput from '@/ds-components/TextInput';
import useApi from '@/hooks/use-api';

import styles from '../index.module.scss';

// Air-gapped bundle upload, as a three-step wizard like the workspace wizard:
// choose the file, name it, then review and upload. The file goes through Logto core to the Kubo portal.
const namePattern = /^[\da-z]([\d.a-z-]{0,61}[\da-z])?$/;

const formatSize = (bytes: number) =>
  bytes > 1024 ** 3
    ? `${(bytes / 1024 ** 3).toFixed(2)} GiB`
    : `${(bytes / 1024 ** 2).toFixed(1)} MiB`;

const steps = [
  {
    title: 'Choose a bundle file',
    text: 'Pick the offline bundle (.tar) to upload for air-gapped installs.',
  },
  {
    title: 'Name the bundle',
    text: 'Use lowercase letters, digits, dots and hyphens.',
  },
  {
    title: 'Review and upload',
    text: 'Check the file and name, then upload to the Kubo portal.',
  },
];

function Bundle() {
  const api = useApi();
  const fileInput = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('');
  const [file, setFile] = useState<File>();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string>();
  const [failed, setFailed] = useState(false);

  const nameValid = namePattern.test(name);
  const canContinue = step === 1 ? Boolean(file) : step === 2 ? nameValid : false;

  const upload = async () => {
    if (!file || !nameValid) {
      return;
    }
    setUploading(true);
    setMessage(undefined);
    setFailed(false);
    try {
      const result = await api
        .post(`api/kubo/airgap/bundle?name=${encodeURIComponent(name)}`, {
          body: file,
          headers: { 'content-type': 'application/x-tar' },
          timeout: false,
        })
        .json<{ message: string }>();
      setMessage(result.message || 'Bundle uploaded.');
    } catch (error: unknown) {
      setFailed(true);
      setMessage(error instanceof Error ? error.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const introduction = useMemo(
    () => (
      <>
        <img className={styles.stepImage} src={welcomeImage} alt="" />
        <ol className={styles.stepper} aria-label={`Step ${step} of 3`}>
          {steps.map((item, index) => {
            const number = index + 1;
            const isActive = number === step;
            const isDone = number < step;
            return (
              <li
                key={item.title}
                className={styles.stepItem}
                aria-current={isActive ? 'step' : undefined}
              >
                <button
                  type="button"
                  className={styles.stepButton}
                  disabled={number > step}
                  onClick={() => {
                    setStep(number as 1 | 2 | 3);
                  }}
                >
                  <span
                    className={`${styles.stepBubble} ${isActive ? styles.stepBubbleActive : ''} ${isDone ? styles.stepBubbleDone : ''}`}
                  >
                    {number}
                  </span>
                  <span className={styles.stepText}>
                    <span className={isActive ? styles.stepTitleActive : styles.stepTitle}>
                      {item.title}
                    </span>
                    {isActive && <span className={styles.stepDescription}>{item.text}</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </>
    ),
    [step]
  );

  return (
    <>
      <Helmet title="MeshX · Bundle" />
      <FormCardLayout introduction={introduction}>
        <div className={styles.progress} aria-label={`Step ${step} of 3`}>
          {[1, 2, 3].map((index) => (
            <span key={index} className={index <= step ? styles.progressOn : undefined} />
          ))}
        </div>

        {step === 1 && (
          <div className={styles.form}>
            <input
              ref={fileInput}
              hidden
              type="file"
              accept=".tar"
              onChange={(event) => {
                setFile((event.target as HTMLInputElement).files?.[0]);
              }}
            />
            <Button
              title="infrastructure.bundle_file"
              type="outline"
              onClick={() => {
                fileInput.current?.click();
              }}
            />
            {file ? (
              <p className={styles.muted}>
                {file.name} · {formatSize(file.size)}
              </p>
            ) : (
              <p className={styles.muted}>No file chosen yet.</p>
            )}
          </div>
        )}

        {step === 2 && (
          <div className={styles.form}>
            <TextInput
              title="infrastructure.bundle_name"
              placeholder="foundation-bundle-0-1-14"
              value={name}
              onChange={(event) => {
                setName((event.target as HTMLInputElement).value.trim().toLowerCase());
              }}
            />
            {name && !nameValid && (
              <p className={styles.error}>
                Use lowercase letters, digits, dots and hyphens. Start and end with a letter or
                digit.
              </p>
            )}
          </div>
        )}

        {step === 3 && (
          <>
            <dl className={styles.budget}>
              <dt>File</dt>
              <dd>{file?.name}</dd>
              <dt>Size</dt>
              <dd>{file ? formatSize(file.size) : '—'}</dd>
              <dt>Name</dt>
              <dd>{name}</dd>
            </dl>
            {message && <p className={failed ? styles.error : styles.muted}>{message}</p>}
          </>
        )}

        <div className={styles.actions}>
          {step > 1 && (
            <Button
              title="general.back"
              type="outline"
              onClick={() => {
                setStep((step - 1) as 1 | 2);
              }}
            />
          )}
          {step < 3 && (
            <Button
              title="general.next"
              type="primary"
              disabled={!canContinue}
              onClick={() => {
                setStep((step + 1) as 2 | 3);
              }}
            />
          )}
          {step === 3 && (
            <Button
              title="infrastructure.upload"
              type="primary"
              isLoading={uploading}
              disabled={!file || !nameValid}
              onClick={() => {
                void upload();
              }}
            />
          )}
        </div>
      </FormCardLayout>
    </>
  );
}

export default Bundle;
/* eslint-enable no-restricted-syntax */
