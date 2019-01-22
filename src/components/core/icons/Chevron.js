import * as React from 'react';
import { GREY } from '../theme/colors';

export default (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="-6 -3 12 6" version="1.1">
    <path strokeLinejoin="miter" stroke={GREY[700]} fill="transparent" d="M -4 -2 L 0 2 L 4 -2" />
  </svg>
);
