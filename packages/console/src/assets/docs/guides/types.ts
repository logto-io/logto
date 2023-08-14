import { type ApplicationType } from '@logto/schemas';
import { type MDXProps } from 'mdx/types';
import { type LazyExoticComponent, type FunctionComponent } from 'react';

type ProgrammingLanguage =
  | 'javascript'
  | 'typescript'
  | 'go'
  | 'java'
  | 'swift'
  | 'kotlin'
  | 'php'
  | 'python'
  | 'agnostic';

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
  /** The programming language of the guide. If it doesn't apply, set it to `agnostic`. */
  language: ProgrammingLanguage;
};

/** The guide instance to build in the console. */
export type Guide = {
  id: string;
  logo?: LazyExoticComponent<FunctionComponent>;
  Component: LazyExoticComponent<FunctionComponent<MDXProps>>;
  metadata: Readonly<GuideMetadata>;
};
