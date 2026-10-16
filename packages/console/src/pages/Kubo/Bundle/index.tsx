import { useState } from 'react';
import { Helmet } from 'react-helmet';

import Button from '@/ds-components/Button';
import useApi from '@/hooks/use-api';

import styles from '../index.module.scss';

// Air-gapped bundle upload. The file goes through Logto core to the Kubo portal.
function Bundle() {
  const api = useApi();
  const [name, setName] = useState('');
  const [file, setFile] = useState<File>();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string>();
  const [failed, setFailed] = useState(false);

  const upload = async () => {
    if (!file || !name) {
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

  return (
    <div className={styles.container}>
      <Helmet title="MeshX · Bundle" />
      <div className={styles.header}>
        <div className={styles.eyebrow}>Infrastructure / Bundle</div>
        <h2 className={styles.title}>Bundle upload</h2>
        <p className={styles.description}>
          Upload an air-gapped bundle (.tar). Name it with a lowercase label, for example
          foundation-bundle-0-1-14.
        </p>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Upload</div>
        <div className={styles.form}>
          <label className={styles.field}>
            Bundle name
            <input
              value={name}
              placeholder="foundation-bundle-0-1-14"
              onChange={(event) => {
                setName(event.target.value.trim().toLowerCase());
              }}
            />
          </label>
          <label className={styles.field}>
            Bundle file (.tar)
            <input
              type="file"
              accept=".tar"
              onChange={(event) => {
                setFile(event.target.files?.[0]);
              }}
            />
          </label>
        </div>
        <div className={styles.actions}>
          <Button
            title="general.create"
            type="primary"
            isLoading={uploading}
            disabled={!file || !name}
            onClick={() => {
              void upload();
            }}
          />
        </div>
        {message && <p className={failed ? styles.error : styles.muted}>{message}</p>}
      </div>
    </div>
  );
}

export default Bundle;
