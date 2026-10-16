---
"@logto/console": patch
---

announce locked Console selects, tag inputs, color pickers and number steppers as disabled and skip them with Tab

Read-only or disabled selects, multi-selects, tag inputs, the color picker and the number input's step buttons are now announced as disabled by screen readers and left out of the keyboard Tab order. A disabled number step button no longer changes the value when Enter or Space is pressed on it, and a disabled tag input no longer shows remove buttons on its entries.
