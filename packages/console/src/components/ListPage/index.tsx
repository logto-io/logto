import classNames from 'classnames';
import { type ReactNode } from 'react';
import { type FieldValues, type FieldPath } from 'react-hook-form';

import Plus from '@/assets/icons/plus.svg';
import PageMeta, { type Props as PageMetaProps } from '@/components/PageMeta';
import { type Props as ButtonProps } from '@/ds-components/Button';
import Button from '@/ds-components/Button';
import { type Props as CardTitleProps } from '@/ds-components/CardTitle';
import CardTitle from '@/ds-components/CardTitle';
import Table, { type Props as TableProps } from '@/ds-components/Table';
import * as pageLayout from '@/scss/page-layout.module.scss';

type CreateButtonProps = {
  title: ButtonProps['title'];
  onClick: ButtonProps['onClick'];
};

type Props<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  readonly title: CardTitleProps;
  readonly pageMeta?: PageMetaProps;
  readonly createButton?: CreateButtonProps;
  readonly subHeader?: ReactNode;
  readonly table: TableProps<TFieldValues, TName>;
  /** @deprecated Need refactor. */
  readonly widgets?: ReactNode;
  readonly className?: string;
};

function ListPage<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  title,
  pageMeta,
  createButton,
  subHeader,
  table,
  widgets,
  className,
}: Props<TFieldValues, TName>) {
  return (
    <div className={classNames(pageLayout.container, className)}>
      {pageMeta && <PageMeta {...pageMeta} />}
      <div className={pageLayout.headline}>
        <CardTitle {...title} />
        {createButton && <Button icon={<Plus />} type="primary" size="large" {...createButton} />}
      </div>
      {subHeader}
      <Table className={pageLayout.table} {...table} />
      {widgets}
    </div>
  );
}

export default ListPage;
