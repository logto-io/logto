import { ArbitraryObject } from '@logto/schemas';

import { findConnectorById, updateConnector } from '@/queries/connector';

export const getConnectorConfig = async <T extends ArbitraryObject>(id: string): Promise<T> => {
  const connector = await findConnectorById(id);

  return connector.config as T;
};

export const updateConnectorConfig = async <T extends ArbitraryObject>(
  id: string,
  config: T
): Promise<void> => {
  await updateConnector({
    where: { id },
    set: { config },
  });
};

const connectorRequestTimeout = 5000;

export const getConnectorRequestTimeout = async (): Promise<number> => connectorRequestTimeout;

export const getFormattedDate = () => {
  const date = new Date();

  const yearString = date.getFullYear().toString();
  const month = date.getMonth() + 1;
  const monthString = month < 10 ? `0${month}` : `${month}`;
  const day = date.getDate();
  const dayString = day < 10 ? `0${day}` : `${day}`;
  const hours = date.getHours();
  const hoursString = hours < 10 ? `0${hours}` : `${hours}`;
  const minutes = date.getMinutes();
  const minutesString = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const seconds = date.getSeconds();
  const secondsString = seconds < 10 ? `0${seconds}` : `${seconds}`;
  const formattedDateString =
    yearString +
    '-' +
    monthString +
    '-' +
    dayString +
    ' ' +
    hoursString +
    ':' +
    minutesString +
    ':' +
    secondsString; // "yyyy-MM-dd HH:mm:ss" 2014-07-24 03:07:50

  return formattedDateString;
};
