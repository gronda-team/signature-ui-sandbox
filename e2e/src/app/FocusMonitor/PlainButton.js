import * as React from 'react';
import { useFocusMonitor } from '../../../../src/cdk/A11y';

const PlainButton = React.forwardRef(function PlainButton(props, ref) {
  return <button ref={ref} {...props}>Focus me!</button>;
});

function PlainButtonSuite({ spy, ...restProps }) {
  const [focusOrigin, setFocusOrigin] = React.useState(null);

  const focusMonitor = useFocusMonitor();

  /** @type {React.MutableRefObject<?HTMLButtonElement>} */
  const button = React.useRef(null);

  const setFocusOriginCallback = React.useCallback((event) => {
    setFocusOrigin(event);
    if (typeof spy === 'function') {
      spy(event);
    }
  }, [setFocusOrigin, spy]);

  React.useLayoutEffect(() => {
    if (button.current) {
      focusMonitor.monitor({
        element: button.current,
        checkChildren: true,
        callback: setFocusOriginCallback,
      })
    }

    return () => {
      if (button.current) {
        focusMonitor.stopMonitoring(button.current);
      }
    }
  }, [button.current, setFocusOriginCallback]);

  return <PlainButton ref={button} data-cdk-focus={focusOrigin} {...restProps} />
}

export default PlainButtonSuite;
