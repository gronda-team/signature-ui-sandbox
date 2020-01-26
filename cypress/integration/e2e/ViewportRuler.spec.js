describe('Viewport ruler', function () {
  beforeEach(function () {
    cy.visit('/viewport-ruler');

    cy.window()
      .its('ruler')
      .as('ruler')
      .then((ruler) => {
        expect(ruler).to.be.ok;
      });

    cy.scrollTo(0, 0);

    cy.window().its('innerWidth').as('winInnerWidth');
    cy.window().its('innerHeight').as('winInnerHeight');
  });

  it('should get the viewport size', function () {
    const args = [];
    cy.get('@ruler')
      .invoke('getViewportSize')
      .then((size) => {
        args.push(size);
        return cy.get('@winInnerWidth');
      })
      .then((innerWidth) => {
        args.push(innerWidth);
        return cy.get('@winInnerHeight');
      })
      .then((innerHeight) => {
        args.push(innerHeight);
        return args;
      })
      .then(([size, innerWidth, innerHeight]) => {
        expect(size.width).to.be.eq(innerWidth);
        expect(size.height).to.be.eq(innerHeight);
      });
  });

  it('should get the viewport bounds when the page is not scrolled', function () {
    const args = [];
    cy.get('@ruler')
      .invoke('getViewportRect')
      .then((bounds) => {
        args.push(bounds);
        return cy.get('@winInnerWidth');
      })
      .then((innerWidth) => {
        args.push(innerWidth);
        return cy.get('@winInnerHeight');
      })
      .then((innerHeight) => {
        args.push(innerHeight);
        return args;
      })
      .then(([bounds, innerWidth, innerHeight]) => {
        expect(bounds.top).to.be.eq(0);
        expect(bounds.left).to.be.eq(0);
        expect(bounds.bottom).to.be.eq(innerHeight);
        expect(bounds.right).to.be.eq(innerWidth);
      });
  });

  it('should get the viewport bounds when the page is scrolled', function () {
    cy.scrollTo(1500, 2000);

    const args = [];
    cy.get('@ruler')
      .invoke('getViewportRect')
      .then((bounds) => {
        args.push(bounds);
        return cy.get('@winInnerWidth');
      })
      .then((innerWidth) => {
        args.push(innerWidth);
        return cy.get('@winInnerHeight');
      })
      .then((innerHeight) => {
        args.push(innerHeight);
        return args;
      })
      .then(([bounds, innerWidth, innerHeight]) => {
        expect(bounds.top).to.be.eq(2000);
        expect(bounds.left).to.be.eq(1500);
        expect(bounds.bottom).to.be.eq(2000 + innerHeight);
        expect(bounds.right).to.be.eq(1500 + innerWidth);
      });
  });

  it('should get the scroll position when the page is not scrolled', function () {
    cy.get('@ruler')
      .invoke('getViewportScrollPosition')
      .should(({ top, left }) => {
        expect(top).to.be.eq(0);
        expect(left).to.be.eq(0);
      });
  });

  it('should get the scroll position when the page is scrolled', function () {
    cy.scrollTo(1500, 2000);

    cy.get('@ruler')
      .invoke('getViewportScrollPosition')
      .should(({ top, left }) => {
        expect(top).to.be.eq(2000);
        expect(left).to.be.eq(1500);
      });
  });

  describe('resize/orientationchange event', function () {
    beforeEach(function () {
      cy.viewport(1000, 660);
    });

    it('should dispatch an event when the window is resized', function () {
      const stub = cy.stub();
      cy.get('@ruler')
        .invoke('addChangeListener', stub, 0)
        .as('removeChangeListener');

      cy.viewport('ipad-2');

      cy.wait(1)
        .get('@removeChangeListener')
        .should((remove) => {
          expect(stub).to.be.called;
          remove();
        })
    });

    it('should dispatch an event when the orientation has changed', function () {
      const stub = cy.stub();

      cy.get('@ruler')
        .invoke('addChangeListener', stub, 0)
        .as('removeChangeListener');

      cy.viewport('ipad-2', 'landscape');

      cy.wait(1);

      cy.get('@removeChangeListener')
        .should((remove) => {
          expect(stub).to.be.called;
          remove();
        })
    });

    it('should be able to throttle the callback', function () {
      const stub = cy.stub();

      cy.get('@ruler')
        .invoke('addChangeListener', stub, 1337)
        .as('removeChangeListener');

      cy.viewport('ipad-2');

      cy.wait(1337);

      cy.get('@removeChangeListener')
        .should((remove) => {
          expect(stub).to.be.called;
          remove();
        })
    });
  });
});
