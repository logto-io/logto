const adaptiveMfaNewCountryWindowDays = 180;
const adaptiveMfaGeoVelocityThresholdKmh = 900;
const adaptiveMfaLongInactivityThresholdDays = 30;
const adaptiveMfaMinBotScore = 30;

export const msPerHour = 1000 * 60 * 60;
export const msPerDay = msPerHour * 24;

export const adaptiveMfaDefaultThresholds = {
  geoVelocityKmh: adaptiveMfaGeoVelocityThresholdKmh,
  longInactivityDays: adaptiveMfaLongInactivityThresholdDays,
  newCountryWindowDays: adaptiveMfaNewCountryWindowDays,
  minBotScore: adaptiveMfaMinBotScore,
};
