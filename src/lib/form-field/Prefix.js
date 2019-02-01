import * as React from 'react';

/**
 * Expose a "Prefix" element for the consumer side
 */
function Prefix({ children, ...rest }) {
  return <div {...rest}>{ children }</div>;
}

Prefix.defaultProps = {
  '__sui-internal-type': 'Prefix',
};

export default Prefix;
