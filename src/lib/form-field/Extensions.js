import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { availableExtensions } from './extensions/available-extensions';
import { ExtensionsProvider } from './context/ExtensionsContext';

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
      control: null,
    };

    /**
     * Where all the refs will be located.
     */
    this.REFS =  {};
  }

  /**
   * Refs
   */
  registerRef = name => (ref) => {
    this.REFS[name] = ref;
  };

  /**
   * Derived data
   */
  providerValue = () => ({
    updateExtensionData: this.updateExtensionData,
    updateExtensionAttributes: this.updateExtensionAttributes,
    extendedOnChange: this.extendedOnChange,
    extendedOnFocus: this.extendedOnFocus,
    extendedOnBlur: this.extendedOnBlur,
    extendedOnKeyDown: this.extendedOnKeyDown,
    /** Reduce the extended attributes and spread it into the input element */
    extendedAttributes: availableExtensions.reduce((attributes, extension) => {
      if (!_.has(this.state, extension.name)) return attributes;
      const extensionAttributes = _.get(this.state, [extension, 'attributes'], {});
      return { ...attributes, ...extensionAttributes };
    }, {}),
    setControl: this.setControl,
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

  /** Consolidate onChange listeners */
  extendedOnChange = consolidateRefListenersVia.bind(this, 'onChange');

  /** Consolidate onFocus listeners */
  extendedOnFocus = consolidateRefListenersVia.bind(this, 'onFocus');

  /** Consolidate onBlur listeners */
  extendedOnBlur = consolidateRefListenersVia.bind(this, 'onBlur');

  /** Consolidate onKeyDown listeners */
  extendedOnKeyDown = consolidateRefListenersVia.bind(this, 'onKeyDown');

  /** Set the control */
  setControl = (control) => {
    this.setState({ control });
  };

  render() {
    return (
      <React.Fragment>
        { availableExtensions.map((extension) => {
          // If the current extension does not support our current control type, return null
          if (extension.type.indexOf(this.props.controlType) === -1) return null;
          if (!extension.component) return null;
          const Component = extension.component;
          const inputProps = _.get(this.state, ['control', 'props'], {});
          return (
            <Component
              {...inputProps}
              input={this.state.control}
              __extensionManager={this.providerValue()}
              ref={this.registerRef(extension.name)}
            />
          )
        })}
        <ExtensionsProvider value={this.providerValue()}>
          { this.props.children }
        </ExtensionsProvider>
      </React.Fragment>
    )
  }
}

export default Extensions;

Extensions.propTypes = {
  controlType: PropTypes.string,
};

Extensions.defaultProps = {
  controlType: null,
};

/**
 * Private methods
 */
/**
 * Consolidate all of the on* functions. This iterates through of the refs that are present
 * on extensions and then invokes the event listener if the ref exists.
 *
 * @param callbackName String callback name (onChange, onFocus, etc.) that will be searched
 * for in every ref and then invoked.
 */
function consolidateRefListenersVia(callbackName) {
  return (event) => {
    availableExtensions.forEach((extension) => {
      const path = [extension.name, callbackName];
      if (!_.has(this.REFS, path)) return;
      _.invoke(this.REFS, path, event);
    });
  }
}
