import * as React from 'react';

/**
 * Expose a "Label" element for the consumer side
 */
function Label({ children, ...rest }) {
  return <div {...rest}>{ props.children }</div>;
}

Label.defaultProps = {
  '__sui-internal-type': 'Label',
};

export default Label;
