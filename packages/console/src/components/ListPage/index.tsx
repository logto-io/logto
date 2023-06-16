import classNames from 'classnames';
import { type ReactNode } from 'react';
import { type FieldValues, type FieldPath } from 'react-hook-form';

import Plus from '@/assets/icons/plus.svg';
import { type Props as ButtonProps } from '@/components/Button';
import { type Props as CardTitleProps } from '@/components/CardTitle';
import PageMeta, { type Props as PageMetaProps } from '@/components/PageMeta';
import Table, { type Props as TableProps } from '@/components/Table';
import * as pageLayout from '@/scss/page-layout.module.scss';

import Button from '../Button';
import CardTitle from '../CardTitle';

type CreateButtonProps = {
  title: ButtonProps['title'];
  onClick: ButtonProps['onClick'];
};

type Props<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  title: CardTitleProps;
  pageMeta?: PageMetaProps;
  createButton?: CreateButtonProps;
  subHeader?: ReactNode;
  table: TableProps<TFieldValues, TName>;
  widgets: ReactNode;
  className?: string;
};

function ListPage<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
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
