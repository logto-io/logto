import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import path from 'path';

import type {
  AllConnector,
  BaseConnector,
  ConnectorConfigFormItem,
  GetConnectorConfig,
} from '@logto/connector-kit';
import {
  ConnectorError,
  ConnectorErrorCodes,
  ConnectorType,
  ConnectorConfigFormItemType,
} from '@logto/connector-kit';
import { assert } from '@silverhand/essentials';
import type { Optional } from '@silverhand/essentials';
import equal from 'fast-deep-equal';
import type { ZodType } from 'zod';
import {
  ZodLiteral,
  ZodRecord,
  ZodBoolean,
  ZodEnum,
  ZodNativeEnum,
  ZodNumber,
  ZodObject,
  ZodString,
  ZodArray,
  ZodEffects,
  ZodUnion,
  ZodDiscriminatedUnion,
  ZodDefault,
  ZodOptional,
  ZodNullable,
} from 'zod';

import { notImplemented } from './consts.js';
import type { ConnectorFactory } from './types.js';

export function validateConnectorModule(
  connector: Partial<BaseConnector<ConnectorType>>
): asserts connector is BaseConnector<ConnectorType> {
  if (!connector.metadata) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidMetadata);
  }

  if (!connector.configGuard) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidConfigGuard);
  }

  if (!connector.type || !Object.values(ConnectorType).includes(connector.type)) {
    throw new ConnectorError(ConnectorErrorCodes.UnexpectedType);
  }
}

// Need to specify the check on different `formItem` types
// eslint-disable-next-line complexity
const validateFormItemAndConfigGuardConsistency = (
  configGuard: ZodType,
  formItem: ConnectorConfigFormItem
): void => {
  if (configGuard instanceof ZodString) {
    assert(
      formItem.type === ConnectorConfigFormItemType.Text ||
        formItem.type === ConnectorConfigFormItemType.MultilineText,
      new ConnectorError(ConnectorErrorCodes.FormItemAndConfigGuardInconsistent, {
        configGuard,
        formItem,
      })
    );
  }

  if (configGuard instanceof ZodNumber) {
    assert(
      formItem.type === ConnectorConfigFormItemType.Number,
      new ConnectorError(ConnectorErrorCodes.FormItemAndConfigGuardInconsistent, {
        configGuard,
        formItem,
      })
    );
  }

  if (configGuard instanceof ZodBoolean) {
    assert(
      formItem.type === ConnectorConfigFormItemType.Switch,
      new ConnectorError(ConnectorErrorCodes.FormItemAndConfigGuardInconsistent, {
        configGuard,
        formItem,
      })
    );
  }

  if (configGuard instanceof ZodEnum || configGuard instanceof ZodNativeEnum) {
    assert(
      formItem.type === ConnectorConfigFormItemType.Select &&
        equal(
          Object.values(configGuard.enum),
          formItem.selectItems.map((item) => item.value)
        ),
      new ConnectorError(ConnectorErrorCodes.FormItemAndConfigGuardInconsistent, {
        configGuard,
        formItem,
      })
    );
  }

  if (
    configGuard instanceof ZodObject ||
    configGuard instanceof ZodRecord ||
    configGuard instanceof ZodArray
  ) {
    assert(
      formItem.type === ConnectorConfigFormItemType.Json,
      new ConnectorError(ConnectorErrorCodes.FormItemAndConfigGuardInconsistent, {
        configGuard,
        formItem,
      })
    );
  }

  if (configGuard instanceof ZodLiteral) {
    assert(
      formItem.type === ConnectorConfigFormItemType.Text ||
        formItem.type === ConnectorConfigFormItemType.MultilineText ||
        formItem.type === ConnectorConfigFormItemType.Select,
      new ConnectorError(ConnectorErrorCodes.FormItemAndConfigGuardInconsistent, {
        configGuard,
        formItem,
      })
    );
  }

  if (configGuard instanceof ZodEffects) {
    switch (configGuard._def.effect.type) {
      case 'preprocess':
      case 'refinement': {
        validateFormItemAndConfigGuardConsistency(configGuard.innerType(), formItem);
        break;
      }
      case 'transform': {
        validateFormItemAndConfigGuardConsistency(configGuard.sourceType(), formItem);
        break;
      }
      default: {
        throw new ConnectorError(ConnectorErrorCodes.FormItemAndConfigGuardInconsistent, {
          message: 'Wrong effect type of ZodEffects.',
        });
      }
    }
  }

  if (configGuard instanceof ZodUnion || configGuard instanceof ZodDiscriminatedUnion) {
    try {
      for (const configGuardElement of configGuard.options) {
        validateFormItemAndConfigGuardConsistency(configGuardElement, formItem);
      }
    } catch {
      throw new ConnectorError(ConnectorErrorCodes.FormItemAndConfigGuardInconsistent, {
        configGuard,
        formItem,
      });
    }
  }

  if (configGuard instanceof ZodDefault) {
    assert(
      formItem.defaultValue !== undefined,
      new ConnectorError(ConnectorErrorCodes.FormItemAndConfigGuardInconsistent, {
        configGuard,
        formItem,
      })
    );

    /**
     * `xxx.optional().default()` will always make the key with non-null value, no need to check
     * `defaultValue` and `required`.
     */
    validateFormItemAndConfigGuardConsistency(
      configGuard._def.innerType instanceof ZodOptional
        ? configGuard._def.innerType.unwrap()
        : configGuard._def.innerType,
      formItem
    );
  }

  if (configGuard instanceof ZodOptional || configGuard instanceof ZodNullable) {
    assert(
      /**
       * Optional keys should have falsy `required` in most cases; but if it's not, it should
       * have `showConditions` and non-null `showConditions` might be validated with outer layer `.refine()`.
       */
      configGuard instanceof ZodOptional &&
        (!formItem.required || (formItem.showConditions && formItem.showConditions.length > 0)),
      new ConnectorError(ConnectorErrorCodes.FormItemAndConfigGuardInconsistent, {
        configGuard,
        formItem,
      })
    );

    validateFormItemAndConfigGuardConsistency(configGuard.unwrap(), formItem);
  }
};

