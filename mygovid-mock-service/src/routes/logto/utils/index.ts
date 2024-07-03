import fs from "fs";
import crypto from "crypto";
import { importPKCS8, importSPKI, SignJWT } from "jose";

const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: "spki",
    format: "pem",
  },
  privateKeyEncoding: {
    type: "pkcs8",
    format: "pem",
  },
});

export const streamToString = (stream: fs.ReadStream): Promise<string> => {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("error", (err) => reject(err));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
};

const getRandomPhoneNumber = () =>
  `+353${Math.floor(Math.random() * 9000000000) + 1000000000}`;

const getRandomString = () => crypto.randomBytes(20).toString("hex");

export const createMockSignedJwt = async (
  user: {
    firstName: string;
    lastName: string;
    email: string;
  },
  origin: string,
) => {
  const body = {
    ver: "1.0",
    sub: getRandomString(),
    auth_time: Date.now(),
    email: user.email,
    oid: getRandomString(),
    AlternateIds: "",
    BirthDate: "13/06/1941",
    PublicServiceNumber: "0111019P",
    LastJourney: "Login",
    mobile: getRandomPhoneNumber(),
    DSPOnlineLevel: "0",
    DSPOnlineLevelStatic: "0",
    givenName: user.firstName,
    surname: user.lastName,
    CustomerId: "532",
    AcceptedPrivacyTerms: true,
    AcceptedPrivacyTermsVersionNumber: "7",
    SMS2FAEnabled: false,
    AcceptedPrivacyTermsDateTime: 1715582120,
    firstName: user.firstName,
    lastName: user.lastName,
    currentCulture: "en",
    trustFrameworkPolicy: "B2C_1A_MyGovID_signin-v5-PARTIAL2",
    CorrelationId: getRandomString(),
    nbf: 1716804749,
  };

  const alg = "RS256";
  const key = await importPKCS8(privateKey, alg);

  const jwt = await new SignJWT(body)
    .setProtectedHeader({ alg })
    .setAudience("mock_client_id")
    .setIssuedAt()
    .setIssuer(origin)
    .setExpirationTime("2h")
    .sign(key);

  return jwt;
};

export const getPublicKey = async () => await importSPKI(publicKey, "RS256");
