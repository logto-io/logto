import { ReservedPlanId, type Application } from '@logto/schemas';
import classNames from 'classnames';
import { useCallback, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import SearchIcon from '@/assets/icons/search.svg';
import EmptyDataPlaceholder from '@/components/EmptyDataPlaceholder';
import FeatureTag from '@/components/FeatureTag';
import { type SelectedGuide } from '@/components/Guide/GuideCard';
import GuideCardGroup from '@/components/Guide/GuideCardGroup';
import { useAppGuideMetadata } from '@/components/Guide/hooks';
import { isCloud, isDevFeaturesEnabled } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { CheckboxGroup } from '@/ds-components/Checkbox';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import TextInput from '@/ds-components/TextInput';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import { allAppGuideCategories, type AppGuideCategory } from '@/types/applications';
import { thirdPartyAppCategory } from '@/types/applications';

import CreateForm from '../CreateForm';
import ProtectedAppCard from '../ProtectedAppCard';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  hasCardBorder?: boolean;
  hasCardButton?: boolean;
  hasFilters?: boolean;
};

function GuideLibrary({ className, hasCardBorder, hasCardButton, hasFilters }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.guide' });
  const { navigate } = useTenantPathname();
  const [keyword, setKeyword] = useState<string>('');
  const [filterCategories, setFilterCategories] = useState<AppGuideCategory[]>([]);
  const [selectedGuide, setSelectedGuide] = useState<SelectedGuide>();
  const { getFilteredAppGuideMetadata, getStructuredAppGuideMetadata } = useAppGuideMetadata();
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const { currentPlan } = useContext(SubscriptionDataContext);

  const structuredMetadata = useMemo(
    () => getStructuredAppGuideMetadata({ categories: filterCategories }),
    [getStructuredAppGuideMetadata, filterCategories]
  );

  const filteredMetadata = useMemo(
    () => getFilteredAppGuideMetadata({ keyword, categories: filterCategories }),
    [getFilteredAppGuideMetadata, keyword, filterCategories]
  );

  const onClickGuide = useCallback((data: SelectedGuide) => {
    setShowCreateForm(true);
    setSelectedGuide(data);
  }, []);

  const onCloseCreateForm = useCallback(
    (newApp?: Application) => {
      if (newApp && selectedGuide) {
        navigate(
          // Third party app directly goes to the app detail page
          selectedGuide.isThirdParty
            ? `/applications/${newApp.id}`
            : `/applications/${newApp.id}/guide/${selectedGuide.id}`,
          { replace: true }
        );
        return;
      }
      setShowCreateForm(false);
      setSelectedGuide(undefined);
    },
    [navigate, selectedGuide]
  );

  return (
    <OverlayScrollbar className={classNames(styles.container, className)}>
      <div className={classNames(styles.wrapper, hasFilters && styles.hasFilters)}>
        <div className={styles.groups}>
          {hasFilters && (
            <div className={styles.filterAnchor}>
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
                <div className={styles.checkboxGroupContainer}>
                  <CheckboxGroup
                    className={styles.checkboxGroup}
                    options={allAppGuideCategories
                      .filter(
                        (category) =>
                          category !== 'Protected' &&
                          (isDevFeaturesEnabled || category !== thirdPartyAppCategory)
                      )
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
                  {/* TODO: must be refactored since there's no way to see the tag's intention */}
                  {isCloud && (
                    <FeatureTag
                      isVisible={!currentPlan.quota.machineToMachineLimit}
                      for="upsell"
                      plan={ReservedPlanId.Pro}
                      className={styles.proTag}
                    />
                  )}
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
          {!keyword && (
            <>
              {isDevFeaturesEnabled && <ProtectedAppCard />}
              {(filterCategories.length > 0 ? filterCategories : allAppGuideCategories).map(
                (category) =>
                  structuredMetadata[category].length > 0 && (
                    <GuideCardGroup
                      key={category}
                      className={styles.guideGroup}
                      hasCardBorder={hasCardBorder}
                      hasCardButton={hasCardButton}
                      categoryName={t(`categories.${category}`)}
                      guides={structuredMetadata[category]}
                      onClickGuide={onClickGuide}
                    />
                  )
              )}
            </>
          )}
        </div>
      </div>
      {selectedGuide?.target !== 'API' && showCreateForm && (
        <CreateForm
          defaultCreateType={selectedGuide?.target}
          defaultCreateFrameworkName={selectedGuide?.name}
          isDefaultCreateThirdParty={selectedGuide?.isThirdParty}
          onClose={onCloseCreateForm}
        />
      )}
    </OverlayScrollbar>
  );
}

export default GuideLibrary;
