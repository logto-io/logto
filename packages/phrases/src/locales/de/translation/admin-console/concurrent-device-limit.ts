const concurrent_device_limit = {
  title: 'Gleichzeitiges Geräte-Limit',
  description:
    'Steuern Sie, auf wie vielen Geräten ein Benutzer für diese App angemeldet bleiben kann.',
  enable: 'Gleichzeitiges Geräte-Limit aktivieren',
  enable_description:
    'Wenn aktiviert, erzwingt Logto die maximale Anzahl aktiver Berechtigungen pro Benutzer für diese App.',
  field: 'Gleichzeitiges Geräte-Limit pro App',
  field_description:
    'Begrenzen Sie, auf wie vielen Geräten ein Benutzer gleichzeitig angemeldet sein kann. Logto erzwingt dies, indem aktive Berechtigungen begrenzt werden und die älteste Berechtigung automatisch zurückgezogen wird, wenn das Limit überschritten wird.',
  field_placeholder: 'Leer lassen für kein Limit',
  should_be_greater_than_zero: 'Sollte größer als 0 sein.',
};

export default Object.freeze(concurrent_device_limit);
