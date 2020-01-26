import * as React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, cleanup, act } from '@testing-library/react';
import Overlay from '../Overlay';
import { OverlayActionContext, OverlayActions, OverlayStateContext } from '../context';
import useGlobalPositionStrategy from './useGlobalPositionStrategy';
import OverlayContainer from '../OverlayContainer';

const attach = () => {
  window.__overlay__.dispatch({
    type: OverlayActions.SET_ATTACHED_STATE,
    data: true,
  });
};

const detach = () => {
  window.__overlay__.dispatch({
    type: OverlayActions.SET_ATTACHED_STATE,
    data: false,
  });
};

describe('Global position strategy', function () {
  let overlayContainer;
  let getPane;
  function attachOverlay(configProps = {}, props = {}) {
    render(
      <Overlay
        usePositionStrategy={useGlobalPositionStrategy}
        positionStrategyConfig={configProps}
        {...props}
      >
        <TestComponent />
      </Overlay>,
      { wrapper: OverlayContainer },
    );

    overlayContainer = document.querySelector('[data-sui-overlay-root]');
    getPane = () => overlayContainer.querySelector('[data-sui-tree="overlay:pane"]');

    act(attach);
  }

  afterEach(function () {
    cleanup();
    jest.clearAllMocks();
  });

  it('should position the pane element to the top, left with an offset', function () {
    attachOverlay({
      top: '10px',
      left: '40px',
    });

    const pane = getPane();
    const paneStyle = pane.style;
    const parentStyle = pane.parentNode.style;

    expect(paneStyle.marginTop).toBe('10px');
    expect(paneStyle.marginLeft).toBe('40px');
    expect(paneStyle.marginBottom).toBe('');
    expect(paneStyle.marginRight).toBe('');

    expect(parentStyle.justifyContent).toBe('flex-start');
    expect(parentStyle.alignItems).toBe('flex-start');
  });

  it('should position the pane element to the bottom, right with an offset', function () {
    attachOverlay({
      bottom: '70px',
      right: '15em',
    });

    const pane = getPane();
    const paneStyle = pane.style;
    const parentStyle = pane.parentNode.style;

    expect(paneStyle.marginTop).toBe('');
    expect(paneStyle.marginLeft).toBe('');
    expect(paneStyle.marginBottom).toBe('70px');
    expect(paneStyle.marginRight).toBe('15em');

    expect(parentStyle.justifyContent).toBe('flex-end');
    expect(parentStyle.alignItems).toBe('flex-end');
  });

  it('should center the pane element', function () {
    attachOverlay({
      centerHorizontally: true,
      centerVertically: true,
    });

    const parent = getPane().parentNode;
    const parentStyle = parent.style;

    expect(parentStyle.justifyContent).toBe('center');
    expect(parentStyle.alignItems).toBe('center');
  });

  it('should center the pane element with an offset', function () {
    attachOverlay({
      centerHorizontally: '10px',
      centerVertically: '15px',
    });

    const pane = getPane();
    const paneStyle = pane.style;
    const parentStyle = pane.parentNode.style;

    expect(paneStyle.marginTop).toBe('15px');
    expect(paneStyle.marginLeft).toBe('10px');

    expect(parentStyle.justifyContent).toBe('center');
    expect(parentStyle.alignItems).toBe('center');
  });

  it('should make the pane element position: static', function () {
    attachOverlay();

    const pane = getPane();
    expect(pane.style.position).toBe('static');
  });

  it('should add a data- attribute to the host', function () {
    attachOverlay();

    const parent = getPane().parentNode;
    expect(parent.dataset.overlayPositionStrategy).toBe('global');
  });

  it('should remove the parent from the DOM', function () {
    attachOverlay();

    const parent = getPane().parentNode;

    expect(document.body.contains(parent)).toBe(true);

    act(detach);

    expect(document.body.contains(parent)).toBe(false);
  });

  it('should reset the horizontal position and offset when the width is 100%', function () {
    attachOverlay({
      centerHorizontally: true,
    }, {
      width: '100%',
    });

    const pane = getPane();
    const paneStyle = pane.style;
    const parentStyle = pane.parentNode.style;

    expect(paneStyle.marginLeft).toBe('0px');
    expect(parentStyle.justifyContent).toBe('flex-start');
  });

  it('should reset the vertical position and offset when the height is 100%', function () {
    attachOverlay({
      centerVertically: true,
    }, {
      height: '100%',
    });

    const pane = getPane();
    const paneStyle = pane.style;
    const parentStyle = pane.parentNode.style;

    expect(paneStyle.marginTop).toBe('0px');
    expect(parentStyle.alignItems).toBe('flex-start');
  });

  it('should take its height and width from the overlay props', function () {
    attachOverlay({}, { width: '500px', height: '300px' });

    const pane = getPane();
    const paneStyle = pane.style;

    expect(paneStyle.width).toBe('500px');
    expect(paneStyle.height).toBe('300px');
  });

  it('should center the element in RTL', function () {
    attachOverlay(
      { centerVertically: true, centerHorizontally: true },
      { dir: 'rtl' }
    );

    const parentStyle = getPane().parentNode.style;

    expect(parentStyle.justifyContent).toBe('center');
    expect(parentStyle.alignItems).toBe('center');
  });

  it('should invert `justify-content` when using `left` in RTL', function () {
    attachOverlay(
      { left: 0 },
      { dir: 'rtl' }
    );

    const parentStyle = getPane().parentNode.style;

    expect(parentStyle.justifyContent).toBe('flex-end');
  });

  it('should invert `justify-content` when using `right` in RTL', function () {
    attachOverlay(
      { right: 0 },
      { dir: 'rtl' }
    );

    const parentStyle = getPane().parentNode.style;

    expect(parentStyle.justifyContent).toBe('flex-start');
  });

  it('should clean up after itself when it has been detached', async function () {
    attachOverlay({
      top: '10px', left: '40px',
    });

    const pane = getPane();

    act(detach);
    expect(pane).not.toBeInTheDocument();
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

  return <div>Hello, world</div>;
}
