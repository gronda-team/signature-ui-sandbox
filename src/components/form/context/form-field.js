import React from 'react';

const { Provider, Consumer } = React.createContext({
  __handleFocus: () => {},
  __handleRequired: () => {},
});

export const FormFieldProvider = Provider;
export const FormFieldConsumer = Consumer;

export default { FormFieldConsumer, FormFieldProvider };

export const withFormFieldContext = (Component) => (props) => (
  <FormFieldConsumer>
    { payload => (
      <Component {...props} {...payload} />
    )}
  </FormFieldConsumer>
);
