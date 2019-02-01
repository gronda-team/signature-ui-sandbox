import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { FormFieldHint } from './styles';
import { withFormFieldConsumer } from './context/FormFieldUIMachine';

class Hint extends React.Component {
  constructor() {
    super();
    /*
    Opt to use a class because uniqueId would be called
    each time in a function instantiation, which would
    change the attr.id property of hint, thus
    invalidating the aria-describedby ids for the form
    field.
     */
    this.defaultId = _.uniqueId('sui-hint:');
  }
  
  /*
  Lifecycle methods
   */
  componentDidMount() {
    /*
    add describedById to bank
    
    Opt for this way rather than some complicated querySelector in the
    FormField component in order to set the IDs based on the Hint's
    lifecycle without worrying about any rendering race conditions
    that arise from child components.
     */
    this.props.__formFieldControl.changeDescribedByIds({ added: this.getId() });
  }
  
  componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id) {
      // swap describedByIds
      this.props.__formFieldControl.changeDescribedByIds({
        added: this.getId(),
        removed: this.getId(prevProps),
      });
    }
  }
  
  componentWillUnmount() {
    // remove describedById from bank
    this.props.__formFieldControl.changeDescribedByIds({ removed: this.getId() });
  }
  
  getId = (props = this.props) => props.id || this.defaultId;
  
  render() {
    return <FormFieldHint id={this.getId()} align={this.props.align}>{ this.props.children }</FormFieldHint>;
  }
}

Hint.propTypes = {
  align: FormFieldHint.propTypes.align,
  id: PropTypes.string,
  __formFieldControl: PropTypes.shape({
    changeDescribedByIds: PropTypes.func,
  }),
};

Hint.defaultProps = {
  '__sui-internal-type': 'Hint',
  align: FormFieldHint.defaultProps.align,
  id: null,
  // from context
  __formFieldControl: {
    changeDescribedByIds: _.noop,
  },
};

const ConsumerHint = withFormFieldConsumer(Hint);
ConsumerHint.propTypes = Hint.propTypes;
ConsumerHint.defaultProps = Hint.defaultProps;

export default ConsumerHint;
