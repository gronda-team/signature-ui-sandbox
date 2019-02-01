import * as React from 'react';

/**
 * Expose a "Suffix" element for the consumer side
 */
function Suffix({ children, ...rest }) {
  return <div {...rest}>{ children }</div>;
}

Suffix.defaultProps = {
  '__sui-internal-type': 'Suffix',
};

export default Suffix;
