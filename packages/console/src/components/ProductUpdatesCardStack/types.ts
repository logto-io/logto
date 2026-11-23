export type ProductUpdateItem = {
  id: string;
  title: string;
  summary: string;
  publishedDate: string;
  url: string;
};

export type ProductUpdatesCardStackProps = {
  readonly items: readonly ProductUpdateItem[];
  readonly onOpen: (item: ProductUpdateItem) => void;
  readonly onDismiss: (item: ProductUpdateItem) => void;
  readonly onDismissAll: () => void;
  readonly onActiveItemChange?: (item: ProductUpdateItem) => void;
};
