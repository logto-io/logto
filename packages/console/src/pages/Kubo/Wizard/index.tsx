/* eslint-disable consistent-default-export-name/default-export-match-filename, no-restricted-syntax, max-lines -- The inherited multi-step Kubo wizard is kept intact as a prerequisite; split and type its form model separately. */
import { HTTPError } from 'ky';
import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import useSWR from 'swr';

import congratsImage from '@/assets/images/congrats.svg?url';
import organizationImage from '@/assets/images/organization-empty.svg?url';
import robotCapacity from '@/assets/images/wizard/robot-capacity.png';
import robotReview from '@/assets/images/wizard/robot-review.png';
import robotTemplate from '@/assets/images/wizard/robot-template.png';
import welcomeImage from '@/assets/images/wizard/welcome-pixel.png';
import FormCardLayout from '@/components/FormCard/FormCardLayout';
import Button from '@/ds-components/Button';
import Select from '@/ds-components/Select';
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

// Shows the portal's own message (for example an invalid tenant) instead of a generic status.
const readError = async (error: unknown) => {
  if (error instanceof HTTPError) {
    try {
      const body = await error.response.clone().json();
      if (
        typeof body === 'object' &&
        body !== null &&
        'message' in body &&
        typeof body.message === 'string'
      ) {
        return body.message;
      }
    } catch {
      // Not JSON: fall through to the generic message.
    }
  }
  return error instanceof Error ? error.message : 'Create failed';
};

// Lowercase RFC-1123 label, as the portal requires for a tenant ID.
const tenantPattern = /^[\da-z]([\da-z-]{0,61}[\da-z])?$/;

function KuboWizard() {
  const api = useApi();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selected, setSelected] = useState<StackOption>();
  const [tenant, setTenant] = useState('');
  const [mode, setMode] = useState('');
  const [provider, setProvider] = useState<'logto' | 'auth0'>('logto');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>();

  const previewKey =
    step === 3 && selected?.template && tenant
      ? `api/kubo/template?${new URLSearchParams({ template: selected.template, tenant, authProvider: provider, ...(mode ? { mode } : {}) }).toString()}`
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
            authProvider: provider,
            ...(mode ? { mode } : {}),
            ...(selected.exclude.length > 0 ? { exclude: selected.exclude } : {}),
          },
        })
        .json();
      navigate('/infrastructure');
    } catch (error: unknown) {
      setSubmitError(await readError(error));
    } finally {
      setSubmitting(false);
    }
  };

  const tenantValid = tenantPattern.test(tenant);
  const canContinue = step === 1 ? Boolean(selected?.available) : tenantValid;

  // Vertical stepper: each step has a title, a short description and an image.
  // Completed steps stay clickable so users can go back and change an answer.
  const steps = [
    {
      title: 'Choose a workspace',
      text: 'Pick a workspace type. Each type starts from an approved template.',
      image: welcomeImage,
    },
    {
      title: 'Set the tenant',
      text: 'Enter the tenant ID. Mode is optional.',
      image: organizationImage,
    },
    {
      title: 'Review and create',
      text: 'Check the rendered YAML before you create the workspace.',
      image: congratsImage,
    },
  ];

  const introduction = (
    <>
      <img className={styles.stepImage} src={steps[step - 1]?.image} alt="" />
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
                  setTenant(event.target.value.trim().toLowerCase());
                }}
              />
              {tenant && !tenantValid && (
                <span className={styles.error}>
                  Use lowercase letters, digits and hyphens. Start and end with a letter or digit.
                </span>
              )}
            </label>
            <div className={styles.field}>
              Identity provider
              <Select
                value={provider}
                options={[
                  { value: 'logto', title: 'Logto (recommended)' },
                  { value: 'auth0', title: 'Auth0' },
                ]}
                onChange={(value) => {
                  if (value) {
                    setProvider(value);
                  }
                }}
              />
            </div>
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
      <section className={styles.guide} aria-label="Before you start">
        <h2 className={styles.guideLabel}>Before you start</h2>
        <div className={styles.guideGrid}>
          <article className={styles.guideTile}>
            <img className={styles.guideIcon} src={robotTemplate} alt="" width={32} height={32} />
            <h3 className={styles.guideTitle}>Pick a template</h3>
            <p className={styles.guideText}>
              Foundation HA is the full platform. Start with Foundation for trials.
            </p>
          </article>
          <article className={styles.guideTile}>
            <img className={styles.guideIcon} src={robotCapacity} alt="" width={32} height={32} />
            <h3 className={styles.guideTitle}>Check capacity</h3>
            <p className={styles.guideText}>
              See free CPU and memory on each node before you create a workspace.
            </p>
            <Link className={styles.guideLink} to="/infrastructure/capacity">
              Open capacity map
            </Link>
          </article>
          <article className={styles.guideTile}>
            <img className={styles.guideIcon} src={robotReview} alt="" width={32} height={32} />
            <h3 className={styles.guideTitle}>Review the YAML</h3>
            <p className={styles.guideText}>
              Every workspace renders a manifest you can read before anything is applied.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}

export default KuboWizard;
/* eslint-enable consistent-default-export-name/default-export-match-filename, no-restricted-syntax, max-lines */
