import React from 'react';
import PropTypes from 'prop-types';
import { ButtonToggleContext } from './context';
import { ButtonToggleGroupRoot } from './styles';
import useSelectionModel from '../../cdk/Collections/useSelectionModel';

let nextUniqueId = 0;

function ButtonToggleGroup(props) {
  const {
    id: __id, name: __name, disabled, appearance, color, vertical, multiple, children,
    onChange, value, ...restProps
  } = props;

  /** Create the final id */
  const id = React.useMemo(() => (
    __id  || `sui-button-toggle-group:${nextUniqueId++}`
  ), [__id]);

  const name = React.useMemo(() => (
    __name || `${id}--name`
  ), [__name, __id]);

  const selection = useSelectionModel(value, { multiple, onChange });

  const provider = React.useMemo(() => ({
    id,
    name,
    appearance,
    disabled,
    multiple,
    color,
    select: selection.select,
    isSelected: selection.isSelected,
  }), [
    id,
    name,
    appearance,
    disabled,
    multiple,
    color,
    selection.isSelected,
    selection.select,
  ]);

  return (
    <ButtonToggleGroupRoot
      {...restProps}
      id={id}
      role="group"
      aria-disabled={disabled}
      data-vertical={vertical}
      data-appearance={appearance}
      data-disabled={disabled}
      data-sui="button-toggle-group"
      data-sui-root="button-toggle-group:root"
    >
      <ButtonToggleContext.Provider value={provider}>
        { children }
      </ButtonToggleContext.Provider>
    </ButtonToggleGroupRoot>
  );
}

ButtonToggleGroup.propTypes = {
  id: PropTypes.string,
  disabled: PropTypes.bool,
  vertical: PropTypes.bool,
  multiple: PropTypes.bool,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.arrayOf(PropTypes.oneOfType([
      PropTypes.string, PropTypes.number,
    ])),
  ]),
  appearance: PropTypes.oneOf([
    'default', 'stroked', 'fill', 'basic',
  ]),
  color: PropTypes.string,
  /** For the underlying element */
  name: PropTypes.string,
};

ButtonToggleGroup.defaultProps = {
  id: null,
  disabled: false,
  vertical: false,
  multiple: false,
  value: null,
  appearance: 'default',
  color: 'grey',
  name: null,
};

export default ButtonToggleGroup;
