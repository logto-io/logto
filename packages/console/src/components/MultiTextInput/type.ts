import { Control, FieldValues, Primitive } from 'react-hook-form';
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

export type MutiTextInputRule = {
  required?: {
    isRequred: boolean;
    message: string;
  };
  inputs?: {
    pattern: RegExp;
    message: string;
  };
};

export type UseMultiTextInputRhfProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends StringFiledArrayPath<TFieldValues> = StringFiledArrayPath<TFieldValues>
> = {
  control: Control<TFieldValues>;
  name: TName;
  rule: MutiTextInputRule;
};

export type MutiTextInputErrors = {
  inputs: Record<number, string | undefined>;
  required: string | undefined;
};

export type UseMultiTextInputRhfReturn = {
  fields: string[];
  errors: MutiTextInputErrors;
  validate: () => boolean;
  handleAdd: () => void;
  handleRemove: (index: number) => void;
  handleInputChange: (event: React.FormEvent<HTMLInputElement>, index: number) => void;
};
