import * as React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { cleanup, fireEvent, waitForDomChange, wait, act, render } from '@testing-library/react';
import OverlayContainer from '../OverlayContainer';
import Overlay from '../Overlay';
import { OverlayActionContext, OverlayStateContext, OverlayActions } from '../context';

// Callback to attach the first overlay
const attachOverlay = (windowKey) => {
  window[windowKey].dispatch({
    type: OverlayActions.SET_ATTACHED_STATE, data: true,
  });
};

// Callback to detach the first overlay
const detachOverlay = (windowKey) => {
  window[windowKey].dispatch({
    type: OverlayActions.SET_ATTACHED_STATE, data: false,
  });
};

const attach = attachOverlay.bind(null, '__overlay__');
const detach = detachOverlay.bind(null, '__overlay__');

const attachAlt = attachOverlay.bind(null, '__overlayAlt__');
const detachAlt = detachOverlay.bind(null, '__overlayAlt__');

describe('Overlay', function () {
  describe('basic behavior', function () {
    let rendered;
    let overlayContainer;

    beforeEach(function () {
      rendered = render(
        <Overlay>
          <TestComponent />
        </Overlay>,
        { wrapper: OverlayContainer }
      );

      overlayContainer = document.querySelector('div[data-sui-overlay-root]');
    });

    afterEach(function () {
      cleanup();
      jest.clearAllMocks();
    });

    it('should not append any overlays when there are none active', function () {
      expect(overlayContainer).toBeTruthy();
      expect(overlayContainer.children).toHaveLength(0);
    });

    it('should load a component into an overlay', function () {
      act(attach);

      expect(overlayContainer).toHaveTextContent('Hello world');

      act(detach);

      expect(overlayContainer.children).toHaveLength(0);
      expect(overlayContainer).toHaveTextContent('');
    });

    it('should disable pointer events of the pane element if detached', function () {
      const pane = window.__overlay__.state.pane;

      act(attach);

      expect(overlayContainer.children).not.toHaveLength(0);
      expect(pane.style.pointerEvents).toBe('auto');

      act(detach);
      expect(overlayContainer.children).toHaveLength(0);
      expect(pane.style.pointerEvents).toBe('none');
    });
  });

  describe('multiple overlays', function () {
    let multiRendered;
    let multiOverlayContainer;
    beforeEach(function () {
      multiRendered = render(
        <OverlayContainer>
          <Overlay>
            <TestComponent />
          </Overlay>
          <Overlay>
            <TestAltComponent />
          </Overlay>
        </OverlayContainer>
      );

      multiOverlayContainer = document.querySelector('div[data-sui-overlay-root]');
    });

    afterEach(function () {
      cleanup();
      jest.clearAllMocks();
    });

    it('should open multiple overlays', function () {
      act(attach);
      act(attachAlt);

      expect(multiOverlayContainer.childNodes).toHaveLength(2);
      expect(multiOverlayContainer).toHaveTextContent('Hello world');
      expect(multiOverlayContainer).toHaveTextContent('Second overlay');

      act(detach);

      expect(multiOverlayContainer.childNodes).toHaveLength(1);
      expect(multiOverlayContainer).not.toHaveTextContent('Hello world');
      expect(multiOverlayContainer).toHaveTextContent('Second overlay');

      act(detachAlt);

      expect(multiOverlayContainer.childNodes).toHaveLength(0);
      expect(multiOverlayContainer).toHaveTextContent('');
    });

    it('should ensure that the most recently opened overlay is on top', function () {
      act(attach);
      act(attachAlt);

      expect(window.__overlay__.state.host.parentNode.nextSibling).toBeTruthy();
      expect(window.__overlayAlt__.state.host.parentNode.nextSibling).toBeFalsy();

      // Detach the first overlay and then reattach it, so that it should be on top.
      act(detach);
      act(attach);

      // The second overlay is now underneath, so it should have nextSibling as truthy
      expect(window.__overlayAlt__.state.host.parentNode.nextSibling).toBeTruthy();
      expect(window.__overlay__.state.host.parentNode.nextSibling).toBeFalsy();
    });
  });

  describe('rtl', function () {
    let rendered;

    beforeEach(function () {
      rendered = render(
        <Overlay>
          <TestComponent />
        </Overlay>,
        { wrapper: OverlayContainer },
      );
    });

    afterEach(function () {
      cleanup();
      jest.clearAllMocks();
    });

    it('should have the default directionality to explicitly be ltr', function () {
      act(attach);
      expect(window.__overlay__.state.host).toHaveAttribute('dir', 'ltr');
    });

    it('should replace invalid directionality values with ltr', function () {
      // Prevent console.error from actually being called when the directionality is set
      // to an invalid value.
      jest.spyOn(window.console, 'error')
        .mockImplementation(() => {});

      rendered.rerender(
        <Overlay dir="invalid"><TestComponent /></Overlay>
      );
      act(attach);

      jest.restoreAllMocks();

      expect(window.__overlay__.state.host).toHaveAttribute('dir', 'ltr');
    });

    it('should bind the directionality to the host element', function () {
      rendered.rerender(
        <Overlay dir="rtl"><TestComponent /></Overlay>,
      );

      act(attach);

      expect(window.__overlay__.state.host).toHaveAttribute('dir', 'rtl');
    });
  });

  describe('onAttach, onDetached', function () {
    let rendered;
    const attachedSpy = jest.fn();
    const detachedSpy = jest.fn();

    beforeEach(function () {
      rendered = render(
        <Overlay onAttached={attachedSpy} onDetached={detachedSpy}>
          <TestComponent />
        </Overlay>,
        { wrapper: OverlayContainer },
      );
    });

    afterEach(function () {
      cleanup();
      jest.clearAllMocks();
    });

    it('should call the onAttached callback when the overlay is attached', function () {
      act(attach);

      expect(attachedSpy).toHaveBeenCalled();
    });

    it('should call the onDetached callback when the overlay is detached', function () {
      act(attach);
      act(detach);

      expect(detachedSpy).toHaveBeenCalled();
    });

    it('should not call the onDetached callback when the overlay was not attached', function () {
      act(detach);

      expect(detachedSpy).not.toHaveBeenCalled();
    });
  });

  describe('with keyboard dispatcher', function () {
    const firstSpy = jest.fn();

    afterEach(function () {
      cleanup();
      jest.clearAllMocks();
    });

    it('should stop emitting events to detached overlays', function () {
      render(
        <OverlayContainer>
          <Overlay onKeyDown={firstSpy}>
            <TestComponent />
          </Overlay>
        </OverlayContainer>,
      );

      act(attach);

      fireEvent.keyDown(document.body, { key: 'Escape' });

      expect(firstSpy).toHaveBeenCalledTimes(1);

      act(detach);

      fireEvent.keyDown(document.body, { key: 'Escape' });

      expect(firstSpy).toHaveBeenCalledTimes(1);
    });

    it('should dispose of the global event keyboard event handlers correctly', function () {
      const addEventListenerSpy = jest.spyOn(document.body, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(document.body, 'removeEventListener');

      render(
        <OverlayContainer>
          <Overlay onKeyDown={firstSpy}>
            <TestComponent />
          </Overlay>
        </OverlayContainer>,
      );

      act(attach);

      expect(addEventListenerSpy).toHaveBeenCalledTimes(1);

      act(detach);

      expect(removeEventListenerSpy).toHaveBeenCalledTimes(1);
    });

    it('should skip overlays that do not have an onKeyDown callback', function () {
      const secondSpy = jest.fn();
      render(
        <OverlayContainer>
          <Overlay>
            <TestComponent />
          </Overlay>
          <Overlay onKeyDown={secondSpy}>
            <TestAltComponent />
          </Overlay>
        </OverlayContainer>,
      );

      fireEvent.keyDown(document.body, { key: 'Escape' });

      expect(secondSpy).toHaveBeenCalled();
    });
  });

  describe('backdrop', function () {
    let rendered;
    let overlayContainer;
    let getBackdrop;
    const BACKDROP_SELECTOR = '[data-sui-tree="overlay:backdrop"]';
    const spy = jest.fn();
    beforeEach(function () {
      rendered = render(
        <Overlay backdropShade="transparent" onBackdropClick={spy}>
          <TestComponent />
        </Overlay>,
        { wrapper: OverlayContainer },
      );

      overlayContainer = document.querySelector('div[data-sui-overlay-root]');
      getBackdrop = () => overlayContainer.querySelector(BACKDROP_SELECTOR);
    });

    afterEach(function () {
      cleanup();
      jest.clearAllMocks();
    });

    it('should render a backdrop', async function () {
      const attachedSpy = jest.fn(() => {
        act(() => {
          window.__overlay__.dispatch({
            type: OverlayActions.SET_BACKDROP_ATTRIBUTES,
            data: { 'data-testid': 'overlay--active' },
          });
        });
      });

      rendered.rerender(
        <Overlay backdropShade="transparent" onBackdropClick={spy} onAttached={attachedSpy}>
          <TestComponent />
        </Overlay>,
      );

      act(attach);

      const backdrop = getBackdrop();

      expect(backdrop).toHaveAttribute('data-showing', 'false');

      await waitForDomChange({
        container: backdrop,
        mutationObserverOptions: { attributes: true },
      });

      expect(backdrop).toHaveAttribute('data-showing', 'true');

      fireEvent.click(backdrop);

      expect(spy).toHaveBeenCalled();
    });

    it('should not render a backdrop by default', function () {
      rendered.rerender(
        <Overlay onBackdropClick={spy}>
          <TestComponent />
        </Overlay>,
      );

      act(attach);
      const backdrop = getBackdrop();

      expect(backdrop).toBeFalsy();
    });

    it('should dispatch custom attributes to the backdrop', async function () {
      act(attach);
      act(() => {
        window.__overlay__.dispatch({
          type: OverlayActions.SET_BACKDROP_ATTRIBUTES,
          data: { 'data-autocomplete-is-above': true },
        });
      });

      const backdrop = getBackdrop();

      await waitForDomChange({
        container: backdrop,
        mutationObserverOptions: { attributes: true },
      });

      expect(overlayContainer.querySelector('[data-autocomplete-is-above="true"]')).toBeTruthy();
    });

    it('should disable the pointer events of a backdrop that is being removed', async function () {
      act(attach);

      const backdrop = getBackdrop();

      await waitForDomChange({
        container: backdrop,
        mutationObserverOptions: { attributes: true },
      });

      expect(backdrop.style.pointerEvents).toBeFalsy();

      act(detach);

      expect(backdrop.style.pointerEvents).toBe('none');
    });

    it('should insert the backdrop before the host in the DOM order', async function () {
      act(attach);

      const backdrop = getBackdrop();
      const host = window.__overlay__.state.host;

      await waitForDomChange({
        container: backdrop,
        mutationObserverOptions: { attributes: true },
      });

      expect(backdrop.nextSibling).toBe(host);
      expect(host.nextSibling).not.toBe(backdrop);
    });
  });

  describe('position strategy', function () {
    const attachedSpy = jest.fn();
    const detachedSpy = jest.fn();
    const applySpy = jest.fn();

    // Need to deduplicate by using the id because otherwise the memo would be cached
    // by React.
    const useFakePositionStrategyFactory = (id = 1) => (state, dispatch) => {
      const attach = React.useCallback(() => {
        attachedSpy();
        dispatch({
          type: OverlayActions.SET_HOST_ATTRIBUTES,
          data: { 'data-using-fake-position': true },
        });
      }, []);

      const detach = React.useCallback(detachedSpy, []);

      const apply = React.useCallback(applySpy, []);

      return React.useMemo(() => ({
        id,
        attach,
        detach,
        apply,
      }), [id]);
    };

    // Duplicate
    const useFakePositionStrategy = useFakePositionStrategyFactory(1);
    const useFakePositionStrategy2 = useFakePositionStrategyFactory(2);

    let rendered;
    let overlayContainer;

    beforeEach(function () {
      rendered = render(
        <Overlay usePositionStrategy={useFakePositionStrategy}><TestComponent /></Overlay>,
        { wrapper: OverlayContainer },
      );

      overlayContainer = document.querySelector('[data-sui-overlay-root]');
    });

    afterEach(function () {
      cleanup();
      jest.clearAllMocks();
    });

    it('should apply a position strategy', function () {
      act(attach);
      expect(overlayContainer.querySelector('[data-using-fake-position="true"]')).toBeTruthy();
      expect(attachedSpy).toHaveBeenCalled();
    });

    it('should be able to swap position strategies', async function () {
      act(attach);
      await wait();
      expect(attachedSpy).toHaveBeenCalledTimes(1);
      expect(applySpy).toHaveBeenCalledTimes(1);
      expect(detachedSpy).toHaveBeenCalledTimes(0);

      rendered.rerender(
        <Overlay usePositionStrategy={useFakePositionStrategy2}><TestComponent /></Overlay>,
      );

      await wait();
      expect(attachedSpy).toHaveBeenCalledTimes(2);
      expect(applySpy).toHaveBeenCalledTimes(2);
      expect(detachedSpy).toHaveBeenCalledTimes(1);
    });

    it('should not be able to swap position strategies with itself', async function () {
      act(attach);
      await wait();
      expect(attachedSpy).toHaveBeenCalledTimes(1);
      expect(applySpy).toHaveBeenCalledTimes(1);
      expect(detachedSpy).toHaveBeenCalledTimes(0);

      rendered.rerender(
        <Overlay usePositionStrategy={useFakePositionStrategy}><TestComponent /></Overlay>,
      );

      await wait();
      expect(attachedSpy).toHaveBeenCalledTimes(1);
      expect(applySpy).toHaveBeenCalledTimes(1);
      expect(detachedSpy).toHaveBeenCalledTimes(0);
    });
  });

  describe('size', function () {
    const customRender = app => render(
      app,
      { wrapper: OverlayContainer },
    );

    const getPane = () => document.querySelector('[data-sui-tree="overlay:pane"]');

    afterEach(function () {
      cleanup();
      jest.clearAllMocks();
    });

    it('should apply the width prop as a pane style', function () {
      customRender(<Overlay width={500}><TestComponent /></Overlay>);
      act(attach);
      expect(getPane().style.width).toBe('500px');
    });

    it('should support using string measurements for the width', function () {
      customRender(<Overlay width="200%"><TestComponent /></Overlay>);
      act(attach);
      expect(getPane().style.width).toBe('200%');
    });

    it('should apply the height prop as a pane style', function () {
      customRender(<Overlay height={500}><TestComponent /></Overlay>);
      act(attach);
      expect(getPane().style.height).toBe('500px');
    });

    it('should support using string measurements for the height', function () {
      customRender(<Overlay height="100vh"><TestComponent /></Overlay>);
      act(attach);
      expect(getPane().style.height).toBe('100vh');
    });

    it('should apply the min width prop as a pane style', function () {
      customRender(<Overlay minWidth={200}><TestComponent /></Overlay>);
      act(attach);
      expect(getPane().style.minWidth).toBe('200px');
    });

    it('should apply the min height prop as a pane style', function () {
      customRender(<Overlay minHeight={500}><TestComponent /></Overlay>);
      act(attach);
      expect(getPane().style.minHeight).toBe('500px');
    });

    it('should apply the max width prop as a pane style', function () {
      customRender(<Overlay maxWidth={200}><TestComponent /></Overlay>);
      act(attach);
      expect(getPane().style.maxWidth).toBe('200px');
    });

    it('should apply the max height prop as a pane style', function () {
      customRender(<Overlay maxHeight={500}><TestComponent /></Overlay>);
      act(attach);
      expect(getPane().style.maxHeight).toBe('500px');
    });

    it('should support zero widths and heights', function () {
      customRender(<Overlay width={0} height={0}><TestComponent /></Overlay>);
      act(attach);
      const pane = getPane();
      expect(pane.style.height).toBe('0px');
      expect(pane.style.width).toBe('0px');
    });

    it('should be able to reset the various size properties', function () {
      const rendered = customRender(
        <Overlay
          width={200}
          height={200}
          minWidth={100}
          minHeight={100}
          maxWidth={300}
          maxHeight={300}
        ><TestComponent /></Overlay>
      );
      act(attach);
      let pane = getPane();
      expect(pane.style.width).toBe('200px');
      expect(pane.style.height).toBe('200px');
      expect(pane.style.minWidth).toBe('100px');
      expect(pane.style.minHeight).toBe('100px');
      expect(pane.style.maxWidth).toBe('300px');
      expect(pane.style.maxHeight).toBe('300px');

      rendered.rerender(
        <Overlay
          width={''}
          height={''}
          minWidth={''}
          minHeight={''}
          maxWidth={''}
          maxHeight={''}
        ><TestComponent /></Overlay>
      );
      pane = getPane();
      expect(pane.style.width).toBeFalsy();
      expect(pane.style.height).toBeFalsy();
      expect(pane.style.minWidth).toBeFalsy();
      expect(pane.style.minHeight).toBeFalsy();
      expect(pane.style.maxWidth).toBeFalsy();
      expect(pane.style.maxHeight).toBeFalsy();
    });
  });
});

function TestComponent() {
  const dispatch = React.useContext(OverlayActionContext);
  const state = React.useContext(OverlayStateContext);

  React.useEffect(() => {
    // Attach the callbacks to the window for testing. The actual implementation would have the
    // parent components (like this one) dispatching attach/detach/etc. events depending on
    // the component's spec. They're attached to the window here to simulate that behavior without
    // having to build a library component.
    window.__overlay__ = {
      state, dispatch,
    };
  }, [state]);


  return <div>Hello world</div>;
}

function TestAltComponent() {
  const dispatch = React.useContext(OverlayActionContext);
  const state = React.useContext(OverlayStateContext);

  React.useEffect(() => {
    window.__overlayAlt__ = {
      state, dispatch,
    };
  }, [state]);


  return <div>Second overlay</div>;
}
