import { type ApplicationType } from '@logto/schemas';
import { type MDXProps } from 'mdx/types';
import { type LazyExoticComponent, type FunctionComponent } from 'react';

/**
 * The guide metadata type. The directory name that the metadata is in will be the
 * unique identifier of the guide.
 */
export type GuideMetadata = {
  /** The name of the target (framework, language, or platform) that the guide is for. */
  name: string;
  /** The short description of the guide, should be less than 100 characters. */
  description?: string;
  /**
   * The target resource of the guide.
   *
   * For example, if the guide is for application creation, the target should be `ApplicationType`,
   * and an application of the target type should be created.
   */
  target: ApplicationType | 'API';
  /** The related sample information of the guide. */
  sample?: {
    /** The GitHub repository of the `logto-io` organization that the sample is in. */
    repo: string;
    /** The path to the sample directory in the repository. */
    path: string;
  };
  /** Whether the guide is displayed in featured group. */
  isFeatured?: boolean;

  /** Indicate whether the application is for third-party use */
  isThirdParty?: boolean;

  /** The related complete guide url relative to the quick starts page (https://docs.logto.io/quick-starts). */
  fullGuide?: string;

  /** The related URLs to add to the further readings section. */
  furtherReadings?: Array<{
    title: string;
    url: URL;
  }>;
};

/** The guide instance to build in the console. */
export type Guide = {
  order: number;
  /** The unique identifier of the guide. */
  id: string;
  Logo:
    | LazyExoticComponent<SvgComponent>
    | ((props: { readonly className?: string }) => JSX.Element);
  Component: LazyExoticComponent<FunctionComponent<MDXProps>>;
  metadata: Readonly<GuideMetadata>;
};
