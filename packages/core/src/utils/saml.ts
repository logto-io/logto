import { generateStandardId } from '@logto/shared';
import forge from 'node-forge';

export const generateSamlKeyPair = () => {
  const { pki } = forge;
  const { privateKey, publicKey } = pki.rsa.generateKeyPair(2048);
  const cert = pki.createCertificate();

  /* eslint-disable @silverhand/fp/no-mutation */
  cert.publicKey = publicKey;
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 10);
  cert.serialNumber = generateStandardId();
  /* eslint-enable @silverhand/fp/no-mutation */

  // Certificate attributes
  const subject = [
    {
      name: 'commonName',
      value: 'logto.io',
    },
    {
      name: 'organizationName',
      value: 'Silverhand',
    },
    {
      name: 'emailAddress',
      value: 'contact@silverhand.io',
    },
  ];

  cert.setSubject(subject);
  cert.setIssuer(subject);

  cert.sign(privateKey);

  return {
    privateKey: pki.privateKeyToPem(privateKey),
    publicCert: pki.certificateToPem(cert),
  };
};
