import React from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import {
  SlideToggleBar, SlideToggleContent,
  SlideToggleInput,
  SlideToggleLabel,
  SlideToggleRoot, SlideToggleThumb,
  SlideToggleThumbContainer,
} from './styles';
import { DISPLAY_NONE_STYLE } from '../core/style/layout';

let nextUniqueId = 0;

function SlideToggle(props) {
  const {
    id, checked, disabled, labelPosition, tabIndex, required, 'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby, children, name, onChange,
    ...restProps
  } = props;

  /** @type {React.MutableRefObject<HTMLElement>} */
  const labelContent = React.useRef(null);

  const finalId = React.useMemo(() => id || `sui-slide-toggle:${nextUniqueId++}`, [id]);

  const finalTabIndex = React.useMemo(() => Number.parseInt(tabIndex, 10) || 0, [tabIndex]);

  /** Returns the unique id for the visual hidden input. */
  const inputId = React.useMemo(() => `${finalId}--input`, [finalId]);

  const onChangeEvent = React.useCallback(
    /**
     * @param event {Event}
     */
    (event) => {
      // We always have to stop propagation on the change event.
      // Otherwise the change event, from the input element, will bubble up and
      // emit its event object to the component's `change` output.
      event.stopPropagation();
      // Trigger onChange prop
      onChange(event);
    },
    [onChange]
  );

  const onInputClick = React.useCallback(
    /**
     * @param event {Event}
     */
    (event) => {
      // We have to stop propagation for click events on the visual hidden input element.
      // By default, when a user clicks on a label element, a generated click event will be
      // dispatched on the associated input element. Since we are using a label element as our
      // root container, the click event on the `slide-toggle` will be executed twice.
      // The real click event will bubble up, and the generated click event also tries to bubble up.
      // This will lead to multiple click events.
      // Preventing bubbling for the second event will solve that issue.
      event.stopPropagation();
    },
    [],
  );

  return (
    <SlideToggleRoot
      {...restProps}
      id={finalId}
      data-checked={checked}
      data-disabled={disabled}
      data-label-before={labelPosition === 'before'}
    >
      <SlideToggleLabel as="label" htmlFor={inputId}>
        <SlideToggleBar
          data-no-side-margin={
            labelContent.current ?
              (!labelContent.current.textContent || !labelContent.current.textContent.trim()) :
              false
          }
        >
          <SlideToggleInput
            as="input"
            data-sui-visually-hidden="true"
            type="checkbox"
            role="switch"
            id={inputId}
            required={required}
            tabIndex={finalTabIndex}
            checked={checked}
            disabled={disabled}
            name={name}
            aria-checked={checked}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledby}
            onChange={onChangeEvent}
            onClick={onInputClick}
          />
          <SlideToggleThumbContainer>
            <SlideToggleThumb />
          </SlideToggleThumbContainer>
        </SlideToggleBar>
        <SlideToggleContent as="span" ref={labelContent}>
        {/* Invisible span so JAWS can read the label */}
          <span style={DISPLAY_NONE_STYLE} />
          { children }
        </SlideToggleContent>
      </SlideToggleLabel>
    </SlideToggleRoot>
  );
}

SlideToggle.propTypes = {
  /** Name value will be applied to the input element if present. */
  name: PropTypes.string,
  /** A unique id for the slide-toggle input. If none is supplied, it will be auto-generated. */
  id: PropTypes.string,
  /** Whether the label should appear after or before the slide-toggle. Defaults to 'after'. */
  labelPosition: PropTypes.oneOf(['before', 'after']),
  /** Used to set the aria-label attribute on the underlying input element. */
  'aria-label': PropTypes.string,
  /** Used to set the aria-labelledby attribute on the underlying input element. */
  'aria-labelledby': PropTypes.string,
  /** Whether the slide-toggle is required. */
  required: PropTypes.bool,
  /** Whether the slide-toggle element is checked or not. */
  checked: PropTypes.bool,
  /** Tab index of the underlying in put element */
  tabIndex: PropTypes.number,
  /** onChange handler */
  onChange: PropTypes.func,
};
SlideToggle.defaultProps = {
  name: null,
  id: null,
  labelPosition: 'after',
  'aria-label': null,
  'aria-labelledby': null,
  required: false,
  checked: false,
  tabIndex: null,
  onChange: noop,
};

export default SlideToggle;
