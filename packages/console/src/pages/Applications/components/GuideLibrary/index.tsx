import { type Application } from '@logto/schemas';
import classNames from 'classnames';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { type Guide } from '@/assets/docs/guides/types';
import SearchIcon from '@/assets/icons/search.svg';
import { CheckboxGroup } from '@/ds-components/Checkbox';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import TextInput from '@/ds-components/TextInput';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import { allAppGuideCategories, type AppGuideCategory } from '@/types/applications';

import CreateForm from '../CreateForm';
import GuideCard, { type SelectedGuide } from '../GuideCard';

import useAppGuideMetadata from './hook';
import * as styles from './index.module.scss';

type Props = {
  className?: string;
  hasFilter?: boolean;
  hasCardBorder?: boolean;
};

type GuideGroupProps = {
  categoryName?: string;
  guides?: readonly Guide[];
  hasCardBorder?: boolean;
  onClickGuide: (data: SelectedGuide) => void;
};

function GuideGroup({ categoryName, guides, hasCardBorder, onClickGuide }: GuideGroupProps) {
  if (!guides?.length) {
    return null;
  }

  return (
    <div className={styles.guideGroup}>
      {categoryName && <label>{categoryName}</label>}
      <div className={styles.grid}>
        {guides.map((guide) => (
          <GuideCard key={guide.id} hasBorder={hasCardBorder} data={guide} onClick={onClickGuide} />
        ))}
      </div>
    </div>
  );
}

function GuideLibrary({ className, hasFilter, hasCardBorder }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.applications.guide' });
  const { navigate } = useTenantPathname();
  const [keyword, setKeyword] = useState<string>('');
  const [filterCategories, setFilterCategories] = useState<AppGuideCategory[]>([]);
  const [selectedGuide, setSelectedGuide] = useState<SelectedGuide>();
  const [getFilteredMetadata, getStructuredMetadata] = useAppGuideMetadata();
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);

  const structuredMetadata = useMemo(
    () => getStructuredMetadata({ categories: filterCategories }),
    [getStructuredMetadata, filterCategories]
  );

  const filteredMetadata = useMemo(
    () => getFilteredMetadata({ keyword, categories: filterCategories }),
    [getFilteredMetadata, keyword, filterCategories]
  );

  const onClickGuide = useCallback((data: SelectedGuide) => {
    setShowCreateForm(true);
    setSelectedGuide(data);
  }, []);

  const onCloseCreateForm = useCallback(
    (newApp?: Application) => {
      if (newApp && selectedGuide) {
        navigate(`/applications/${newApp.id}/guide/${selectedGuide.id}`, { replace: true });
        return;
      }
      setShowCreateForm(false);
      setSelectedGuide(undefined);
    },
    [navigate, selectedGuide]
  );

  return (
    <div className={classNames(styles.container, className)}>
      {hasFilter && (
        <div className={styles.filters}>
          <label>{t('filter.title')}</label>
          <TextInput
            className={styles.searchInput}
            icon={<SearchIcon />}
            placeholder={t('filter.placeholder')}
            value={keyword}
            onChange={(event) => {
              setKeyword(event.currentTarget.value);
            }}
          />
          <CheckboxGroup
            className={styles.checkboxGroup}
            options={allAppGuideCategories.map((category) => ({
              title: `applications.guide.categories.${category}`,
              value: category,
            }))}
            value={filterCategories}
            onChange={(value) => {
              const sortedValue = allAppGuideCategories.filter((category) =>
                value.includes(category)
              );
              setFilterCategories(sortedValue);
            }}
          />
        </div>
      )}
      {keyword && (
        <GuideGroup
          hasCardBorder={hasCardBorder}
          guides={filteredMetadata}
          onClickGuide={onClickGuide}
        />
      )}
      {!keyword && (
        <OverlayScrollbar className={styles.groups}>
          {(filterCategories.length > 0 ? filterCategories : allAppGuideCategories).map(
            (category) =>
              structuredMetadata[category].length > 0 && (
                <GuideGroup
                  key={category}
                  hasCardBorder={hasCardBorder}
                  categoryName={t(`categories.${category}`)}
                  guides={structuredMetadata[category]}
                  onClickGuide={onClickGuide}
                />
              )
          )}
        </OverlayScrollbar>
      )}
      {selectedGuide?.target !== 'API' && showCreateForm && (
        <CreateForm defaultCreateType={selectedGuide?.target} onClose={onCloseCreateForm} />
      )}
    </div>
  );
}

export default GuideLibrary;
