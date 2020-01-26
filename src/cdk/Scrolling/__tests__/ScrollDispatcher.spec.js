import * as React from 'react';
import noop from 'lodash/noop';
import '@testing-library/jest-dom/extend-expect';
import { fireEvent, cleanup, act, wait, render } from '@testing-library/react';
import { ScrollDispatcher, useScrollDispatcher } from '../exports';
import { Platform } from '../../Platform';
import useScrollable from '../useScrollable';

describe('ScrollDispatcher', function () {
  describe('basic behavior', function () {
    let rendered;
    let remove = noop;
    const scrollSpy = jest.fn();

    beforeEach(function () {
      rendered = render(
        <ScrollDispatcher><TestComponent /></ScrollDispatcher>,
        { wrapper: Platform },
      );
    });

    afterEach(function () {
      rendered.unmount();
      cleanup();
      jest.clearAllMocks();
    });

    it('should bind the listeners lazily', function () {
      const addEventListenerSpy = jest.spyOn(window.document, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(window.document, 'removeEventListener');

      expect(addEventListenerSpy).not.toHaveBeenCalled();

      let remove = noop;

      act(() => {
        remove = window.__sd__.onScroll(scrollSpy, 0);
      });

      expect(addEventListenerSpy).toHaveBeenCalledTimes(1);

      act(() => {
        remove();
      });

      expect(removeEventListenerSpy).toHaveBeenCalledTimes(1);
    });

    it('should notify that a scroll event occurred', async function () {
      const secondScrollSpy = jest.fn();
      let removeSecond = noop;

      act(() => {
        remove = window.__sd__.onScroll(scrollSpy, 0);
        removeSecond = window.__sd__.onScroll(secondScrollSpy, 100);
      });

      fireEvent.scroll(document);

      await wait();

      expect(scrollSpy).toHaveBeenCalled();
      expect(secondScrollSpy).not.toHaveBeenCalled();

      // Resolve after 100 ms
      await new Promise(resolve => window.setTimeout(resolve, 100));

      expect(scrollSpy).toHaveBeenCalledTimes(1);
      expect(secondScrollSpy).toHaveBeenCalled();
    });

    it('should be able to unsubscribe from the scroll listener', function () {
      act(() => {
        remove = window.__sd__.onScroll(scrollSpy, 0);
      });

      fireEvent.scroll(document);
      expect(scrollSpy).toHaveBeenCalledTimes(1);

      act(() => {
        remove();
      });

      fireEvent.scroll(document);
      expect(scrollSpy).toHaveBeenCalledTimes(1);
    });

    it('should not pass any arguments when window scrolling on callback', function () {
      act(() => {
        remove = window.__sd__.onScroll(scrollSpy, 0);
      });

      fireEvent.scroll(document);
      expect(scrollSpy).toHaveBeenCalledTimes(1);
      const scrollSpyArgs = scrollSpy.mock.calls[0];
      expect(scrollSpyArgs).toEqual([undefined]);
    });
  });

  describe('Nested scrollables', function () {
    let rendered;
    let target;

    beforeEach(function () {
      rendered = render(
        <ScrollDispatcher><NestedScrollableComponent /></ScrollDispatcher>,
        { wrapper: Platform },
      );

      target = rendered.queryByTestId('target');
    });

    afterEach(function () {
      rendered.unmount();
      cleanup();
      jest.clearAllMocks();
    });

    it('should be able to identify the containing scrollables of an element', function () {
      const scrollContainers = window.__scroll__.getAncestorScrollContainers(target);

      const scrollContainerIds = scrollContainers.map(container => container.id);

      expect(scrollContainerIds).toContain('1');
      expect(scrollContainerIds).toContain('1-a');
    });

    it('should emit when one of the ancestor scrollable containers is scrolled', function () {
      const spy = jest.fn();
      let remove = noop;
      act(() => {
        remove = window.__scroll__.onAncestorScroll(target, spy, 0);
      });

      fireEvent.scroll(rendered.queryByTestId('1'), { bubbles: false });
      expect(spy).toHaveBeenCalledTimes(1);

      fireEvent.scroll(window.document, { bubbles: false });
      expect(spy).toHaveBeenCalledTimes(2);

      act(remove);
    });

    it('should not emit when a non-ancestor is scrolled', function () {
      const spy = jest.fn();
      let remove = noop;
      act(() => {
        remove = window.__scroll__.onAncestorScroll(target, spy, 0);
      });

      fireEvent.scroll(rendered.queryByTestId('2'), { bubbles: false });

      expect(spy).not.toHaveBeenCalled();

      act(remove);
    });
  });
});

function TestComponent() {
  const { onScroll } = useScrollDispatcher();

  React.useEffect(() => {
    window.__sd__ = { onScroll };
  }, [onScroll]);

  React.useEffect(() => {
    return () => {
      delete window.__sd__;
    };
  }, []);

  return (
    <div data-testid="test">Test component</div>
  );
}

function Scrollable({ id, onScroll, ...restProps }) {
  const getCurrentRef = React.useRef(null);

  const scrollable = useScrollable(getCurrentRef.current, onScroll);

  return (
    <div id={id} onScroll={scrollable.onScroll} ref={getCurrentRef} {...restProps} />
  );
}

function NestedScrollableComponent() {
  const scroll = useScrollDispatcher();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    window.__scroll__ = scroll;

    return () => {
      delete window.__scroll__;
    };
  }, []);

  React.useLayoutEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
    }
  }, [isMounted]);

  return (
    <React.Fragment>
      <Scrollable id="1" data-testid="1">
        <Scrollable id="1-a" data-testid="1-a">
          <div id="target" data-testid="target">Target</div>
        </Scrollable>
        <Scrollable id="1-b" data-testid="1-b" />
      </Scrollable>
      <Scrollable id="2" data-testid="2" />
    </React.Fragment>
  );
}
