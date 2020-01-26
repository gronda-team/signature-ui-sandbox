import React from 'react';
import PropTypes from 'prop-types';
import { ThemeContext } from 'styled-components';
import { ButtonOverlay, ButtonRoot, ButtonWrapper } from './styles';
import { useTabIndex } from '../core/common/useTabIndex';
import { useFocusMonitor } from '../../cdk/A11y';
import { BUTTON_APPEARANCE, BUTTON_SIZES, BUTTON_STROKE, BUTTON_VARIANTS, BUTTON_WEIGHT } from './util';

let nextUniqueId = 0;

function Button(props) {
  const {
    id: __id, variant, appearance, color, dense, full, size, stroke: __stroke, weight, disabled,
    as: __as, style: __style, tabIndex: __tabIndex, children, ...restProps
  } = props;

  const focusMonitor = useFocusMonitor();

  const [focusOrigin, setFocusOrigin] = React.useState(null);

  /** Theme context */
  const { linkAliases, buttonAliases } = React.useContext(ThemeContext);

  /** Create the final id */
  const id = React.useMemo(() => (
    __id  || `sui-button:${nextUniqueId++}`
  ), [__id]);

  // Add the stroke property if it doesn't already exist for stroked buttons
  const stroke = React.useMemo(() => {
    if (appearance === 'stroked') {
      return __stroke || 'thin';
    }

    return null;
  }, [__stroke, appearance]);

  /** @type {React.MutableRefObject<?HTMLElement>} */
  const el = React.useRef(null);

  // Determine what kind of underlying component should be used in order to get
  // the props correct
  const htmlNodeAs = React.useMemo(() => {
    if (__as === 'button' || __as === 'a') return __as;
    if (linkAliases.indexOf(__as) > -1) return 'a';
    if (buttonAliases.indexOf(__as) > -1) return 'button';
    return 'button';
  }, [linkAliases, buttonAliases]);

  const tabIndex = useTabIndex(__tabIndex, disabled);

  // To bring link buttons in line with regular buttons, we have to add a few
  // more props that are different.
  const additionalProps = React.useMemo(() => {
    if (htmlNodeAs === 'a') {
      return {
        tabIndex,
        'aria-disabled': disabled,
      };
    }

    return {};
  }, [htmlNodeAs, tabIndex, disabled]);

  // Anchors must disable navigation for onClick
  const onClick = React.useCallback((event) => {
    if (htmlNodeAs === 'a') {
      // A disabled button shouldn't apply any actions
      if (disabled) {
        event.preventDefault();
        event.nativeEvent.stopImmediatePropagation();
      }
    }

    if (typeof restProps.onClick === 'function') {
      restProps.onClick(event);
    }
  }, [htmlNodeAs, disabled, restProps.onClick]);

  const setFocusMonitorStates = React.useCallback(setFocusOrigin, [setFocusOrigin]);

  React.useEffect(() => {
    if (el.current) {
      focusMonitor.monitor({
        element: el.current,
        checkChildren: true,
        callback: setFocusMonitorStates,
      });
    }

    return () => {
      if (el.current) {
        focusMonitor.stopMonitoring(el.current);
      }
    };
  }, [el.current]);

  return (
    <ButtonRoot
      {...restProps}
      {...additionalProps}
      ref={el}
      as={__as}
      id={id}
      onClick={onClick}
      disabled={disabled || null}
      data-color={color}
      data-type={variant}
      data-appearance={appearance}
      data-size={size}
      data-full={full}
      data-dense={dense}
      data-stroke-width={stroke}
      data-sui-font-weight={weight}
      data-cdk-focus={focusOrigin}
      data-sui="button"
      data-sui-tree="button:root"
    >
      <ButtonWrapper as="span" data-sui-tree="button:wrapper">{ children }</ButtonWrapper>
      <ButtonOverlay data-sui-tree="button:overlay" data-sui-role="overlay" />
    </ButtonRoot>
  );
}

Button.propTypes = {
  id: PropTypes.string,
  style: PropTypes.object,
  disabled: PropTypes.bool,
  as: PropTypes.oneOfType([
    PropTypes.oneOf(['button', 'a']),
    PropTypes.func,
  ]),
  tabIndex: PropTypes.number,
  /** Styling */
  variant: PropTypes.oneOf(BUTTON_VARIANTS),
  appearance: PropTypes.oneOf(BUTTON_APPEARANCE),
  stroke: PropTypes.oneOf(BUTTON_STROKE),
  size: PropTypes.oneOf(BUTTON_SIZES),
  weight: PropTypes.oneOf(BUTTON_WEIGHT),
  full: PropTypes.bool,
  dense: PropTypes.bool,
  color: PropTypes.string,
};

Button.defaultProps = {
  id: null,
  style: {},
  disabled: false,
  as: 'button',
  tabIndex: null,
  variant: 'text',
  appearance: 'default',
  stroke: null,
  size: 'medium',
  weight: 'normal',
  full: false,
  dense: false,
  color: 'grey',
};

export default Button;
