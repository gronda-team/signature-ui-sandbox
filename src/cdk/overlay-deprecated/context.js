import * as React from 'react';

const { Provider: OverlayProvider, Consumer: OverlayConsumer } = React.createContext({
  root: null, // overlay root
});
