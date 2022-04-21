import React from 'react';

type Props = {
  className?: string;
};

const Icon = ({ className }: Props) => (
  <span className={className}>
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="1" y="1" width="18" height="18" rx="4" fill="#5D34F2" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.31476 13.858L5.13295 10.441C4.95568 10.253 4.95568 9.947 5.13295 9.757L5.77568 9.074C5.95295 8.886 6.24113 8.886 6.4184 9.074L8.63657 11.466L13.5811 6.141C13.7584 5.953 14.0465 5.953 14.2238 6.141L14.8665 6.825C15.0438 7.013 15.0438 7.32 14.8665 7.507L8.95748 13.858C8.78021 14.046 8.49203 14.046 8.31476 13.858Z"
        fill="white"
      />
    </svg>
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="2" y="2" width="16" height="16" rx="3" stroke="#8E9192" strokeWidth="2" />
    </svg>
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="1" y="1" width="18" height="18" rx="4" fill="#C4C7C7" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.31476 13.858L5.13295 10.441C4.95568 10.253 4.95568 9.947 5.13295 9.757L5.77568 9.074C5.95295 8.886 6.24113 8.886 6.4184 9.074L8.63657 11.466L13.5811 6.141C13.7584 5.953 14.0465 5.953 14.2238 6.141L14.8665 6.825C15.0438 7.013 15.0438 7.32 14.8665 7.507L8.95748 13.858C8.78021 14.046 8.49203 14.046 8.31476 13.858Z"
        fill="white"
      />
    </svg>
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="2"
        y="2"
        width="16"
        height="16"
        rx="3"
        fill="#EFF1F1"
        stroke="#C4C7C7"
        strokeWidth="2"
      />
    </svg>
  </span>
);

export default Icon;
