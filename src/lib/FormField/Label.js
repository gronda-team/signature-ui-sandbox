import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { useFormField, FormFieldActions } from './context';
import { FormFieldLabelAnchor } from './styles';

let nextUniqueId = 0;

function Label({ id, __isUserProvidedLabel, children, ...restProps }) {
  const finalId = React.useMemo(() => id || `sui-form-field-label:${nextUniqueId++}`, [id]);

  const [formField, dispatch] = useFormField();

  /** @type {React.MutableRefObject<?Element>} */
  const node = React.useRef(null);

  const [mounted, setMounted] = React.useState(false);

  // Set the anchor in one of the form field anchors provided
  React.useEffect(() => {
    if (formField.labelContainer && !mounted) {
      // Remove existing label if one exists
      const existingSpan = formField.labelContainer.querySelector('span[data-role="portal"]');
      if (existingSpan) {
        formField.labelContainer.removeChild(existingSpan);
      }

      const portal = document.createElement('span');
      portal.dataset.role = 'portal';
      node.current = portal;

      formField.labelContainer.insertBefore(node.current, formField.labelContainer.firstChild);
      setMounted(true);
    }
  }, [formField.labelContainer, mounted]);

  React.useEffect(() => {
    return () => {
      if (formField.labelContainer) {
        formField.labelContainer.removeChild(node.current);
      }
    };
  }, []);

  React.useEffect(() => {
    dispatch({ type: FormFieldActions.SET_IS_USER_PROVIDED_LABEL, data: __isUserProvidedLabel });
  }, [__isUserProvidedLabel]);

  return mounted && node.current ? ReactDOM.createPortal(
    <FormFieldLabelAnchor
      {...restProps}
      as="span"
      id={finalId}
    >{ children || formField.placeholder }</FormFieldLabelAnchor>,
    node.current,
  ) : null;
}

Label.propTypes = {
  id: PropTypes.string,
  /**
   * Whether or not the label is provided by the user. This is an internal property that helps
   * determine if we should make the placeholder transparent. In FormField, this internal property
   * is true, which means that instead of showing a placeholder, the input[placeholder] property
   * will actually be used as a label.
   */
  __isUserProvidedLabel: PropTypes.bool,
};

Label.defaultProps = {
  id: null,
  __isUserProvidedLabel: true,
};

export default Label;
