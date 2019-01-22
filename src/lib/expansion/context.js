import * as React from 'react';
import _ from 'lodash';

const { Provider: AccordionProvider, Consumer: AccordionConsumer } = React.createContext({
  hideToggle: false,
  displayMode: 'default',
});

// This corresponds to 'Accordion.Consumer' and 'Accordion.Provider'
AccordionConsumer.displayName = 'Accordion';

export function withAccordionConsumer(Component) {
  function WithAccordionConsumer(props) {
    return (
      <AccordionConsumer>
        { value => <Component {...props} __suiAccordion={value} />}
      </AccordionConsumer>
    )
  }
  
  WithAccordionConsumer.displayName = `WithAccordionConsumer(${Component.displayName})`;
  
  return WithAccordionConsumer;
}

export { AccordionProvider };

const { Provider: AccordionItemProvider, Consumer: AccordionItemConsumer } = React.createContext({
  labelId: null,
});

AccordionItemConsumer.displayName = 'AccordionItem';

export function withAccordionItemConsumer(Component) {
  function WithAccordionItemConsumer(props) {
    return (
      <AccordionItemConsumer>
        { value => <Component {...props} __suiAccordionItem={value} />}
      </AccordionItemConsumer>
    )
  }
  
  WithAccordionItemConsumer.displayName = `WithAccordionItemConsumer(${Component.displayName})`;
  
  return WithAccordionItemConsumer;
}

export { AccordionItemProvider };
