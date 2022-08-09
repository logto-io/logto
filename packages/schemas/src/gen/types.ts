export type Field = {
  name: string;
  type?: string;
  customType?: string;
  tsType?: string;
  isString: boolean;
  stringMaxLength?: number;
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
  fields: Field[];
};

export type TableWithType = {
  name: string;
  fields: FieldWithType[];
};

export type FileData = {
  types: Type[];
  tables: Table[];
};
