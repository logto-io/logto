import { ApplicationType, type Application, ReservedPlanId } from '@logto/schemas';
import { cond } from '@silverhand/essentials';
import classNames from 'classnames';
import { useCallback, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import SearchIcon from '@/assets/icons/search.svg';
import ApplicationCreation from '@/components/ApplicationCreation';
import EmptyDataPlaceholder from '@/components/EmptyDataPlaceholder';
import FeatureTag from '@/components/FeatureTag';
import { type SelectedGuide } from '@/components/Guide/GuideCard';
import GuideCardGroup from '@/components/Guide/GuideCardGroup';
import { useAppGuideMetadata } from '@/components/Guide/hooks';
import { isCloud } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { CheckboxGroup } from '@/ds-components/Checkbox';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import TextInput from '@/ds-components/TextInput';
import TextLink from '@/ds-components/TextLink';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import { allAppGuideCategories, type AppGuideCategory } from '@/types/applications';
import { thirdPartyAppCategory } from '@/types/applications';

import ProtectedAppCard from '../ProtectedAppCard';

import * as styles from './index.module.scss';

type Props = {
  readonly className?: string;
  readonly hasCardBorder?: boolean;
  readonly hasCardButton?: boolean;
};

function GuideLibrary({ className, hasCardBorder, hasCardButton }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { navigate } = useTenantPathname();
  const { pathname } = useLocation();
  const [keyword, setKeyword] = useState<string>('');
  const [filterCategories, setFilterCategories] = useState<AppGuideCategory[]>([]);
  const [selectedGuide, setSelectedGuide] = useState<SelectedGuide>();
  const { getFilteredAppGuideMetadata, getStructuredAppGuideMetadata } = useAppGuideMetadata();
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const isApplicationCreateModal = pathname.includes('/applications/create');
  const { currentPlan } = useContext(SubscriptionDataContext);

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

  const onClickGuide = useCallback((data: SelectedGuide) => {
    setShowCreateForm(true);
    setSelectedGuide(data);
  }, []);

  const onAppCreationCompleted = useCallback(
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
      <div className={classNames(styles.wrapper, isApplicationCreateModal && styles.hasFilters)}>
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
                        ...cond(
                          isCloud &&
                            category === 'ThirdParty' && {
                              tag: (
                                <FeatureTag
                                  isVisible={currentPlan.quota.thirdPartyApplicationsLimit === 0}
                                  plan={ReservedPlanId.Pro}
                                />
                              ),
                            }
                        ),
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
          {!keyword && (
            <>
              {isCloud &&
                (filterCategories.length === 0 ||
                  filterCategories.includes(ApplicationType.Protected)) && (
                  <ProtectedAppCard
                    isInAppCreationPage
                    hasCreateButton
                    hasBorder={hasCardBorder}
                    className={styles.protectedAppCard}
                  />
                )}
              {(filterCategories.length > 0 ? filterCategories : fullApplicationCategories).map(
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
            </>
          )}
          {!isApplicationCreateModal && (
            <TextLink className={styles.viewAll} to="/applications/create">
              {t('get_started.view_all')}
            </TextLink>
          )}
        </div>
      </div>
      {selectedGuide?.target !== 'API' && showCreateForm && (
        <ApplicationCreation
          defaultCreateType={selectedGuide?.target}
          defaultCreateFrameworkName={selectedGuide?.name}
          isDefaultCreateThirdParty={selectedGuide?.isThirdParty}
          onCompleted={onAppCreationCompleted}
        />
      )}
    </OverlayScrollbar>
  );
}

export default GuideLibrary;
