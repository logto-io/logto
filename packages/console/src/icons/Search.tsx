import { SVGProps } from 'react';

const Search = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8 12C5.791 12 4 10.209 4 8C4 5.791 5.791 4 8 4C10.209 4 12 5.791 12 8C12 10.209 10.209 12 8 12ZM17.707 16.293L12.887 11.473C13.585 10.492 14 9.296 14 8C14 4.687 11.313 2 8 2C4.687 2 2 4.687 2 8C2 11.313 4.687 14 8 14C9.296 14 10.492 13.585 11.473 12.887L16.293 17.707C16.488 17.902 16.744 18 17 18C17.256 18 17.512 17.902 17.707 17.707C18.098 17.316 18.098 16.684 17.707 16.293Z"
      fill="currentColor"
    />
  </svg>
);

export default Search;
