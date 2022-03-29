import { FieldValues, Primitive } from 'react-hook-form';
import { IsTuple, TupleKeys, ArrayKey } from 'react-hook-form/dist/types/path/common';

type StringArrayPathImpl<K extends string | number, V> = V extends Primitive
  ? never
  : V extends ReadonlyArray<infer U>
  ? U extends string
    ? `${K}`
    : never
  : `${K}.${StringArrayPath<V>}`;

type StringArrayPath<T> = T extends ReadonlyArray<infer V>
  ? IsTuple<T> extends true
    ? {
        [K in TupleKeys<T>]-?: StringArrayPathImpl<K & string, T[K]>;
      }[TupleKeys<T>]
    : StringArrayPathImpl<ArrayKey, V>
  : {
      [K in keyof T]-?: StringArrayPathImpl<K & string, T[K]>;
    }[keyof T];

export type StringFiledArrayPath<TFieldValues extends FieldValues> = StringArrayPath<TFieldValues>;

export type MutiTextInputErrors = Record<`${number}`, string | undefined>;
