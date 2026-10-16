import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';

import FormCardLayout from '@/components/FormCard/FormCardLayout';
import Button from '@/ds-components/Button';
import useApi, { type RequestError } from '@/hooks/use-api';

import styles from '../index.module.scss';

type StackOption = {
  id: 'full' | 'lite' | 'dai' | 'fai' | 'v1';
  title: string;
  description: string;
  template?: string;
  // Components excluded from the template. Dashboard AI keeps only the dai-* set and postgres.
  exclude: string[];
  available: boolean;
};

const faiExcluded = [
  'backend',
  'frontend',
  'opa',
  'postgres',
  'processor',
  'scheduler',
  'storage-engine',
  'trino',
  'dai-backend',
  'dai-frontend',
  'watcher',
  'foundation-bootstrap',
  'hive-metastore',
];

const daiExcluded = [
  'backend',
  'frontend',
  'opa',
  'processor',
  'scheduler',
  'storage-engine',
  'trino',
  'ai',
  'watcher',
  'foundation-bootstrap',
  'hive-metastore',
];

const stackOptions: StackOption[] = [
  {
    id: 'full',
    title: 'Foundation HA',
    description: 'The complete platform: high-availability database and Trino catalog.',
    template: 'full',
    exclude: [],
    available: true,
  },
  {
    id: 'lite',
    title: 'Foundation',
    description: 'A lighter setup with one database instance. Good for trials and small teams.',
    template: 'lite',
    exclude: [],
    available: true,
  },
  {
    id: 'dai',
    title: 'Dashboards AI',
    description: 'Just the AI dashboard components and their database.',
    template: 'full',
    exclude: daiExcluded,
    available: true,
  },
  {
    id: 'fai',
    title: 'Foundation AI',
    description: 'Only the foundation-ai component.',
    template: 'full',
    exclude: faiExcluded,
    available: true,
  },
  { id: 'v1', title: 'V1', description: 'Not available yet.', exclude: [], available: false },
];

function KuboWizard() {
  const api = useApi();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selected, setSelected] = useState<StackOption>();
  const [tenant, setTenant] = useState('');
  const [mode, setMode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>();

  const previewKey =
    step === 3 && selected?.template && tenant
      ? `api/kubo/template?${new URLSearchParams({ template: selected.template, tenant, ...(mode ? { mode } : {}) }).toString()}`
      : null;
  const preview = useSWR<{ yaml: string }, RequestError>(previewKey);

  const create = async () => {
    if (!selected?.template) {
      return;
    }
    setSubmitting(true);
    setSubmitError(undefined);
    try {
      await api
        .post('api/kubo/stacks', {
          json: {
            template: selected.template,
            tenant,
            ...(mode ? { mode } : {}),
            ...(selected.exclude.length > 0 ? { exclude: selected.exclude } : {}),
          },
        })
        .json();
      navigate('/infrastructure');
    } catch (error: unknown) {
      setSubmitError(error instanceof Error ? error.message : 'Create failed');
    } finally {
      setSubmitting(false);
    }
  };

  const canContinue = step === 1 ? Boolean(selected?.available) : tenant.trim().length > 0;

  const introduction = (
    <>
      <h3 className={styles.introTitle}>
        {step === 1 ? 'Choose a workspace' : step === 2 ? 'Set the tenant' : 'Review and create'}
      </h3>
      <p className={styles.introText}>
        {step === 1
          ? 'Pick a workspace type. Each type starts from an approved template.'
          : step === 2
            ? 'Enter the tenant ID. Mode is optional.'
            : 'Check the rendered YAML before you create the workspace.'}
      </p>
      <p className={styles.stepLabel}>Step {step} of 3</p>
    </>
  );

  return (
    <>
      <Helmet title="MeshX · New workspace" />
      <FormCardLayout introduction={introduction}>
        {step === 1 && (
          <>
            <div className={styles.progress} aria-label="Step 1 of 3">
              <span className={styles.progressOn} />
              <span />
              <span />
            </div>
            <ul className={styles.quickstart}>
              {stackOptions.map((option) => (
                <li key={option.id}>
                  <button
                    type="button"
                    disabled={!option.available}
                    aria-pressed={selected?.id === option.id}
                    className={`${styles.quickstartItem} ${selected?.id === option.id ? styles.quickstartItemSelected : ''}`}
                    onClick={() => {
                      setSelected(option);
                    }}
                  >
                    <span className={styles.quickstartText}>
                      <span className={styles.choiceTitle}>{option.title}</span>
                      <span className={styles.muted}>{option.description}</span>
                    </span>
                    {!option.available && <span className={styles.badge}>Coming soon</span>}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {step === 2 && (
          <div className={styles.form}>
            <label className={styles.field}>
              Tenant ID
              <input
                value={tenant}
                placeholder="acme"
                onChange={(event) => {
                  setTenant(event.target.value.trim());
                }}
              />
            </label>
            <label className={styles.field}>
              Mode (optional)
              <input
                value={mode}
                placeholder="Direct"
                onChange={(event) => {
                  setMode(event.target.value.trim());
                }}
              />
            </label>
          </div>
        )}

        {step === 3 && (
          <>
            <dl className={styles.budget}>
              <dt>Type</dt>
              <dd>{selected?.title}</dd>
              <dt>Template</dt>
              <dd>{selected?.template}</dd>
              <dt>Tenant</dt>
              <dd>{tenant}</dd>
              <dt>Excluded</dt>
              <dd>
                {selected && selected.exclude.length > 0 ? selected.exclude.join(', ') : 'none'}
              </dd>
            </dl>
            {preview.isLoading && <p className={styles.muted}>Rendering preview…</p>}
            {preview.error && <p className={styles.muted}>Preview unavailable.</p>}
            {preview.data && <pre className={styles.pre}>{preview.data.yaml}</pre>}
            {submitError && <p className={styles.error}>{submitError}</p>}
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
              title="general.create"
              type="primary"
              isLoading={submitting}
              disabled={!selected?.template || !tenant}
              onClick={() => {
                void create();
              }}
            />
          )}
        </div>
      </FormCardLayout>
    </>
  );
}

export default KuboWizard;
