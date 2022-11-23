export type Identifier =
  | AccountIdIdentifier
  | VerifiedEmailIdentifier
  | VerifiedPhoneIdentifier
  | SocialIdentifier;

export type AccountIdIdentifier = { key: 'accountId'; value: string };

export type VerifiedEmailIdentifier = { key: 'verifiedEmail'; value: string };

export type VerifiedPhoneIdentifier = { key: 'verifiedPhone'; value: string };

export type SocialIdentifier = { key: 'social'; connectorId: string; value: UseInfo };

type UseInfo = {
  email?: string;
  phone?: string;
  name?: string;
  avatar?: string;
  id: string;
};
