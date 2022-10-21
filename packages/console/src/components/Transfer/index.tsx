import classNames from 'classnames';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import CircleMinus from '@/assets/images/circle-minus.svg';
import CirclePlus from '@/assets/images/circle-plus.svg';
import Draggable from '@/assets/images/draggable.svg';

import IconButton from '../IconButton';
import DragDropProvider from './DragDropProvider';
import DraggableItem from './DraggableItem';
import * as styles from './index.module.scss';

type TransferItem = {
  title: ReactNode;
  value: string;
};

type Props = {
  title: string;
  datasource: TransferItem[];
  value?: string[];
  footer?: ReactNode;
  onChange?: (value: string[]) => void;
};

const Transfer = ({ title, datasource, value = [], footer, onChange }: Props) => {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console',
  });

  const selectedItems = useMemo(() => {
    return (
      value
        .map((target) => datasource.find((item) => item.value === target))
        // eslint-disable-next-line unicorn/prefer-native-coercion-functions
        .filter((item): item is TransferItem => Boolean(item))
    );
  }, [datasource, value]);

  const unselectedItems = useMemo(() => {
    return datasource.filter((item) => !value.includes(item.value));
  }, [datasource, value]);

  const onAddItem = (key: string) => {
    onChange?.([...value, key]);
  };

  const onRemoveItem = (key: string) => {
    onChange?.(value.filter((value_) => value_ !== key));
  };

  const onMoveItem = (dragIndex: number, hoverIndex: number) => {
    const dragItem = value[dragIndex];
    const hoverItem = value[hoverIndex];

    if (!dragItem || !hoverItem) {
      return;
    }

    onChange?.(
      value.map((value_, index) => {
        if (index === dragIndex) {
          return hoverItem;
        }

        if (index === hoverIndex) {
          return dragItem;
        }

        return value_;
      })
    );
  };

  return (
    <div className={styles.transfer}>
      <div className={styles.main}>
        <div className={styles.box}>
          <div className={styles.title}>{title}</div>
          <div className={styles.items}>
            {unselectedItems.map(({ value, title }) => (
              <div key={value} className={styles.item}>
                <div className={styles.itemTitle}>{title}</div>
                <IconButton
                  size="small"
                  onClick={() => {
                    onAddItem(value);
                  }}
                >
                  <CirclePlus />
                </IconButton>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.box}>
          <div className={styles.title}>
            {selectedItems.length} {t('general.added')}
          </div>
          <div className={styles.items}>
            <DragDropProvider>
              {selectedItems.map(({ value, title }, index) => (
                <DraggableItem key={value} sortIndex={index} id={value} moveItem={onMoveItem}>
                  <div className={classNames(styles.item, styles.draggable)}>
                    <Draggable className={styles.draggableIcon} />
                    <div className={styles.itemTitle}>{title}</div>
                    <IconButton
                      size="small"
                      onClick={() => {
                        onRemoveItem(value);
                      }}
                    >
                      <CircleMinus />
                    </IconButton>
                  </div>
                </DraggableItem>
              ))}
            </DragDropProvider>
          </div>
        </div>
      </div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
};

export default Transfer;
