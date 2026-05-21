declare module 'html-to-text' {
  export type Selector = {
    selector: string;
    format?: string;
    options?: Record<string, unknown>;
  };

  export type HtmlToTextOptions = {
    wordwrap?: boolean | number;
    selectors?: Selector[];
  };

  export function convert(html: string, options?: HtmlToTextOptions): string;
  export function htmlToText(html: string, options?: HtmlToTextOptions): string;
}
