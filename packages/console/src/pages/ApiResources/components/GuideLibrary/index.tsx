import { type Resource } from '@logto/schemas';
import classNames from 'classnames';
import { useCallback, useState } from 'react';

import EmptyDataPlaceholder from '@/components/EmptyDataPlaceholder';
import { type SelectedGuide } from '@/components/Guide/GuideCard';
import GuideCardGroup from '@/components/Guide/GuideCardGroup';
import { useApiGuideMetadata } from '@/components/Guide/hooks';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import useTenantPathname from '@/hooks/use-tenant-pathname';

import CreateForm from '../CreateForm';

import styles from './index.module.scss';

type Props = {
  readonly className?: string;
  readonly hasCardBorder?: boolean;
  readonly hasCardButton?: boolean;
};

function GuideLibrary({ className, hasCardBorder, hasCardButton }: Props) {
  const { navigate } = useTenantPathname();
  const [selectedGuide, setSelectedGuide] = useState<SelectedGuide>();
  const guides = useApiGuideMetadata();
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);

  const onClickGuide = useCallback((data: SelectedGuide) => {
    setShowCreateForm(true);
    setSelectedGuide(data);
  }, []);

  const onCloseCreateForm = useCallback(
    (newResource?: Resource) => {
      if (newResource && selectedGuide) {
        navigate(`/api-resources/${newResource.id}/guide/${selectedGuide.id}`, { replace: true });
        return;
      }
      setShowCreateForm(false);
      setSelectedGuide(undefined);
    },
    [navigate, selectedGuide]
  );

  return (
    <OverlayScrollbar className={classNames(styles.container, className)}>
      <div className={styles.wrapper}>
        <div className={styles.groups}>
          {guides.length > 0 ? (
            <GuideCardGroup
              className={styles.guideGroup}
              hasCardBorder={hasCardBorder}
              hasCardButton={hasCardButton}
              guides={guides}
              onClickGuide={onClickGuide}
            />
          ) : (
            <EmptyDataPlaceholder className={styles.emptyPlaceholder} size="large" />
          )}
        </div>
      </div>
      {selectedGuide?.target === 'API' && showCreateForm && (
        <CreateForm onClose={onCloseCreateForm} />
      )}
    </OverlayScrollbar>
  );
}

export default GuideLibrary;
