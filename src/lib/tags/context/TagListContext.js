import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

const TagListContextPropTypes = PropTypes.shape({
  /** Whether the list is disabled */
  disabled: PropTypes.bool,
  /** Whether each tag is selectable */
  selectable: PropTypes.bool,
  /** Function to update the describedby IDs */
  changeDescribedByIds: PropTypes.func,
  /** Function to register the tag item */
  register: PropTypes.func,
  /** Function to deregister the tag item */
  unregister: PropTypes.func,
  /** Currently active (non-focused) ID */
  activeItemId: PropTypes.string,
});

const TagListContextDefaultProps = {
  disabled: false,
  selectable: false,
  changeDescribedByIds: _.noop,
  register: _.noop,
  deregister: _.noop,
  activeItemId: null,
};

const {
  Provider: TagListProvider,
  Consumer: TagListConsumer,
} = React.createContext(TagListContextDefaultProps);

/*
Convenience function
 */
function withTagListConsumer(Component) {
  function WithTagListConsumer(props) {
    return (
      <TagListConsumer>
        { value => <Component {...props} __tagList={value} />}
      </TagListConsumer>
    );
  }

  WithTagListConsumer.displayName = `WithTagListConsumer(${Component.displayName})`;

  return WithTagListConsumer;
}

export {
  TagListContextPropTypes,
  TagListContextDefaultProps,
  TagListProvider,
  TagListConsumer,
  withTagListConsumer,
};
