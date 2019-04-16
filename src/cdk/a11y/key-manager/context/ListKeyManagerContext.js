import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

export const ListKeyManagerPropTypes = PropTypes.shape({
  activeItemIndex: PropTypes.number,
  activeItem: PropTypes.oneOfType([PropTypes.node, PropTypes.element]),
  setTabOutFn: PropTypes.func,
  setConfig: PropTypes.func,
  setSkipPredicateFn: PropTypes.func,
  setMatchViewValueFn: PropTypes.func,
  setItems: PropTypes.func,
  setActiveItem: PropTypes.func,
  onKeydown: PropTypes.func,
  setFirstItemActive: PropTypes.func,
  setLastItemActive: PropTypes.func,
  setNextItemActive: PropTypes.func,
  setPreviousItemActive: PropTypes.func,
  updateActiveItem: PropTypes.func,
  updateActiveItemIndex: PropTypes.func,
});

export const ListKeyManagerDefaultProps = {
  activeItemIndex: -1,
  activeItem: null,
  setTabOutFn: _.noop,
  setConfig: _.noop,
  setSkipPredicateFn: _.noop,
  setMatchViewValueFn: _.noop,
  setItems: _.noop,
  setActiveItem: _.noop,
  onKeydown: _.noop,
  setFirstItemActive: _.noop,
  setLastItemActive: _.noop,
  setNextItemActive: _.noop,
  setPreviousItemActive: _.noop,
  updateActiveItem: _.noop,
  updateActiveItemIndex: _.noop,
};

export const {
  Provider: ListKeyProvider,
  Consumer: ListKeyConsumer,
} = React.createContext(ListKeyManagerDefaultProps);
