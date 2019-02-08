import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

const TagListContextPropTypes = PropTypes.shape({
  disabled: PropTypes.bool,
  selectable: PropTypes.bool,
  changeDescribedByIds: PropTypes.func,
});

const TagListContextDefaultProps = {
  disabled: false,
  selectable: false,
  changeDescribedByIds: _.noop,
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
