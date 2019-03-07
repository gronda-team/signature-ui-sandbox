import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { availableExtensions } from './extensions/available-extensions';
import { ExtensionsProvider } from './context/ExtensionsContext';

const DEFAULT_EXTENSION_BUS = { attributes: {}, data: {} };

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
      const extensionAttributes = _.get(this.state, [extension.name, 'attributes'], {});
      return { ...attributes, ...extensionAttributes };
    }, {}),
    setExtensions: this.setExtensions,
    setControl: this.setControl,
  });

  /**
   * Actions
   */
  /** Update the extension data key */
  updateExtensionData = (...args) => {
    const [key, second, last, ...rest] = args;

    /**
     * The callback function at the end of setState is an optional argument,
     * and we treat it as the third argument here.
     *
     * Here we create an array of arguments (that can be applied using function.apply)
     * for setState.
     *
     * The first ENTRY in the array is the setState callback (this.setState(() => {})).
     *
     * Here we see which extension we're targeting by using the first ARGUMENT `key`,
     * which should be a string.
     *
     * The second ARGUMENT can either be a plain object ({ isShown: false }) and is
     * consequently spread as a normal setState argument, OR it can be a callback function
     * that somewhat acts like this.setState(() => {}).
     */
    const setStateArgs = [
      (state) => {
        let data = _.get(state, [key, 'data'], {});
        if (_.isPlainObject(second)) {
          data = { ...data, ...second };
        } else if (_.isFunction(second)) {
          data = { ...data, ...second(data) };
        }

        return {
          [key]: {
            ...(state[key] || DEFAULT_EXTENSION_BUS),
            data,
          },
        };
      },
    ];

    if (_.isFunction(last)) {
      setStateArgs.concat(last);
    }

    this.setState.apply(this, setStateArgs);
  };

  /** Update the extension attributes key */
  updateExtensionAttributes = (...args) => {
    const [key, second, last, ...rest] = args;
    /** See how updateExtensionData works for an explanation */
    const setStateArgs = [
      (state) => {
        let attributes = _.get(state, [key, 'attributes'], {});
        if (_.isPlainObject(second)) {
          attributes = { ...attributes, ...second };
        } else if (_.isFunction(second)) {
          attributes = { ...attributes, ...second(attributes) };
        }

        return {
          [key]: {
            ...(state[key] || DEFAULT_EXTENSION_BUS),
            attributes,
          },
        };
      },
    ];

    if (_.isFunction(last)) {
      setStateArgs.concat(last);
    }

    this.setState.apply(this, setStateArgs);
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

  /** Set the available extensions and provide the default state for each extension */
  setExtensions = (extensions) => {
    this.setState({
      extensions,
      ...extensions.reduce((defaultState, extension) => {
        defaultState[extension] = { ...DEFAULT_EXTENSION_BUS };
        return defaultState;
      }, {}),
    })
  };

  render() {
    return (
      <React.Fragment>
        { availableExtensions.map((extension) => {
          // If the current extension does not support our current control type, return null
          if (extension.type.indexOf(this.props.controlType) === -1) return null;
          if (this.state.extensions.indexOf(extension.name) === -1) return null;
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
