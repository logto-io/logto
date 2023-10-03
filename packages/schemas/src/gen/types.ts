export type Field = {
  name: string;
  /** The JSDoc comment for the field. */
  comments?: string;
  type?: string;
  customType?: string;
  tsType?: string;
  isString: boolean;
  maxLength?: number;
  hasDefaultValue: boolean;
  nullable: boolean;
  isArray: boolean;
};

export type FieldWithType = Omit<Field, 'type' | 'customType'> & { type: string; isEnum: boolean };

export type Type = {
  name: string;
  type: 'enum';
  values: string[];
};

export type GeneratedType = Type & {
  tsName: string;
};

export type Table = {
  name: string;
  /** The JSDoc comment for the table. */
  comments?: string;
  fields: Field[];
};

export type TableWithType = Omit<Table, 'fields'> & {
  fields: FieldWithType[];
};

export type FileData = {
  types: Type[];
  tables: Table[];
};
