import classNames from 'classnames';
import i18next from 'i18next';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
// eslint-disable-next-line node/file-extension-in-import
import useSWRImmutable from 'swr/immutable';

import highFive from '@/assets/images/high-five.svg';
import tada from '@/assets/images/tada.svg';
import Button from '@/components/Button';
import Card from '@/components/Card';
import CardTitle from '@/components/CardTitle';
import DangerousRaw from '@/components/DangerousRaw';
import IconButton from '@/components/IconButton';
import RadioGroup, { Radio } from '@/components/RadioGroup';
import Spacer from '@/components/Spacer';
import { ArrowDown, ArrowUp } from '@/icons/Arrow';
import Close from '@/icons/Close';
import Tick from '@/icons/Tick';
import { SupportedJavascriptLibraries } from '@/types/applications';
import { parseMarkdownWithYamlFrontmatter } from '@/utilities/markdown';

import * as styles from './index.module.scss';

type Props = {
  appName: string;
  onClose: () => void;
};

type DocumentFileNames = {
  files: string[];
};

type Step = {
  title?: string;
  subtitle?: string;
  metadata: string;
};

const GetStarted = ({ appName, onClose }: Props) => {
  const [isLibrarySelectorFolded, setIsLibrarySelectorFolded] = useState(false);
  const [libraryName, setLibraryName] = useState<string>(SupportedJavascriptLibraries.React);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const publicPath = useMemo(
    () => `/console/get-started/${libraryName}/${i18next.language}`,
    [libraryName]
  );

  const { data: jsonData } = useSWRImmutable<DocumentFileNames>(`${publicPath}/index.json`);
  const { data: steps } = useSWRImmutable<Step[]>(jsonData, async ({ files }: DocumentFileNames) =>
    Promise.all(
      files.map(async (fileName) => {
        const response = await fetch(`${publicPath}/${fileName}`);
        const markdownFile = await response.text();

        return parseMarkdownWithYamlFrontmatter<Step>(markdownFile);
      })
    )
  );

  const stepReferences = useMemo(
    () => Array.from({ length: steps?.length ?? 0 }).map(() => React.createRef<HTMLDivElement>()),
    [steps?.length]
  );

  useEffect(() => {
    if (activeStepIndex > -1) {
      const activeStepReference = stepReferences[activeStepIndex];
      activeStepReference?.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  }, [activeStepIndex, stepReferences]);

  const onClickFetchSampleProject = () => {
    window.open(
      `https://github.com/logto-io/js/tree/master/packages/${libraryName.toLowerCase()}-sample`,
      '_blank'
    );
  };

  const librarySelector = useMemo(
    () => (
      <Card className={classNames(styles.card, styles.selector)}>
        <img src={highFive} alt="success" />
        <div>
          <div className={styles.title}>{t('applications.get_started.title')}</div>
          <div className={styles.subtitle}>{t('applications.get_started.subtitle')}</div>
        </div>
        <RadioGroup
          className={styles.radioGroup}
          name="libraryName"
          value={libraryName}
          onChange={setLibraryName}
        >
          {Object.values(SupportedJavascriptLibraries).map((library) => (
            <Radio key={library} className={styles.radio} title={library} value={library} />
          ))}
        </RadioGroup>
        <div className={styles.buttonWrapper}>
          <Button
            type="primary"
            title="general.next"
            onClick={() => {
              setIsLibrarySelectorFolded(true);
              setActiveStepIndex(0);
            }}
          />
        </div>
      </Card>
    ),
    [libraryName, t]
  );

  const librarySelectorFolded = useMemo(
    () => (
      <div className={classNames(styles.card, styles.selector, styles.folded)}>
        <img src={tada} alt="Tada!" />
        <span>
          {t('applications.get_started.description_by_library', { library: libraryName })}
        </span>
      </div>
    ),
    [libraryName, t]
  );

  return (
    <div className={styles.quickStartGuide}>
      <div className={styles.header}>
        <IconButton size="large" onClick={onClose}>
          <Close />
        </IconButton>
        <div className={styles.separator} />
        <CardTitle
          size="small"
          title={<DangerousRaw>{appName}</DangerousRaw>}
          subtitle="applications.get_started.header_description"
        />
        <Spacer />
        <Button type="plain" size="small" title="general.skip" onClick={onClose} />
        <Button
          type="outline"
          title="admin_console.applications.get_started.get_sample_file"
          onClick={onClickFetchSampleProject}
        />
      </div>
      <div className={styles.content}>
        {isLibrarySelectorFolded ? librarySelectorFolded : librarySelector}
        {steps?.map((step, index) => {
          const { title, subtitle, metadata } = step;
          const isExpanded = activeStepIndex === index;
          const isCompleted = activeStepIndex > index;
          const isLastStep = index === steps.length - 1;

          // Steps in get-started must have "title" declared in the Yaml header of the markdown source file
          if (!title) {
            return null;
          }

          // TODO: add more styles to markdown renderer
          // TODO: render form and input fields in steps
          return (
            <Card key={title} ref={stepReferences[index]} className={styles.card}>
              <div
                className={styles.cardHeader}
                onClick={() => {
                  setIsLibrarySelectorFolded(true);
                  setActiveStepIndex(index);
                }}
              >
                <div
                  className={classNames(
                    styles.index,
                    isExpanded && styles.active,
                    isCompleted && styles.completed
                  )}
                >
                  {isCompleted ? <Tick /> : index + 1}
                </div>
                <CardTitle
                  size="medium"
                  title={<DangerousRaw>{title}</DangerousRaw>}
                  subtitle={<DangerousRaw>{subtitle}</DangerousRaw>}
                />
                <Spacer />
                <IconButton>{isExpanded ? <ArrowUp /> : <ArrowDown />}</IconButton>
              </div>
              {isExpanded && (
                <>
                  <ReactMarkdown className={styles.markdownContent}>{metadata}</ReactMarkdown>
                  <div className={styles.buttonWrapper}>
                    <Button
                      type="primary"
                      title={`general.${isLastStep ? 'done' : 'next'}`}
                      onClick={() => {
                        if (isLastStep) {
                          // TO-DO: submit form
                          onClose();
                        } else {
                          setActiveStepIndex(index + 1);
                        }
                      }}
                    />
                  </div>
                </>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default GetStarted;
