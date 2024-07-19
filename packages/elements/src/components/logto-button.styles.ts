import { css } from 'lit';

import { unit } from '../utils/css.js';
import { vars } from '../utils/theme.js';

export const buttonSizes = css`
  :host([size='small']) {
    height: 30px;
    padding: ${unit(0, 3)};
  }

  :host([size='small'][type='text']) {
    height: 24px;
  }

  :host([size='medium']) {
    height: 36px;
    padding: ${unit(0, 4)};
  }

  :host([size='medium'][type='text']) {
    height: 28px;
    font: ${vars.fontLabel1};
  }

  :host([size='large']) {
    height: 44px;
    padding: ${unit(0, 6)};
  }

  :host([size='large'][type='text']) {
    height: 28px;
    font: ${vars.fontLabel1};
  }
`;

export const textButton = css`
  :host([type='text']) {
    background: none;
    border-color: transparent;
    font: ${vars.fontLabel2};
    color: ${vars.colorTextLink};
    padding: ${unit(0.5, 1)};
    border-radius: ${unit(1)};
  }

  :host([type='text']:disabled) {
    color: ${vars.colorDisabled};
  }

  :host([type='text']:focus-visible) {
    outline: 2px solid ${vars.colorFocusedVariant};
  }

  :host([type='text']:not(:disabled):not(:active):hover) {
    background: ${vars.colorHoverVariant};
  }
`;

export const defaultButton = css`
  :host([type='default']) {
    background: ${vars.colorLayer1};
    color: ${vars.colorTextPrimary};
    border: 1px solid ${vars.colorBorder};
  }

  :host([type='default']:disabled) {
    color: ${vars.colorPlaceholder};
  }

  :host([type='default']:focus-visible) {
    outline: 3px solid ${vars.colorFocused};
  }

  :host([type='default']:active) {
    background: ${vars.colorPressed};
  }

  :host([type='default']:not(:disabled):not(:active):hover) {
    background: ${vars.colorHover};
  }
`;

export const primaryButton = css`
  :host([type='primary']) {
    background: ${vars.colorPrimary};
    color: ${vars.colorOnPrimary};
  }

  :host([type='primary']:disabled) {
    background: ${vars.colorDisabledBackground};
    color: ${vars.colorPlaceholder};
  }

  :host([type='primary']:focus-visible) {
    outline: 3px solid ${vars.colorFocusedVariant};
  }

  :host([type='primary']:active) {
    background: ${vars.colorPrimaryPressed};
  }

  :host([type='primary']:not(:disabled):not(:active):hover) {
    background: ${vars.colorPrimaryHover};
  }
`;
