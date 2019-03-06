import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { availableExtensions } from './extensions/available-extensions';

class Extensions extends React.Component {
  constructor() {
    super();

    /**
     * This state is a map between the extension name and the associated data and attribute
     * objects. So it would look like
     * datePicker: {
     *   // This is the communicable data between the extension and the
     *   // control (input, select, etc.)
     *   data: {...},
     *   // This is what the consuming component should use as attributes.
     *   attributes: {...},
     * },
     */
    this.state = {
    };
  }

  /**
   * Derived data
   */
  providerValue = () => ({
    updateExtensionData: this.updateExtensionData,
    updateExtensionAttributes: this.updateExtensionAttributes,
    /** Reduce the extended attributes and spread it into the input element */
    extendedAttributes: availableExtensions.reduce((attributes, extension) => {
      if (!_.has(this.state, extension)) return attributes;
      const extensionAttributes = _.get(this.state, [extension, 'attributes'], {});
      return { ...attributes, ...extensionAttributes };
    }, {}),
  });

  /**
   * Actions
   */
  /** Update the extension data key */
  updateExtensionData = (key, value) => {
    this.setState(state => ({
      [key]: {
        ...(state[key] || { attributes: {}, data: {} }),
        data: {
          ...state[key].data,
          ...value,
        },
      },
    }));
  };

  /** Update the extension attributes key */
  updateExtensionAttributes = (key, value) => {
    this.setState(state => ({
      [key]: {
        ...(state[key] || { attributes: {}, data: {} }),
        attributes: {
          ...state[key].attributes,
          ...value,
        },
      },
    }));
  };

  render() {
    return (
      <ExtensionsProvider value={this.providerValue()}>
        { this.props.children }
      </ExtensionsProvider>
    )
  }
}

export default Extensions;
