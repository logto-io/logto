import crypto from 'node:crypto';

import { addDays } from 'date-fns';
import forge from 'node-forge';

export const generateKeyPairAndCertificate = async (lifeSpanInDays = 365) => {
  const keypair = forge.pki.rsa.generateKeyPair({ bits: 4096 });
  return createCertificate(keypair, lifeSpanInDays);
};

const createCertificate = (keypair: forge.pki.KeyPair, lifeSpanInDays: number) => {
  const cert = forge.pki.createCertificate();
  const notBefore = new Date();
  const notAfter = addDays(notBefore, lifeSpanInDays);

  // Can not initialize the certificate with the keypair directly, so we need to set the public key manually.
  /* eslint-disable @silverhand/fp/no-mutation */
  cert.publicKey = keypair.publicKey;
  // Use cryptographically secure pseudorandom number generator (CSPRNG) to generate a random serial number (usually more than 8 bytes).
  // `serialNumber` should be IDENTICAL across different certificates, better not to be incremental.
  cert.serialNumber = crypto.randomBytes(16).toString('hex');
  cert.validity.notBefore = notBefore;
  cert.validity.notAfter = notAfter;
  /* eslint-enable @silverhand/fp/no-mutation */

  // TODO: read from tenant config or let user customize before downloading
  const subjectAttributes: forge.pki.CertificateField[] = [
    {
      name: 'commonName',
      value: 'example.com',
    },
  ];

  const issuerAttributes: forge.pki.CertificateField[] = [
    {
      name: 'commonName',
      value: 'logto.io',
    },
    {
      name: 'organizationName',
      value: 'Logto',
    },
    {
      name: 'countryName',
      value: 'US',
    },
  ];

  cert.setSubject(subjectAttributes);
  cert.setIssuer(issuerAttributes);
  cert.sign(keypair.privateKey);

  return {
    privateKey: forge.pki.privateKeyToPem(keypair.privateKey),
    certificate: forge.pki.certificateToPem(cert),
    notAfter,
  };
};
