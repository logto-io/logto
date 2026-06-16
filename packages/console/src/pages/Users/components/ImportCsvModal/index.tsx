import { conditional } from '@silverhand/essentials';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';

import Button from '@/ds-components/Button';
import ModalLayout from '@/ds-components/ModalLayout';
import useApi from '@/hooks/use-api';
import modalStyles from '@/scss/modal.module.scss';

import styles from './index.module.scss';

type Props = {
  readonly onClose: () => void;
  readonly onCreate: () => void;
};

type UserRow = {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  password?: string;
  name?: string;
};

const parseLine = (line: string): string[] => {
  const { values, current, inQuotes } = [...line].reduce<{
    values: string[];
    current: string;
    inQuotes: boolean;
  }>(
    (accumulator, char) => {
      if (char === '"') {
        return { ...accumulator, inQuotes: !accumulator.inQuotes };
      }
      if (char === ',' && !accumulator.inQuotes) {
        return {
          values: [...accumulator.values, accumulator.current.trim()],
          current: '',
          inQuotes: false,
        };
      }
      return { ...accumulator, current: accumulator.current + char };
    },
    { values: [], current: '', inQuotes: false }
  );

  return [...values, current.trim()].map((value) => value.replaceAll(/^"|"$/g, ''));
};

function ImportCsvModal({ onClose, onCreate }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [selectedFile, setSelectedFile] = useState<File>();
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, success: 0, failed: 0 });
  const [isFinished, setIsFinished] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const api = useApi();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file);
    setIsFinished(false);
    setProgress({ current: 0, total: 0, success: 0, failed: 0 });
  };

  const parseCsv = async (file: File): Promise<UserRow[]> => {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '');
    if (lines.length < 2) {
      return [];
    }

    const headers = parseLine(lines[0] ?? '').map((header) => header.toLowerCase());

    return lines.slice(1).map((line): UserRow => {
      const values = parseLine(line);
      return headers.reduce<UserRow>(
        (row, header, index) => {
          return {
            ...row,
            [header]: values[index],
          };
        },
        { id: '', username: '', first_name: '', last_name: '' }
      );
    });
  };

  const handleImport = async () => {
    if (!selectedFile) {
      return;
    }

    setIsImporting(true);
    setIsFinished(false);
    const data = await parseCsv(selectedFile);
    setProgress({ current: 0, total: data.length, success: 0, failed: 0 });

    for (const row of data) {
      try {
        const payload = {
          primaryEmail: row.username,
          isEmailVerified: true,
          name: row.name ?? `${row.first_name} ${row.last_name}`.trim(),
          customData: {
            old_id: row.id,
            first_name: row.first_name,
            last_name: row.last_name,
          },
          ...conditional(
            row.password?.startsWith('$6$') && {
              passwordAlgorithm: 'Legacy',
              passwordDigest: JSON.stringify(['sha512crypt', ['@'], row.password]),
            }
          ),
        };

        // eslint-disable-next-line no-await-in-loop
        await api.post('api/users', { json: payload }).json();
        setProgress((previous) => ({
          ...previous,
          current: previous.current + 1,
          success: previous.success + 1,
        }));
      } catch (error: unknown) {
        // Handle "already exists" as success or skip as in migration script
        if (
          error instanceof Error &&
          'response' in error &&
          typeof error.response === 'object' &&
          error.response !== null &&
          'status' in error.response &&
          error.response.status === 409
        ) {
          setProgress((previous) => ({
            ...previous,
            current: previous.current + 1,
            success: previous.success + 1,
          }));
        } else {
          setProgress((previous) => ({
            ...previous,
            current: previous.current + 1,
            failed: previous.failed + 1,
          }));
        }
      }
      // Rate limiting
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => {
        setTimeout(resolve, 50);
      });
    }

    setIsImporting(false);
    setIsFinished(true);
    onCreate();
  };

  return (
    <Modal
      shouldCloseOnEsc
      isOpen
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={onClose}
    >
      <ModalLayout
        title="users.import_csv"
        subtitle="users.import_csv_subtitle"
        footer={
          <div style={{ display: 'flex', gap: '8px' }}>
            {isFinished ? (
              <Button title="general.close" size="large" type="primary" onClick={onClose} />
            ) : (
              <>
                <Button
                  disabled={isImporting}
                  title="general.cancel"
                  size="large"
                  type="outline"
                  onClick={onClose}
                />
                <Button
                  disabled={!selectedFile || isImporting}
                  title={isImporting ? 'users.import_csv_importing' : 'users.import_csv_start'}
                  size="large"
                  type="primary"
                  onClick={handleImport}
                />
              </>
            )}
          </div>
        }
        onClose={onClose}
      >
        <div className={styles.container}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className={styles.hiddenInput}
            onChange={handleFileChange}
          />
          {!isImporting && !isFinished && (
            <Button
              title="users.import_csv_select_file"
              size="large"
              type="outline"
              onClick={() => {
                fileInputRef.current?.click();
              }}
            />
          )}
          <p className={styles.fileName}>
            {selectedFile
              ? t('users.import_csv_selected_file', { filename: selectedFile.name })
              : t('users.import_csv_no_file')}
          </p>
          {isImporting && (
            <div className={styles.progress}>
              <p>
                {t('users.import_csv_progress', {
                  current: progress.current,
                  total: progress.total,
                })}
              </p>
            </div>
          )}
          {isFinished && (
            <div className={styles.finished}>
              <p>
                {t('users.import_csv_finished', {
                  success: progress.success,
                  failed: progress.failed,
                })}
              </p>
            </div>
          )}
        </div>
      </ModalLayout>
    </Modal>
  );
}

export default ImportCsvModal;
