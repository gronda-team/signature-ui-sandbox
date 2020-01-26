import * as React from 'react';
import noop from 'lodash/noop';
import sortBy from 'lodash/sortBy';

export const PARENT_INIT_CONTEXT = {
  selected: [],
  register: noop,
  multiple: false,
  onSelectionChange: noop,
  activeListKey: null,
  usesActiveDescendantManager: false,
  usesFocusManager: false,
};

export const OptionParentContext = React.createContext(PARENT_INIT_CONTEXT);

export const OptGroupContext = React.createContext({
  id: null,
  disabled: false,
});

/**
 * @param child {Object} JSX child from `props.children`
 * @param ref {Object} Ref given from the `parent.register` payload.
 * @return {boolean}
 */
function defaultSortFn(child, ref) {
  return child.props['data-list-key'] === ref['data-list-key'];
}

/**
 * Ref manager to keep track of option refs. This allows there to be parity between
 * `this.props.children` (what the client provides) and the HTML representation of the options
 * themselves. The refs are sorted in the same order that the children are given.
 * @param children
 * @param sortFn
 * @return {[Array, Function]}
 */
export function useRefManager(children, sortFn = defaultSortFn) {
  const [refs, setRefs] = React.useState([]);

  /**
   * Add each payload to the array of refs. Returns a function that removes the current ref.
   * @type {function(payload: Object): Function}
   */
  const register = React.useCallback((payload) => {
    setRefs(currentRefs => [...currentRefs, payload]);

    return () => {
      setRefs((currentRefs) => {
        const index = currentRefs.indexOf(payload);
        if (index > -1) {
          const newRefs = [...currentRefs];
          newRefs.splice(index, 1);
          return newRefs;
        }

        return currentRefs;
      });
    };
  }, [setRefs]);

  /**
   * Final sorted refs. This updates when the children change or the sort function changes.
   * @type {Array}
   */
  const sortedRefs = React.useMemo(() => {
    const childrenArray = React.Children.toArray(children);

    return sortBy(refs, item => (
      childrenArray.findIndex(child => sortFn(child, item))
    ));
  }, [children, refs, sortFn]);

  return React.useMemo(() => [sortedRefs, register], [sortedRefs, register]);
}

function childIsOption(child) {
  return child.props.__SUI_TYPE__ === 'option';
}

function childIsOptionGroup(child) {
  return child.props.__SUI_TYPE__ === 'optgroup';
}

/**
 * Function to get the options and option groups from a list of children
 */
export function useOptionFilter(children) {
  const childrenArray = React.useMemo(() => (
    React.Children.toArray(children)
  ), [children]);

  const optionGroupChildren = React.useMemo(() => {
    return childrenArray.filter(childIsOptionGroup);
  }, [childrenArray]);

  const optionChildren = React.useMemo(() => {
    if (optionGroupChildren.length > 0) {
      return childrenArray.reduce((options, group) => {
        const groupArray = React.Children.toArray(group.props.children);
        return options.concat(
          groupArray.filter(childIsOption)
        );
      }, []);
    }

    return childrenArray.filter(childIsOption);
  }, [optionGroupChildren]);

  return React.useMemo(() => (
    [optionChildren, optionGroupChildren]
  ), [optionChildren, optionGroupChildren]);
}
