import classNames from 'classnames';
import { useCallback, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import SearchIcon from '@/assets/icons/search.svg?react';
import EmptyDataPlaceholder from '@/components/EmptyDataPlaceholder';
import { type SelectedGuide } from '@/components/Guide/GuideCard';
import GuideCardGroup from '@/components/Guide/GuideCardGroup';
import { useAppGuideMetadata } from '@/components/Guide/hooks';
import { isCloud } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { CheckboxGroup } from '@/ds-components/Checkbox';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import TextInput from '@/ds-components/TextInput';
import TextLink from '@/ds-components/TextLink';
import { allAppGuideCategories, type AppGuideCategory } from '@/types/applications';
import { thirdPartyAppCategory } from '@/types/applications';

import styles from './index.module.scss';

type Props = {
  readonly className?: string;
  readonly hasCardBorder?: boolean;
  readonly hasCardButton?: boolean;
  readonly onSelectGuide: (data?: SelectedGuide) => void;
};

function GuideLibrary({ className, hasCardBorder, hasCardButton, onSelectGuide }: Props) {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { pathname } = useLocation();
  const [keyword, setKeyword] = useState<string>('');
  const [filterCategories, setFilterCategories] = useState<AppGuideCategory[]>([]);
  const { getFilteredAppGuideMetadata, getStructuredAppGuideMetadata } = useAppGuideMetadata();
  const isApplicationCreateModal = pathname.includes('/applications/create');
  const {
    currentSubscriptionQuota,
    currentSubscription: { isEnterprisePlan },
  } = useContext(SubscriptionDataContext);

  const structuredMetadata = useMemo(
    () => getStructuredAppGuideMetadata({ categories: filterCategories }),
    [getStructuredAppGuideMetadata, filterCategories]
  );

  const filteredMetadata = useMemo(
    () => getFilteredAppGuideMetadata({ keyword, categories: filterCategories }),
    [getFilteredAppGuideMetadata, keyword, filterCategories]
  );

  // Only show third party app and machine to machine app in create modal. Hide them by default in the empty app guide page.
  const fullApplicationCategories = useMemo(() => {
    if (isApplicationCreateModal) {
      return allAppGuideCategories;
    }

    return allAppGuideCategories.filter(
      (category) => category !== thirdPartyAppCategory && category !== 'MachineToMachine'
    );
  }, [isApplicationCreateModal]);

  const onClickGuide = useCallback(
    (data: SelectedGuide) => {
      onSelectGuide(data);
    },
    [onSelectGuide]
  );

  return (
    <OverlayScrollbar className={classNames(styles.container, className)}>
      <div
        className={classNames(
          styles.wrapper,
          isApplicationCreateModal && styles.hasFilters,
          styles[i18n.dir()]
        )}
      >
        <div className={styles.groups}>
          {isApplicationCreateModal && (
            <div className={styles.filterAnchor}>
              <div className={styles.filters}>
                <label>{t('guide.filter.title')}</label>
                <TextInput
                  className={styles.searchInput}
                  icon={<SearchIcon />}
                  placeholder={t('guide.filter.placeholder')}
                  value={keyword}
                  onChange={(event) => {
                    setKeyword(event.currentTarget.value);
                  }}
                />
                <div className={styles.checkboxGroupContainer}>
                  <CheckboxGroup
                    className={styles.checkboxGroup}
                    options={allAppGuideCategories
                      .filter((category) => isCloud || category !== 'Protected')
                      .map((category) => ({
                        title: `guide.categories.${category}`,
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
              </div>
            </div>
          )}
          {keyword &&
            (filteredMetadata.length > 0 ? (
              <GuideCardGroup
                className={styles.guideGroup}
                hasCardBorder={hasCardBorder}
                hasCardButton={hasCardButton}
                guides={filteredMetadata}
                onClickGuide={onClickGuide}
              />
            ) : (
              <EmptyDataPlaceholder className={styles.emptyPlaceholder} size="large" />
            ))}
          {!keyword &&
            (filterCategories.length > 0 ? filterCategories : fullApplicationCategories).map(
              (category) =>
                structuredMetadata[category].length > 0 && (
                  <GuideCardGroup
                    key={category}
                    className={styles.guideGroup}
                    hasCardBorder={hasCardBorder}
                    hasCardButton={hasCardButton}
                    categoryName={t(`guide.categories.${category}`)}
                    guides={structuredMetadata[category]}
                    onClickGuide={onClickGuide}
                  />
                )
            )}
          {!isApplicationCreateModal && (
            <TextLink className={styles.viewAll} to="/applications/create">
              {t('get_started.view_all')}
            </TextLink>
          )}
        </div>
      </div>
    </OverlayScrollbar>
  );
}

export default GuideLibrary;
