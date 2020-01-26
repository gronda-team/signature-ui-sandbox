import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { useFormField, FormFieldActions } from './context';
import { FormFieldHint } from './styles';

let nextUniqueId = 0;

function Hint({ align, id, children, ...restProps }) {
  const finalId = React.useMemo(() => id || `sui-hint:${nextUniqueId++}`, [id]);

  const [formField, dispatch] = useFormField();

  /** @type {React.MutableRefObject<?Element>} */
  const node = React.useRef(null);

  const [mounted, setMounted] = React.useState(false);

  // Add describedby id to the form field so that the form control can consume it.
  React.useEffect(() => {
    dispatch({ type: FormFieldActions.ADD_DESCRIBED_BY_ID, data: finalId });

    return () => {
      dispatch({ type: FormFieldActions.REMOVE_DESCRIBED_BY_ID, data: finalId });
    };
  }, [finalId]);

  // Set the anchor in one of the form field anchors provided
  React.useEffect(() => {
    if (formField.subscriptContainer && !mounted) {
      node.current = formField.subscriptContainer.querySelector(`[data-hint-anchor="${align}"]`);
      setMounted(true);
    }
  }, [formField.subscriptContainer, mounted]);

  return mounted && node.current ? ReactDOM.createPortal(
    <FormFieldHint {...restProps} data-sui-tree="form-field:hint" data-align={align} id={finalId}>
      { children }
    </FormFieldHint>,
    node.current,
  ) : null;
}

Hint.propTypes = {
  id: PropTypes.string,
  align: PropTypes.oneOf(['start', 'end']),
};

Hint.defaultProps = {
  id: null,
  align: 'start',
};

export default Hint;
