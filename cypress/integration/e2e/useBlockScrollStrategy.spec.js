import { OverlayActions } from '../../../src/cdk/Overlay';

describe('useBlockScrollStrategy', function () {
  before(function () {
    cy.visit('/scroll-strategy/block');
  });

  function attachOverlay() {
    cy.window()
      .its('__overlay__')
      .invoke('dispatch', {
        type: OverlayActions.SET_ATTACHED_STATE,
        data: true,
      });
  }

  function detachOverlay() {
    cy.window()
      .its('__overlay__')
      .invoke('dispatch', {
        type: OverlayActions.SET_ATTACHED_STATE,
        data: false,
      });
  }

  beforeEach(function () {
    cy.wait(0);

    cy.window()
      .then((win) => {
        win.__overlay__.setHidden(false);
        win.__overlay__.setScrollAxis('y');
      });
  });

  afterEach(function () {
    cy.window()
      .then((win) => {
        win.__overlay__.setHidden(true);
      });
  });

  it('should toggle scroll blocking along the y axis', function () {
    cy.scrollTo(0, 100);

    cy.window()
      .then((win) => {
        expect(win.__vr__.getViewportScrollPosition().top)
          .to.eq(100,'Expected viewport to be scrollable initially');
      });

    attachOverlay();

    cy.wait(0);

    cy.document().then(doc => doc.documentElement)
      .should((html) => {
        expect(html.css('top'))
          .to.eq('-100px', 'Expected html element to be offset by the scroll position');
      });

    cy.window()
      .then((win) => {
        win.scroll(0, 300);
      });

    cy.document().then(doc => doc.documentElement)
      .should((html) => {
        expect(html.css('top'))
          .to.eq('-100px', 'Expected the viewport not to scroll');
      });

    detachOverlay();

    cy.window()
      .then((win) => {
        expect(win.__vr__.getViewportScrollPosition().top)
          .to.eq(100,'Expected old scroll position to have bee restored after disabling');
      });

    cy.scrollTo(0, 300);

    cy.window()
      .then((win) => {
        expect(win.__vr__.getViewportScrollPosition().top)
          .to.eq(300,'Expected viewport to be able to scroll after disabling');
      });
  });

  it('should toggle scroll blocking along the x axis', function () {
    cy.window()
      .then((win) => {
        win.__overlay__.setScrollAxis('x');
      });

    cy.scrollTo(100, 0);

    cy.window()
      .then((win) => {
        expect(win.__vr__.getViewportScrollPosition().left)
          .to.eq(100, 'Expected viewport to be scrollable initially');
      });

    attachOverlay();

    cy.wait(0);

    cy.document().then(doc => doc.documentElement)
      .should((html) => {
        expect(html.css('left'))
          .to.eq('-100px', 'Expected html element to be offset by the scroll position');
      });

    cy.window()
      .then((win) => {
        win.scroll(300, 0);
      });

    cy.document().then(doc => doc.documentElement)
      .should((html) => {
        expect(html.css('left'))
          .to.eq('-100px', 'Expected the viewport not to scroll');
      });

    detachOverlay();

    cy.window()
      .then((win) => {
        expect(win.__vr__.getViewportScrollPosition().left)
          .to.eq(100,'Expected old scroll position to have bee restored after disabling');
      });

    cy.scrollTo(300, 0);

    cy.window()
      .then((win) => {
        expect(win.__vr__.getViewportScrollPosition().left)
          .to.eq(300,'Expected viewport to be able to scroll after disabling');
      });
  });

  it('should toggle the data attribute in the html element', function () {
    cy.document().then(doc => doc.documentElement)
      .should((html) => {
        expect(html).not.to.have.attr('data-has-scrollblock-enabled');
      });

    attachOverlay();

    cy.wait(0);

    cy.document().then(doc => doc.documentElement)
      .should((html) => {
        expect(html).to.have.attr('data-has-scrollblock-enabled', 'true');
      });

    detachOverlay();

    cy.wait(0);

    cy.document().then(doc => doc.documentElement)
      .should((html) => {
        expect(html).not.to.have.attr('data-has-scrollblock-enabled');
      });
  });

  it('should restore any previously-set inline styles', function () {
    cy.document().then(doc => doc.documentElement)
      .then((html) => {
        html.css({ top: '13px', left: '37px' });
      });

    attachOverlay();

    cy.wait(0);

    cy.document().then(doc => doc.documentElement)
      .should((html) => {
        expect(html.css('top')).not.to.eq('13px');
        expect(html.css('left')).not.to.eq('37px');
      });

    detachOverlay();

    cy.wait(0);

    cy.document().then(doc => doc.documentElement)
      .should((html) => {
        expect(html.css('top')).to.eq('13px');
        expect(html.css('left')).to.eq('37px');

        html.css({ top: '', left: '' });
      });
  });

  it('should not do anything if the page is not scrollable', function () {
    cy.window()
      .then((win) => {
        win.__overlay__.setHidden(true);
      });

    attachOverlay();

    cy.wait(0);

    cy.document().then(doc => doc.documentElement)
      .should((html) => {
        expect(html).not.to.have.attr('data-has-scrollblock-enabled');
      });
  });

  it('should keep the content width', function () {
    let previousWidth;

    cy.document().then(doc => doc.documentElement)
      .then(([html]) => {
        previousWidth = html.getBoundingClientRect().width;
      });

    attachOverlay();

    cy.wait(0);

    cy.document().then(doc => doc.documentElement)
      .should(([html]) => {
        expect(html.getBoundingClientRect().width).to.eq(previousWidth);
      });
  });

  it('should not overwrite user-defined scroll behavior', function () {
    let initialRootValue;
    let initialBodyValue;
    let rootStyle;
    let bodyStyle;

    cy.document()
      .then((doc) => {
        const root = doc.documentElement;
        const body = doc.body;

        rootStyle = root.style;
        bodyStyle = body.style;

        rootStyle.scrollBehavior = bodyStyle.scrollBehavior = 'smooth';
        initialRootValue = rootStyle.scrollBehavior;
        initialBodyValue = bodyStyle.scrollBehavior;
      });

    attachOverlay();
    cy.wait(0);

    detachOverlay();
    cy.wait(0);

    cy.wrap(null)
      .should(() => {
        expect(rootStyle.scrollBehavior).to.eq(initialRootValue);
        expect(bodyStyle.scrollBehavior).to.eq(initialBodyValue);

        rootStyle.scrollBehavior = bodyStyle.scrollBehavior = '';
      });
  });
});
