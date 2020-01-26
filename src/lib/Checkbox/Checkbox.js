import * as React from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash';
import { useFocusMonitor } from '../../cdk/A11y';
import { useTabIndex } from '../core/common/useTabIndex';
import {
  CheckboxBackground, CheckboxCheckmark, CheckboxCheckmarkPath,
  CheckboxFrame,
  CheckboxInnerContainer,
  CheckboxInput, CheckboxLabel,
  CheckboxLayout, CheckboxMixedMark,
  CheckboxRoot,
} from './styles';

let nextUniqueId = 0;

function Checkbox(props) {
  const {
    id: __id, tabIndex: __tabIndex, required, disabled, checked, indeterminate,
    name, value, labelPosition, onChange, onTouched, onIndeterminateChange,
    ['aria-label']: ariaLabel, ['aria-labelledby']: ariaLabelledby, indeterminateClickAction,
    color, children, ...restProps
  } = props;

  const id = React.useMemo(() => (
    __id || `sui-checkbox:${nextUniqueId++}`
  ), [__id]);

  const inputId = `${id}--input`;

  const tabIndex = useTabIndex(__tabIndex, disabled);

  // Root component
  const el = React.useRef(null);
  // Layout component
  const label = React.useRef(null);
  /**
   * Actual input element
   * @type {React.MutableRefObject<HTMLInputElement>}
   */
  const input = React.useRef(null);
  // Actual label component with the text
  const checkboxLabel = React.useRef(null);

  const onInteractionEvent = React.useCallback(
    /**
     * @param event {Event}
     */
    (event) => {
      // We always have to stop propagation on the change event.
      // Otherwise the change event, from the input element, will bubble up and
      // emit its event object to the `change` output.
      event.stopPropagation();
      onChange(event);
    },
    [onChange],
  );

  const onInputClick = React.useCallback(
    /**
     * Event handler for checkbox input element.
     * Toggles checked state if element is not disabled.
     * Do not toggle on (change) event since IE doesn't fire change event when
     *   indeterminate checkbox is clicked.
     * @param event {Event}
     */
    (event) => {
      // We have to stop propagation for click events on the visual hidden input element.
      // By default, when a user clicks on a label element, a generated click event will be
      // dispatched on the associated input element. Since we are using a label element as our
      // root container, the click event on the `checkbox` will be executed twice.
      // The real click event will bubble up, and the generated click event also tries to bubble up.
      // This will lead to multiple click events.
      // Preventing bubbling for the second event will solve that issue.
      event.stopPropagation();

      if (!disabled && indeterminateClickAction !== 'noop') {
        // When a user manually clicks on the checkbox, `indeterminate` is set to false
        if (indeterminate && indeterminateClickAction !== 'check') {
          onIndeterminateChange(false);
        }
      } else if (!disabled && indeterminateClickAction === 'noop') {
        // Align checkbox indeterminate state with prop state
        if (input.current) {
          input.current.indeterminate = indeterminate;
        }
      }
    },
    [disabled, indeterminateClickAction, indeterminate, onIndeterminateChange],
  );

  /**
   * Aria checked state
   */
  const ariaChecked = React.useMemo(() => {
    if (checked) return true;
    return indeterminate ? 'mixed' : false;
  }, [checked, indeterminate]);

  /**
   * Handling the focus monitor and corresponding changes.
   */
  const focusMonitor = useFocusMonitor();
  const [focusOrigin, setFocusOrigin] = React.useState(null);

  /**
   * Set the focus origin for component styling but also trigger the `onTouched` callback
   * when the trigger goes from focused to unfocused.
   * @type {Function}
   */
  const updateFocusOrigin = React.useCallback((origin) => {
    setFocusOrigin(origin);
    if (!origin && typeof onTouched === 'function') {
      onTouched();
    }
  }, [setFocusOrigin, onTouched]);

  // Handling the focus monitor to trigger onTouched
  React.useEffect(() => {
    if (el.current) {
      focusMonitor.monitor({
        element: el.current,
        checkChildren: true,
        callback: updateFocusOrigin,
      })
    }

    return () => {
      if (el.current) {
        focusMonitor.stopMonitoring(el.current);
      }
    }
  }, [
    el.current,
    updateFocusOrigin,
    focusMonitor.monitor,
    focusMonitor.stopMonitoring,
  ]);

  /**
   * Syncing the `indeterminate` prop with the underlying checkbox because the input
   * component doesn't natively accept an `indeterminate` attribute.
   */
  React.useEffect(() => {
    if (input.current) {
      input.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <CheckboxRoot
      {...restProps}
      id={id}
      tabIndex={null}
      ref={el}
      data-cdk-focus={focusOrigin}
      data-color={color}
      data-disabled={disabled}
      data-label-before={labelPosition === 'before'}
      data-checked={checked}
      data-indeterminate={indeterminate}
      data-sui="checkbox"
      data-sui-tree="checkbox:root"
    >
      <CheckboxLayout
        as="label"
        htmlFor={inputId}
        ref={label}
        data-sui-tree="checkbox:layout"
      >
        <CheckboxInnerContainer
          as="span"
          data-no-side-margin={
            checkboxLabel.current ?
              (!checkboxLabel.current.textContent || !checkboxLabel.current.textContent.trim()) :
              false
          }
          data-sui-tree="checkbox:inner-container"
        >
          <CheckboxInput
            as="input"
            type="checkbox"
            id={inputId}
            required={required}
            checked={checked}
            value={value || ''}
            disabled={disabled}
            name={name}
            tabIndex={tabIndex}
            aria-label={ariaLabel || null}
            aria-labelledby={ariaLabelledby}
            aria-checked={ariaChecked}
            onChange={onInteractionEvent}
            onClick={onInputClick}
            ref={input}
            data-sui-visually-hidden="true"
            data-sui-tree="checkbox:input"
          />
          <CheckboxFrame data-sui-tree="checkbox:frame" />
          <CheckboxBackground data-sui-tree="checkbox:background">
            <CheckboxCheckmark
              as="svg"
              version="1.1"
              focusable={false}
              viewBox="0 0 20 20"
              data-sui-tree="checkbox:checkmark"
            >
              <CheckboxCheckmarkPath
                as="path"
                fill="none"
                stroke="white"
                d="M2,11 7,16 18,4"
                data-sui-tree="checkbox:checkmark-path"
              />
            </CheckboxCheckmark>
            <CheckboxMixedMark data-sui-tree="checkbox:mixed-mark" />
          </CheckboxBackground>
        </CheckboxInnerContainer>
        <CheckboxLabel
          as="span"
          ref={checkboxLabel}
          data-sui-tree="checkbox:label"
        >
          <span style={{ display: 'none' }}>{' '}</span>
          { children }
        </CheckboxLabel>
      </CheckboxLayout>
    </CheckboxRoot>
  );
}

Checkbox.propTypes = {
  id: PropTypes.string,
  tabIndex: PropTypes.number,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  checked: PropTypes.bool,
  indeterminate: PropTypes.bool,
  'aria-label': PropTypes.string,
  'aria-labelledby': PropTypes.string,
  labelPosition: PropTypes.oneOf(['before', 'after']),
  /**
   * Checkbox click action when user click on input element.
   * noop: Do not toggle checked or indeterminate.
   * check: Only toggle checked status, ignore indeterminate.
   * check-indeterminate: Toggle checked status, set indeterminate to false. Default behavior.
   * undefined: Same as `check-indeterminate`.
   */
  indeterminateClickAction: PropTypes.oneOf([
    'noop', 'check', 'check-indeterminate',
  ]),
  name: PropTypes.string,
  onChange: PropTypes.func,
  onIndeterminateChange: PropTypes.func,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onTouched: PropTypes.func,
};

Checkbox.defaultProps = {
  id: null,
  tabIndex: 0,
  disabled: false,
  required: false,
  checked: false,
  indeterminate: false,
  'aria-label': '',
  'aria-labelledby': null,
  labelPosition: 'after',
  indeterminateClickAction: 'check-indeterminate',
  name: null,
  onChange: noop,
  onIndeterminateChange: noop,
  value: null,
  onTouched: noop,
};

export default Checkbox;
