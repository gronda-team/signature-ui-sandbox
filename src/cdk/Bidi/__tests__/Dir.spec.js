import * as React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, cleanup } from '@testing-library/react';
import { useDir, Directionality } from '../exports';
import { Platform } from '../../Platform';

function renderWithPlatform(app) {
  return render(app, { wrapper: Platform });
}

describe('Directionality', function () {
  describe('standalone', function () {
    let previousHtmlDir;
    let previousBodyDir;

    beforeEach(function () {
      previousHtmlDir = document.documentElement.dir;
      previousBodyDir = document.body.dir;
    });

    afterEach(function () {
      cleanup();
      document.documentElement.dir = previousHtmlDir;
      document.body.dir = previousBodyDir;
    });

    it('should read dir from the HTML element if not specified on the body', function () {
      document.documentElement.dir = 'rtl';

      renderWithPlatform(<ComponentWithDir />);

      expect(window.__bidi__.dir).toBe('rtl');
    });

    it('should read dir from the body first before reading from HTML element', function () {
      document.documentElement.dir = 'ltr';
      document.body.dir = 'rtl';

      renderWithPlatform(<ComponentWithDir />);

      expect(window.__bidi__.dir).toBe('rtl');
    });

    it('should default to ltr ' +
      'if nothing is specified on either body or HTML element', function () {
      renderWithPlatform(<ComponentWithDir />);

      expect(window.__bidi__.dir).toBe('ltr');
    });

    it('should default to ltr if an invalid direction is set on the body', function () {
      document.body.dir = 'not-valid';

      renderWithPlatform(<ComponentWithDir />);

      expect(window.__bidi__.dir).toBe('ltr');
    });
  });

  describe('with parent context', function () {
    afterEach(function () {
      cleanup();
    });

    it('should provide a directionality from the parent context', function () {
      renderWithPlatform(<ElementWithDir />);

      expect(window.__bidi__.dir).toBe('rtl');
    });

    it('should dynamically change the directionality when context changes', function () {
      const rendered = renderWithPlatform(<ElementWithDir />);

      expect(window.__bidi__.dir).toBe('rtl');

      rendered.rerender(<ElementWithDir dir="ltr" />);

      expect(window.__bidi__.dir).toBe('ltr');
    });

    it('should default to `ltr` when an invalid value is passed in', function () {
      renderWithPlatform(<ElementWithDir dir="invalid" />);

      expect(window.__bidi__.dir).toBe('ltr');
    });

    it('should preserve the `dir` property on affected components while ' +
      'normalizing the context value', function () {
      const rendered = renderWithPlatform(<ElementWithDir dir="auto" />);

      const testDiv = rendered.queryByTestId('dir-attr');

      expect(testDiv.dir).toBe('auto');
      expect(window.__bidi__.dir).toBe('ltr');
    });

    it('should cast the dir attribute to lowercase', function () {
      renderWithPlatform(<ElementWithDir dir="RTL" />);

      expect(window.__bidi__.dir).toBe('rtl');
    });
  });
});

function ComponentWithDir() {
  const dir = useDir();

  React.useEffect(() => {
    window.__bidi__ = { dir };
  }, [dir]);

  return <div>Testing dir</div>;
}

function ElementWithDir({ dir = 'rtl' }) {
  return (
    <Directionality dir={dir}>
      <div dir={dir} data-testid="dir-attr">
        <ComponentWithDir />
      </div>
    </Directionality>
  );
}
