import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

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

  /**
   * Actions
   */
  /** Update the extension data key */
  updateExtensionData = (key, value) => {
    this.setState(state => ({
      [key]: {
        ...state[key],
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
        ...state[key],
        attributes: {
          ...state[key].attributes,
          ...value,
        },
      },
    }));
  };

  render() {
  }
}
