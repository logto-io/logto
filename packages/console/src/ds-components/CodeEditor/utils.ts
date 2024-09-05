import type { CSSProperties } from 'react';

export const lineNumberContainerStyle = (): CSSProperties => {
  return {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'right',
    paddingInlineStart: '0px',
    paddingInlineEnd: '0px',
  };
};

export const lineNumberStyle = (numberOfLines: number): CSSProperties => {
  return {
    minWidth: `calc(${numberOfLines}ch + 20px)`,
    marginInlineStart: '0px',
    paddingInlineEnd: '20px',
    paddingInlineStart: '0px',
    display: 'inline-flex',
    justifyContent: 'flex-end',
    counterIncrement: 'line',
    lineHeight: '1.5',
    flexShrink: 0,
    fontFamily: "'Roboto Mono', monospace",
    fontSize: '14px',
    position: 'sticky',
    background: '#34353f', // Stick to code editor container
    left: 0,
  };
};

export const customStyle = (width?: number): CSSProperties => {
  return {
    width: `${width ?? 0}px`,
    background: 'transparent',
    fontSize: '14px',
    margin: '0',
    padding: '0',
    borderRadius: '0',
    wordBreak: 'break-all',
    overflow: 'unset',
    fontFamily: "'Roboto Mono', monospace", // Override default font-family of <pre>
  };
};
