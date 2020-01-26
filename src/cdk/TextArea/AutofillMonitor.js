import React from 'react';
import { normalizePassiveListenerOptions } from '../Platform';
import { AutofillStart } from './styles';

export const INPUT_IS_AUTOFILLED_PROPERTY = 'data-input-autofilled';
export const INPUT_IS_AUTOFILL_MONITORED_PROPERTY = 'data-input-autofill-monitored';

/**
 * @typedef {Object} MonitoredElementInfo
 * @property {function(): void} unlisten
 * @property {Element} element
 */

/**
 * @type {React.Context<[function(HTMLElement):?MonitoredElementInfo, function(MonitoredElementInfo): void]>}
 */
export const AutofillMonitorContext = React.createContext([() => null, () => {}]);

export function AutofillMonitor({ children }) {
  /**
   * List of currently monitored elements
   * @type {React.MutableRefObject<Map<Element, MonitoredElementInfo>>}
   */
  const monitoredElements = React.useRef(new Map());

  const getInfo = React.useCallback((element) => {
    return monitoredElements.current.get(element);
  }, []);

  const setInfo = React.useCallback((element, callback) => {
    monitoredElements.current.set(element, { element, unlisten: callback });
  }, []);

  const value = React.useMemo(() => [getInfo, setInfo], [getInfo, setInfo]);

  React.useEffect(() => {
    return () => {
      monitoredElements.current.forEach((info, element) => {
        info.unlisten();
        monitoredElements.current.delete(element);
      });
    };
  }, []);

  return (
    <AutofillMonitorContext.Provider value={value}>{ children }</AutofillMonitorContext.Provider>
  );
}

const listenerOptions = normalizePassiveListenerOptions({ passive: true });

export function useAutofillMonitor(element, callback) {
  const [getInfo, setInfo] = React.useContext(AutofillMonitorContext);
  const [isMonitored, setMonitored] = React.useState(false);
  const [isAutofilled, setIsAutofilled] = React.useState(false);

  React.useEffect(() => {
    if (element && typeof callback === 'function') {
      if (!getInfo(element)) {
        /**
         * Animation events fire on initial element render, we check for the presence of the
         * autofill CSS class to make sure this is a real change in state, not just the initial
         * render before we fire off events.
         * @type {function(AnimationEvent): void} event
         */
        const listener = (event) => {
          if (event.animationName === AutofillStart.getName() && !isAutofilled) {
            setIsAutofilled(true);
            callback({ target: event.target, isAutofilled: true });
          } else if (event.animationName === AutofillEnd.getName() && isAutofilled) {
            setIsAutofilled(false);
            callback({ target: event.target, isAutofilled: false });
          }
        };

        // Bind the event listener
        element.addEventListener('animationstart', listener, listenerOptions);
        setMonitored(true);

        const unlisten = () => {
          element.removeEventListener('animationstart', listener, listenerOptions);
          setMonitored(false);
        };

        /** @type {MonitoredElementInfo} */
        const elementInfo = { element, unlisten };
        setInfo(element, elementInfo);
      }
    }

    return () => {
      if (element && typeof callback === 'function') {

      }
    }
  }, [getInfo, setInfo, isAutofilled, element, callback]);

  return {
    [INPUT_IS_AUTOFILL_MONITORED_PROPERTY]: isMonitored,
    [INPUT_IS_AUTOFILLED_PROPERTY]: isAutofilled,
  }
}
