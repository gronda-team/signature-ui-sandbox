import React from 'react';
import noop from 'lodash/noop';
import PropTypes from 'prop-types';
import { OptGroupLabel, OptGroupRoot } from './styles';
import { OptGroupContext, OptionParentContext } from './context';

let nextUniqueId = 0;

function OptGroup({ id, ['data-list-key']: dataListKey, disabled, children, label, ...restProps }) {
  const parent = React.useContext(OptionParentContext);

  const finalId = React.useMemo(() => (
    id || `sui-optgroup:${nextUniqueId++}`
  ), [id]);

  const labelId = `${finalId}--label`;

  const provider = React.useMemo(() => ({
    id: finalId, disabled,
  }), [finalId, disabled]);

  const groupRef = React.useMemo(() => ({
    id: finalId,
    'data-list-key': dataListKey,
  }), [finalId]);

  // Registers itself with the parent
  React.useEffect(() => {
    const unregister = parent.register(groupRef) || noop;

    return () => {
      unregister();
    };
  }, [
    parent.register,
    groupRef,
  ]);

  return (
    <OptGroupRoot
      id={finalId}
      role="group"
      aria-disabled={disabled}
      aria-labelledby={labelId}
      data-disabled={disabled}
      data-sui="optgroup"
      data-list-key={dataListKey}
      data-sui-tree="optgroup:root"
      {...restProps}
    >
      <OptGroupLabel id={labelId} data-sui-tree="optgroup:label">{ label }</OptGroupLabel>
      <OptGroupContext.Provider value={provider}>
        { children }
      </OptGroupContext.Provider>
    </OptGroupRoot>
  );
}

OptGroup.propTypes = {
  // HTML id
  id: PropTypes.string,
  // Content
  children: PropTypes.node,
  // The label that's shown
  label: PropTypes.node,
  // Whether the option group (and its children) is disabled
  disabled: PropTypes.bool,
  // The list key to service the parent and the key manager
  'data-list-key': PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

OptGroup.defaultProps = {
  id: null,
  children: null,
  label: null,
  disabled: false,
  __SUI_TYPE__: 'optgroup',
};

export default OptGroup;