export const validateFormItemsAndConfigGuardConsistency = (
  configGuard: ZodType,
  formItems: Optional<ConnectorConfigFormItem[]>
): void => {
  if (!formItems) {
    return;
  }

  // Could have `.refine(callbackFunc)` validator to enforce advanced config check.
  while (configGuard instanceof ZodEffects && configGuard._def.effect.type === 'refinement') {
    // eslint-disable-next-line @silverhand/fp/no-mutation, @typescript-eslint/no-unsafe-assignment
    configGuard = configGuard.sourceType();
  }

  if (!(configGuard instanceof ZodObject)) {
    throw new ConnectorError(ConnectorErrorCodes.FormItemAndConfigGuardInconsistent, {
      message: 'Connectors config guard should always be an ZodObject.',
    });
  }

  for (const formItem of formItems) {
    validateFormItemAndConfigGuardConsistency(configGuard.shape[formItem.key], formItem);
  }
};

export const readUrl = async (
  url: string,
  baseUrl: string,
  type: 'text' | 'svg'
): Promise<string> => {
  if (!url) {
    return url;
  }

  if (type !== 'text' && url.startsWith('http')) {
    return url;
  }

  if (!existsSync(path.join(baseUrl, url))) {
    return url;
  }

  if (type === 'svg') {
    const data = await readFile(path.join(baseUrl, url));

    return `data:image/svg+xml;base64,${data.toString('base64')}`;
  }

  return readFile(path.join(baseUrl, url), 'utf8');
};

export const parseMetadata = async (
  metadata: AllConnector['metadata'],
  packagePath: string
): Promise<AllConnector['metadata']> => {
  return {
    ...metadata,
    logo: await readUrl(metadata.logo, packagePath, 'svg'),
    logoDark: metadata.logoDark && (await readUrl(metadata.logoDark, packagePath, 'svg')),
    readme: await readUrl(metadata.readme, packagePath, 'text'),
    configTemplate:
      metadata.configTemplate && (await readUrl(metadata.configTemplate, packagePath, 'text')),
  };
};

export const buildRawConnector = async (
  connectorFactory: ConnectorFactory,
  getConnectorConfig?: GetConnectorConfig
) => {
  const { createConnector, path: packagePath } = connectorFactory;
  const rawConnector = await createConnector({
    getConfig: getConnectorConfig ?? notImplemented,
  });
  validateConnectorModule(rawConnector);
  const rawMetadata = await parseMetadata(rawConnector.metadata, packagePath);

  return { rawConnector, rawMetadata };
};
