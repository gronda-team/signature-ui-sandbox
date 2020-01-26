import React from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import { useTabIndex } from '../core/common/useTabIndex';
import { ButtonToggleContext } from './context';
import { ButtonToggleButton, ButtonToggleLabelContent, ButtonToggleOverlay, ButtonToggleRoot } from './styles';
import { useFocusMonitor } from '../../cdk/A11y';

let nextUniqueId = 0;

function ButtonToggle(props) {
  const {
    id: __id, tabIndex: __tabIndex, disabled, ['aria-label']: ariaLabel, onChange,
    checked: __checked, ['aria-labelledby']: ariaLabelledby, appearance: __appearance, shape, size,
    color: __color, children, value, ...restProps
  } = props;

  const [focusOrigin, updateFocusOrigin] = React.useState(null);

  const focusMonitor = useFocusMonitor();

  const toggleGroup = React.useContext(ButtonToggleContext);

  /** Create the final id */
  const id = React.useMemo(() => (
    __id  || `sui-button-toggle:${nextUniqueId++}`
  ), [__id]);

  const buttonId = `${id}--button`;

  /**
   * Ref for the root component
   * @type {React.MutableRefObject<?HTMLElement>}
   */
  const el = React.useRef(null);

  /**
   * Ref for the button component
   * @type {React.MutableRefObject<?HTMLElement>}
   */
  const button = React.useRef(null);

  /** @type {number} Tab index */
  const tabIndex = useTabIndex(__tabIndex, disabled, null);

  /** @type {boolean} Whether the button is checked (standalone or from group) */
  const checked = React.useMemo(() => {
    if (typeof __checked === 'boolean') return __checked;
    return toggleGroup.id ?
      toggleGroup.isSelected(value) :
      false;
  }, [toggleGroup.id, toggleGroup.isSelected, value, __checked]);

  /** @type {string} Appearance type (standalone or inherited from group) */
  const appearance = React.useMemo(() => (
    toggleGroup.id ? toggleGroup.appearance : __appearance
  ), [toggleGroup.id, toggleGroup.appearance, __appearance]);

  /** @type {string} Color (standalone or inherited from group) */
  const color = React.useMemo(() => (
    toggleGroup.id ? toggleGroup.color : __color
  ), [toggleGroup.id, toggleGroup.color, __color]);

  const handleRootFocus = React.useCallback(
    /**
     * Focuses the button.
     * @param options {FocusOptions}
     */
    (options) => {
      button.current.focus(options);
    },
    [],
  );

  /**
   * Checks the button and dispatches changes through the group onChange
   * handler.
   */
  const onButtonClick = React.useCallback(() => {
    if (toggleGroup.id) {
      toggleGroup.select(value);
    } else if (typeof onChange === 'function') {
      onChange({
        source: el.current,
        value,
        checked: !checked,
      })
    }
  }, [toggleGroup.id, toggleGroup.select, value, checked]);

  React.useEffect(() => {
    if (el.current) {
      focusMonitor.monitor({
        element: el.current, checkChildren: true, callback: updateFocusOrigin,
      });
    }

    return () => {
      if (el.current) {
        focusMonitor.stopMonitoring(el.current);
      }
    };
  }, [el.current]);

  return (
    <ButtonToggleRoot
      {...restProps}
      ref={el}
      id={id}
      // Always reset the tabindex to -1 so it doesn't conflict with the one on the `button`,
      // but can still receive focus from things like cdkFocusInitial.
      tabIndex={-1}
      name={null}
      onFocus={handleRootFocus}
      data-standalone={!toggleGroup.id}
      data-checked={checked}
      data-disabled={disabled}
      data-appearance={appearance}
      data-shape={shape}
      data-size={size}
      data-color={color}
      data-cdk-focus={focusOrigin}
      data-sui="button-toggle"
      data-sui-tree="button-toggle:root"
    >
      <ButtonToggleButton
        as="button"
        id={buttonId}
        tabIndex={tabIndex}
        disabled={disabled || null}
        name={toggleGroup.name || null}
        aria-pressed={checked}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        onClick={onButtonClick}
        ref={button}
        data-sui-tree="button-toggle:button"
      >
        <ButtonToggleLabelContent data-sui-tree="button-toggle:label">
          { children }
        </ButtonToggleLabelContent>
      </ButtonToggleButton>
      <ButtonToggleOverlay data-sui-tree="button-toggle:overlay" data-sui-role="overlay" />
    </ButtonToggleRoot>
  );
}

ButtonToggle.propTypes = {
  id: PropTypes.string,
  tabIndex: PropTypes.number,
  'aria-label': PropTypes.string,
  'aria-labelledby': PropTypes.string,
  /** Button appearance */
  appearance: PropTypes.oneOf([
    'default', 'stroked', 'fill', 'basic',
  ]),
  shape: PropTypes.oneOf(['square', 'shaped', 'round']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  color: PropTypes.string,
  /** Single change handler for standalone buttons */
  onChange: PropTypes.func,
  /** Whether the button is checked for standalone buttons */
  checked: PropTypes.bool,
};

ButtonToggle.defaultProps = {
  id: null,
  tabIndex: 0,
  'aria-label': null,
  'aria-labelledby': null,
  appearance: 'default',
  shape: 'shaped',
  size: 'medium',
  color: 'grey',
  onChange: noop,
  checked: undefined,
};

export default ButtonToggle;
