export type Identifier =
  | AccountIdIdentifier
  | VerifiedEmailIdentifier
  | VerifiedPhoneIdentifier
  | SocialIdentifier;

export type AccountIdIdentifier = { key: 'accountId'; value: string };

export type VerifiedEmailIdentifier = { key: 'verifiedEmail'; value: string };

export type VerifiedPhoneIdentifier = { key: 'verifiedPhone'; value: string };

export type SocialIdentifier = { key: string; value: UseInfo };

type UseInfo = {
  email?: string | undefined;
  phone?: string | undefined;
  name?: string | undefined;
  avatar?: string | undefined;
  id: string;
};

export type IdentifierPayload = {
  identity: {
    type: 'username' | 'email' | 'phone' | 'connectorId';
    value: string;
  };
  verification:
    | {
        type: 'password' | 'passcode';
        value: string;
      }
    | { type: 'social'; value: unknown };
};
