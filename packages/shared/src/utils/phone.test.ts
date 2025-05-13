import { describe, it, expect } from 'vitest';

import { parsePhoneNumber, PhoneNumberParser } from './phone.js';

describe('parsePhoneNumber', () => {
  it('parsePhoneNumber should return if the phone number is valid', () => {
    const phoneNumber = '12025550123';
    expect(parsePhoneNumber(phoneNumber, true)).toEqual('12025550123');
  });

  it('parsePhoneNumber should strip the leading +', () => {
    const phoneNumber = '+12025550123';
    expect(parsePhoneNumber(phoneNumber)).toEqual('12025550123');
  });

  it('parsePhoneNumber should srtip the leading 0', () => {
    const phoneNumber = '610412345678';
    expect(parsePhoneNumber(phoneNumber)).toEqual('61412345678');
  });

  it('parsePhoneNumber should strip non-digit characters', () => {
    const phoneNumber = '+61 (0) 412 345 678';
    expect(parsePhoneNumber(phoneNumber)).toEqual('61412345678');
  });

  it('should return the original phone number if it is invalid', () => {
    const phoneNumber = '0123';
    expect(parsePhoneNumber(phoneNumber)).toEqual(phoneNumber);
  });

  it('should throw an error if the phone number is invalid and throwError is true', () => {
    const phoneNumber = '0123';
    expect(() => parsePhoneNumber(phoneNumber, true)).toThrowError();
  });
});

describe('PhoneNumberParser', () => {
  type TestCase = {
    phone: string;
    isValid: boolean;
    countryCode?: string;
    nationalNumber?: string;
    internationalNumber?: string;
    internationalNumberWithLeadingZero?: string;
  };
  const testCases: TestCase[] = [
    {
      phone: '12025550123',
      isValid: true,
      countryCode: '1',
      nationalNumber: '2025550123',
      internationalNumber: '12025550123',
      internationalNumberWithLeadingZero: '102025550123',
    },
    {
      phone: '+61 (0) 412 345 678',
      isValid: true,
      countryCode: '61',
      nationalNumber: '412345678',
      internationalNumber: '61412345678',
      internationalNumberWithLeadingZero: '610412345678',
    },
    {
      phone: '61 412 345 678',
      isValid: true,
      countryCode: '61',
      nationalNumber: '412345678',
      internationalNumber: '61412345678',
      internationalNumberWithLeadingZero: '610412345678',
    },
    {
      phone: '456',
      isValid: false,
      countryCode: undefined,
      nationalNumber: undefined,
      internationalNumber: undefined,
      internationalNumberWithLeadingZero: undefined,
    },
  ];

  it.each(testCases)(
    'parsePhoneNumber should return $phone if the phone number is valid',
    ({
      phone,
      isValid,
      countryCode,
      nationalNumber,
      internationalNumber,
      internationalNumberWithLeadingZero,
    }) => {
      const parser = new PhoneNumberParser(phone);
      expect(parser.raw).toEqual(phone);
      expect(parser.isValid).toEqual(isValid);
      expect(parser.countryCode).toEqual(countryCode);
      expect(parser.nationalNumber).toEqual(nationalNumber);
      expect(parser.internationalNumber).toEqual(internationalNumber);
      expect(parser.internationalNumberWithLeadingZero).toEqual(internationalNumberWithLeadingZero);
    }
  );
});
