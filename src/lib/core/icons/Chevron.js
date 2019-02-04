import * as React from 'react';

export default function Chevron(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 8" version="1.1">
      <path d="M 1 2 L 6 7 L 11 2" />
    </svg>
  );
}

Chevron.displayName = 'ChevronIcon';
