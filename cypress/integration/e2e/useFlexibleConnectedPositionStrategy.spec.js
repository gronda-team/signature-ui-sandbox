import {
  TestId,
  DEFAULT_HEIGHT,
  DEFAULT_WIDTH,
} from '../../../e2e/src/app/FlexibleConnectedPositionStrategy';
import { OverlayActions } from '../../../src/cdk/Overlay';
import { utils } from '../../../src/cdk/Overlay/position/util';

describe('useFlexibleConnectedPositionStrategy', function () {
  before(function () {
    cy.visit('/scroll-flexible');
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

  afterEach(function () {
    detachOverlay();
  });

  describe('basic behavior', function () {
    beforeEach(function () {
      let origin;
      cy.get(`[data-testid="${TestId.ORIGIN}"]`)
        .as('origin')
        .then(([or]) => {
          origin = or;
        });

      cy.window()
        .then((win) => {
          win.__overlay__.setConfig({ origin });
          win.__overlay__.setOriginStyle({ width: 0, height: 0 });
        });
    });

    it('should clean up after itself when disposed', function () {
      cy.window()
        .then((win) => {
          win.__overlay__.setConfig(config => ({
            ...config,
            preferredPositions: [{
              overlayX: 'start',
              overlayY: 'top',
              originX: 'start',
              originY: 'bottom',
              offsetX: 10,
              offsetY: 20,
            }],
          }));
        });

      attachOverlay();

      detachOverlay();

      cy.window()
        .its('__overlay__.state')
        .then((state) => {
          expect(state.pane).not.to.be.visible;
          expect(state.host).not.to.be.visible;
        });
    });
  });

  describe('without flexible dimensions and pushing', function () {
    beforeEach(function () {
      cy.window()
        .its('__overlay__')
        .invoke('setConfig', config => ({
          ...config,
          canPush: false,
          hasFlexibleDimensions: false,
        }));

      cy.window()
        .then((win) => {
          win.__overlay__.setMiscProps({ showLargeElement: false });
        });
    });

    afterEach(function () {
      detachOverlay();
    });

    describe('when not near viewport edge, not scrolled', function () {
      // Place the original element close to the center of the window.
      // (1024 / 2, 768 / 2). It's not exact, since outerWidth/Height includes browser
      // chrome, but it doesn't really matter for these tests.
      const ORIGIN_LEFT = 500;
      const ORIGIN_TOP = 350;

      beforeEach(function () {
        cy.get(`[data-testid="${TestId.ORIGIN}"]`)
          .as('origin');

        cy.window()
          .then((win) => {
            win.__overlay__.setOriginStyle({ left: ORIGIN_LEFT, top: ORIGIN_TOP });
            win.__overlay__.setAbsolutelyPositioned(true);
          });
      });

      afterEach(function () {
        detachOverlay();
      });

      // Preconditions are set, now just run the full set of simple position tests.
      runSimplePositionTests();
    });

    describe('when scrolled', function () {
      // Place the original element decently far outside the unscrolled document (1024x768).
      const ORIGIN_LEFT = 2500;
      const ORIGIN_TOP = 2500;

      beforeEach(function () {
        cy.get(`[data-testid="${TestId.ORIGIN}"]`)
          .as('origin');

        cy.window()
          .then((win) => {
            win.__overlay__.setOriginStyle({ left: ORIGIN_LEFT, top: ORIGIN_TOP });
            win.__overlay__.setAbsolutelyPositioned(true);
            win.__overlay__.setMiscProps({ showLargeElement: true });
          })
          .then((win) => {
            win.scroll(2100, 2100);
          });
      });

      afterEach(function () {
        detachOverlay();
        cy.scrollTo(0, 0);
        cy.window()
          .then((win) => {
            win.__overlay__.setMiscProps({ showLargeElement: false });
          })
      });

      runSimplePositionTests();
    });

    describe('when near viewport edge', function () {
      beforeEach(function () {
        cy.window()
          .then((win) => {
            win.scroll(0, 0);
            win.__overlay__.setConfig(props => ({ ...props, offsetX: 0, offsetY: 0 }));
            win.__overlay__.setMiscProps({ showLargeElement: false });
            win.__overlay__.setAbsolutelyPositioned(true);
          });

        cy.get(`[data-testid="${TestId.ORIGIN}"]`)
          .as('origin');
      });

      afterEach(function () {
        detachOverlay();
      });

      function generatePositionTest(
        title, originStyle, positions, callback,
        options = { onAttached: () => {}, positionProps: {}, miscProps: null },
      ) {
        it(title, function () {
          // Locate the origin
          let origin;
          cy.get('@origin')
            .then(([or]) => {
              origin = or;
            });

          cy.window()
            .then((win) => {
              if (options.miscProps) {
                win.__overlay__.setMiscProps(props => ({
                  ...props, ...(options.miscProps || {}),
                }));
              }

              win.__overlay__.setOriginStyle(originStyle);
              win.__overlay__.setConfig(config => ({
                ...config,
                ...(options.positionProps || {}),
                origin,
                preferredPositions: positions,
              }));
            });

          attachOverlay();

          cy.wrap(null).then(() => {
            if (typeof options.onAttached === 'function') {
              options.onAttached(origin);
            }
          });

          cy.window()
            .its('__overlay__.state.pane')
            .should((pane) => {
              const originRect = origin.getBoundingClientRect();
              const overlayRect = pane.getBoundingClientRect();

              callback(originRect, overlayRect, origin, pane);
            });
        });
      }

      generatePositionTest(
        'should reposition the overlay if it were to go off the top of the screen',
        { left: 200, top: 5 },
        [
          {
            originX: 'end',
            originY: 'top',
            overlayX: 'end',
            overlayY: 'bottom'
          },
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top'
          },
        ],
        (originRect, overlayRect) => {
          expect(overlayRect.top).to.eq(originRect.bottom);
          expect(overlayRect.left).to.eq(originRect.left);
        },
      );

      generatePositionTest(
        'should reposition the overlay if it were to go off the left of the screen',
        { left: 5, top: 200 },
        [
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'end',
            overlayY: 'top'
          },
          {
            originX: 'end',
            originY: 'center',
            overlayX: 'start',
            overlayY: 'center'
          },
        ],
        (originRect, overlayRect) => {
          expect(overlayRect.top).to.eq(originRect.top);
          expect(overlayRect.left).to.eq(originRect.right);
        },
      );

      generatePositionTest(
        'should reposition the overlay if it were to go off the bottom of the screen',
        { bottom: 25, left: 200 },
        [
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top'
          },
          {
            originX: 'end',
            originY: 'top',
            overlayX: 'end',
            overlayY: 'bottom'
          },
        ],
        (originRect, overlayRect) => {
          expect(overlayRect.bottom).to.eq(originRect.top);
          expect(overlayRect.right).to.eq(originRect.right);
        },
      );

      generatePositionTest(
        'should reposition the overlay if it were to go off the right of the screen',
        { right: 25, top: 200 },
        [
          {
            originX: 'end',
            originY: 'center',
            overlayX: 'start',
            overlayY: 'center'
          },
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'end',
            overlayY: 'top'
          },
        ],
        (originRect, overlayRect) => {
          expect(overlayRect.top).to.eq(originRect.bottom);
          expect(overlayRect.right).to.eq(originRect.left);
        },
      );

      generatePositionTest(
        'should recalculate and set the last position with reapplyLastPosition',
        { bottom: 25 },
        [
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top'
          },
          {
            originX: 'start',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'bottom'
          },
        ],
        (originRect, overlayRect) => {
          expect(overlayRect.bottom).to.eq(originRect.top);
        },
        {
          onAttached: () => {
            cy.window()
              .then((win) => {
                win.__overlay__.setMiscProps(props => ({ ...props, overlayHeight: 15 }));
                win.__overlay__.state.position.reapplyLastPosition();
              });
          },
        },
      );

      generatePositionTest(
        'should default to the initial position if no positions fit in the viewport',
        { height: 1000, top: 0 },
        [{ originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' }],
        (originRect, overlayRect) => {
          expect(overlayRect.bottom).to.eq(originRect.top);
        },
        {
          onAttached: () => {
            cy.window()
              .then((win) => {
                win.__overlay__.state.position.reapplyLastPosition();
              });
          },
        },
      );

      generatePositionTest(
        'should position a panel properly when rtl',
        { width: 500 },
        [{ originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' }],
        (originRect, overlayRect) => {
          expect(overlayRect.top).to.eq(originRect.bottom);
          expect(overlayRect.right).to.eq(originRect.right);
        },
        {
          miscProps: { dir: 'rtl' },
        },
      );

      generatePositionTest(
        'should position a panel with the x offset provided',
        {},
        [{ originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'top', offsetX: 10 }],
        (originRect, overlayRect) => {
          expect(overlayRect.top).to.eq(originRect.top);
          expect(overlayRect.left).to.eq(originRect.left + 10);
        },
      );

      generatePositionTest(
        'should be able to set the default x offset',
        {},
        [{ originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'top' }],
        (originRect, overlayRect) => {
          expect(overlayRect.top).to.eq(originRect.top);
          expect(overlayRect.left).to.eq(originRect.left + 20);
        },
        {
          positionProps: { offsetX: 20 },
        },
      );

      generatePositionTest(
        'should have the position offset x take precedence over the default offset x',
        {},
        [{ originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'top', offsetX: 10 }],
        (originRect, overlayRect) => {
          expect(overlayRect.top).to.eq(originRect.top);
          expect(overlayRect.left).to.eq(originRect.left + 10);
        },
        {
          positionProps: { offsetX: 20 },
        },
      );

      generatePositionTest(
        'should position a panel with the y offset provided',
        {},
        [{ originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'top', offsetY: 50 }],
        (originRect, overlayRect) => {
          expect(overlayRect.top).to.eq(originRect.top + 50);
          expect(overlayRect.left).to.eq(originRect.left);
        },
      );

      generatePositionTest(
        'should be able to set the default y offset',
        {},
        [{ originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'top' }],
        (originRect, overlayRect) => {
          expect(overlayRect.top).to.eq(originRect.top + 60);
          expect(overlayRect.left).to.eq(originRect.left);
        },
        {
          positionProps: { offsetY: 60 },
        },
      );

      generatePositionTest(
        'should have the position offset x take precedence over the default offset x',
        {},
        [{ originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'top', offsetY: 50 }],
        (originRect, overlayRect) => {
          expect(overlayRect.top).to.eq(originRect.top + 50);
          expect(overlayRect.left).to.eq(originRect.left);
        },
        {
          positionProps: { offsetY: 60 },
        },
      );

      generatePositionTest(
        'should allow for the fallback positions to specify their own offsets',
        { bottom: 0, left: '50%', position: 'fixed' },
        [
          {
            originX: 'start',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'top',
            offsetX: 50,
            offsetY: 50
          },
          {
            originX: 'start',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'bottom',
            offsetX: -100,
            offsetY: -100
          },
        ],
        (originRect, overlayRect) => {
          expect(overlayRect.bottom).to.eq(originRect.top - 100);
          expect(overlayRect.left).to.eq(originRect.left - 100);
        },
      );

      generatePositionTest(
        'should account for the offsetX pushing the overlay out of the screen',
        { top: 200, left: 70 },
        [
          {
            originX: 'start',
            originY: 'top',
            overlayX: 'end',
            overlayY: 'top',
            offsetX: -20, // Will push overlay out of viewport
          },
          {
            originX: 'end',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'top',
          },
        ],
        (originRect, overlayRect) => {
          expect(overlayRect.top).to.eq(originRect.top);
          expect(overlayRect.left).to.eq(originRect.right);
        },
      );

      generatePositionTest(
        'should account for the offsetY pushing the overlay out of the screen',
        { bottom: 40, left: 200 },
        [
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top',
            offsetY: 20, // Will push overlay out of viewport
          },
          {
            originX: 'end',
            originY: 'top',
            overlayX: 'end',
            overlayY: 'bottom',
          },
        ],
        (originRect, overlayRect) => {
          expect(overlayRect.bottom).to.eq(originRect.top);
          expect(overlayRect.right).to.eq(originRect.right);
        },
      );
    });

    describe('with transform origin', function () {
      beforeEach(function () {
        cy.get(`[data-testid="${TestId.ORIGIN}"]`)
          .as('origin');
      });

      function generatePositionTest(
        title,
        position,
        callback,
        miscProps = null,
      ) {
        it(title, function () {
          // Locate the origin
          let origin;
          cy.get('@origin')
            .then(([or]) => {
              origin = or;
            });

          cy.window()
            .then((win) => {
              if (miscProps) {
                win.__overlay__.setMiscProps(props => ({ ...props, ...miscProps }));
              }

              win.__overlay__.setConfig(config => ({
                ...config,
                origin,
                enableTransformOrigin: true,
                preferredPositions: [position],
              }));
            });

          attachOverlay();

          cy.get('.transform-origin')
            .should(([target]) => {
              const transformOrigin = target.style.transformOrigin;

              callback(transformOrigin);
            });
        });
      }

      generatePositionTest(
        'should set the proper transform-origin when aligning to start/bottom',
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
        (transformOrigin) => {
          expect(transformOrigin).to.have.string('left top');
        },
      );

      generatePositionTest(
        'should set the proper transform-origin when aligning to end/bottom',
        { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' },
        (transformOrigin) => {
          expect(transformOrigin).to.have.string('right top');
        },
      );

      generatePositionTest(
        'should set the proper transform-origin centering vertically',
        { originX: 'start', originY: 'center', overlayX: 'start', overlayY: 'center' },
        (transformOrigin) => {
          expect(transformOrigin).to.have.string('left center');
        },
      );

      generatePositionTest(
        'should set the proper transform-origin when centering horizontally',
        { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'top' },
        (transformOrigin) => {
          expect(transformOrigin).to.have.string('center top');
        },
      );

      generatePositionTest(
        'should set the proper transform-origin when aligning to start/top',
        { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
        (transformOrigin) => {
          expect(transformOrigin).to.have.string('left bottom');
        },
      );

      generatePositionTest(
        'should set the proper transform-origin when aligning to start/bottom in rtl',
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
        (transformOrigin) => {
          expect(transformOrigin).to.have.string('right top');
        },
        { dir: 'rtl' },
      );

      generatePositionTest(
        'should set the proper transform-origin when aligning to end/bottom in rtl',
        { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' },
        (transformOrigin) => {
          expect(transformOrigin).to.have.string('left top');
        },
        { dir: 'rtl' },
      );
    });

    describe('with origin set to a point', function () {
      before(function () {
        cy.window()
          .then((win) => {
            win.__overlay__.setOriginStyle({ left: 0, top: 0 });
          });
      });

      beforeEach(function () {
        cy.window()
          .its('innerWidth')
          .as('viewportWidth');
      });

      function generatePositionTest(
        title,
        origin,
        positions,
        callback,
      ) {
        it(title, function () {
          let win;
          cy.window()
            .then((__win) => {
              win = __win;
            });

          cy.window()
            .then((win) => {
              win.__overlay__.setConfig(config => ({
                ...config,
                origin: typeof origin === 'function' ? origin(win) : origin,
                preferredPositions: positions,
              }));
            });

          attachOverlay();

          cy.window()
            .its('__overlay__.state.pane')
            .should((overlay) => {
              const overlayRect = overlay.getBoundingClientRect();

              callback(overlayRect, overlay, win);
            });
        });
      }

      generatePositionTest(
        'should be able to render at the primary position',
        { x: 50, y: 100 },
        [{ originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' }],
        (overlayRect) => {
          expect(overlayRect.top).to.eq(100);
          expect(overlayRect.left).to.eq(50);
        },
      );

      generatePositionTest(
        'should be able to render at a fallback position',
        win => ({ x: 50, y: win.innerHeight }),
        [
          { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
          { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
        ],
        (overlayRect, origin, win) => {
          expect(overlayRect.bottom).to.eq(win.innerHeight);
          expect(overlayRect.left).to.eq(50);
        },
      );

      generatePositionTest(
        'should be able to position relative to a point with width and height',
        { x: 100, y: 200, width: 100, height: 50 },
        [
          { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' },
        ],
        (overlayRect) => {
          expect(overlayRect.top).to.eq(250);
          expect(overlayRect.right).to.eq(200);
        },
      );
    });

    describe('miscellaneous', function () {
      beforeEach(function () {
        cy.get(`[data-testid="${TestId.ORIGIN}"]`)
          .as('origin');

        cy.window()
          .then((win) => {
            win.__overlay__.setAbsolutelyPositioned(true);
            win.__overlay__.setConfig(config => ({
              ...config,
              onPositionChange: null,
            }));
          });
      });

      afterEach(function () {
        detachOverlay();
      });

      it('should emit onPositionChange event when the position changes', function () {
        // Locate the origin
        let origin;
        cy.get('@origin')
          .then(([or]) => {
            origin = or;
          });

        const onPositionChangeSpy = cy.stub().as('positionChange');

        cy.window()
          .then((win) => {
            win.__overlay__.setOriginStyle({ top: 200, right: 25 });
            win.__overlay__.setConfig(config => ({
              ...config,
              origin,
              onPositionChange: onPositionChangeSpy,
              preferredPositions: [
                {
                  originX: 'end',
                  originY: 'center',
                  overlayX: 'start',
                  overlayY: 'center'
                },
                {
                  originX: 'start',
                  originY: 'bottom',
                  overlayX: 'end',
                  overlayY: 'top'
                },
              ],
            }));
          });

        attachOverlay();

        cy.get('@positionChange')
          .should('be.called');

        cy.window()
          .then((win) => {
            win.__overlay__.setOriginStyle({ top: 200, left: 200 });
          });

        cy.get('@positionChange')
          .should('be.called.calledTwice');
      });

      it('should emit onPositionChange event even if no position fits', function () {
        // Locate the origin
        let origin;
        cy.get('@origin')
          .then(([or]) => {
            origin = or;
          });

        const onPositionChangeSpy = cy.stub().as('positionChange');

        cy.window()
          .then((win) => {
            win.__overlay__.setOriginStyle({ bottom: 25, right: 25 });
            win.__overlay__.setConfig(config => ({
              ...config,
              origin,
              onPositionChange: onPositionChangeSpy,
              preferredPositions: [
                {
                  originX: 'end',
                  originY: 'bottom',
                  overlayX: 'start',
                  overlayY: 'top'
                },
                {
                  originX: 'start',
                  originY: 'bottom',
                  overlayX: 'end',
                  overlayY: 'top'
                },
              ],
            }));
          });

        attachOverlay();

        cy.get('@positionChange')
          .should('be.called');
      });

      it('should pick the fallback position that shows ' +
        'the largest area of the element', function () {
        // Locate the origin
        let origin;
        cy.get('@origin')
          .then(([or]) => {
            origin = or;
          });

        cy.window()
          .then((win) => {
            win.__overlay__.setOriginStyle({ top: 200, right: 25 });
            win.__overlay__.setConfig(config => ({
              ...config,
              origin,
              preferredPositions: [
                {
                  originX: 'end',
                  originY: 'center',
                  overlayX: 'start',
                  overlayY: 'center'
                },
                {
                  originX: 'end',
                  originY: 'top',
                  overlayX: 'start',
                  overlayY: 'bottom'
                },
                {
                  originX: 'end',
                  originY: 'top',
                  overlayX: 'end',
                  overlayY: 'top'
                },
              ],
            }));
          });

        attachOverlay();

        cy.window()
          .its('__overlay__.state.pane')
          .should((pane) => {
            const originRect = origin.getBoundingClientRect();
            const overlayRect = pane.getBoundingClientRect();

            expect(overlayRect.top).to.eq(originRect.top);
            expect(overlayRect.left).to.eq(originRect.left);
          });
      });

      // Test doesn't work. Investigate why
      it.skip('should reuse the preferred position when reapplying while locked in', function () {
        // Locate the origin
        let origin;
        cy.get('@origin')
          .then(([or]) => {
            origin = or;
          });

        cy.spy(utils, 'noop').as('noopFn');

        cy.window()
          .then((win) => {
            win.__overlay__.setConfig(config => ({
              ...config,
              origin,
              positionLocked: true,
              preferredPositions: [
                {
                  originX: 'end',
                  originY: 'center',
                  overlayX: 'start',
                  overlayY: 'center'
                },
                {
                  originX: 'start',
                  originY: 'bottom',
                  overlayX: 'end',
                  overlayY: 'top'
                },
              ],
            }));
          });

        attachOverlay();

        cy.wait(1);

        cy.window()
          .then((win) => {
            cy.spy(win.__overlay__.state.position, 'reapplyLastPosition').as('reapply');
          });

        cy.get('@reapply')
          .should('not.be.called');

        cy.window()
          .then((win) => {
            win.__overlay__.state.position.apply();
          });

        cy.wait(1);

        cy.get('@noopFn')
          .should('be.called');
      });

      it('should not retain the last preferred position ' +
        'when overriding the positions', function () {
        let origin;
        cy.get('@origin')
          .then(([or]) => {
            origin = or;
          });

        cy.window()
          .then((win) => {
            win.__overlay__.setOriginStyle({ top: 100, left: 100 });
            win.__overlay__.setConfig(config => ({
              ...config,
              origin,
              preferredPositions: [
                {
                  originX: 'start',
                  originY: 'top',
                  overlayX: 'start',
                  overlayY: 'top',
                  offsetX: 10,
                  offsetY: 20,
                },
              ],
            }));
          });

        attachOverlay();

        cy.window()
          .its('__overlay__.state.pane')
          .should((pane) => {
            const originRect = origin.getBoundingClientRect();
            const overlayRect = pane.getBoundingClientRect();

            expect(overlayRect.top).to.eq(originRect.top + 20);
            expect(overlayRect.left).to.eq(originRect.left + 10);
          });

        cy.window()
          .then((win) => {
            win.__overlay__.setConfig(config => ({
              ...config,
              preferredPositions: [
                {
                  originX: 'start',
                  originY: 'top',
                  overlayX: 'start',
                  overlayY: 'top',
                  offsetX: 20,
                  offsetY: 40
                },
              ],
            }));

            win.__overlay__.state.position.reapplyLastPosition();
          });

        cy.window()
          .its('__overlay__.state.pane')
          .should((pane) => {
            const originRect = origin.getBoundingClientRect();
            const overlayRect = pane.getBoundingClientRect();

            expect(overlayRect.top).to.eq(originRect.top + 40);
            expect(overlayRect.left).to.eq(originRect.left + 20);
          });
      });
    });

    function runSimplePositionTests() {
      function generatePositionTest(title, position, callback) {
        it(title, function () {
          // Locate the origin
          let origin;
          cy.get('@origin')
            .then(([or]) => {
              origin = or;
            });

          // Bind the origin and the configuration to the pane
          cy.window()
            .then((win) => {
              win.__overlay__.setConfig(config => ({ ...config, preferredPositions: [position] }));
            });

          attachOverlay();

          cy.window()
            .its('__overlay__.state.pane')
            .should((pane) => {
              const overlayRect = pane.getBoundingClientRect();
              const originRect = origin.getBoundingClientRect();

              callback(overlayRect, originRect);
            });
        });
      }

      generatePositionTest(
        'should position a panel below, left-aligned',
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
        (overlayRect, originRect) => {
          expect(overlayRect.top).to.be.eq(originRect.bottom);
          expect(overlayRect.left).to.be.eq(originRect.left);
        },
      );

      generatePositionTest(
        'should position to the right, center aligned vertically',
        { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center' },
        (overlayRect, originRect) => {
          const originCenterY = originRect.top + (DEFAULT_HEIGHT / 2);

          expect(overlayRect.top).to.be.eq(originCenterY);
          expect(overlayRect.left).to.be.eq(originRect.right);
        },
      );

      generatePositionTest(
        'should position to the left, below',
        { originX: 'start', originY: 'bottom', overlayX: 'end', overlayY: 'top' },
        (overlayRect, originRect) => {
          expect(overlayRect.top).to.be.eq(originRect.bottom);
          expect(overlayRect.right).to.be.eq(originRect.left);
        },
      );

      generatePositionTest(
        'should position above, right aligned',
        { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom' },
        (overlayRect, originRect) => {
          expect(overlayRect.bottom).to.be.eq(originRect.top);
          expect(overlayRect.right).to.be.eq(originRect.right);
        },
      );

      generatePositionTest(
        'should position below, centered',
        { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top' },
        (overlayRect, originRect) => {
          expect(overlayRect.top).to.be.eq(originRect.bottom);
          expect(overlayRect.left).to.be.eq(originRect.left + (DEFAULT_WIDTH / 2));
        },
      );

      generatePositionTest(
        'should center the overlay on the origin',
        { originX: 'center', originY: 'center', overlayX: 'center', overlayY: 'center' },
        (overlayRect, originRect) => {
          expect(overlayRect.top).to.be.eq(originRect.top + (DEFAULT_HEIGHT/ 2));
          expect(overlayRect.left).to.be.eq(originRect.left + (DEFAULT_WIDTH  / 2));
        },
      );
    }
  });

  describe('with pushing', function () {
    beforeEach(function () {
      cy.window()
        .then((win) => {
          win.scroll(0, 0);
        });

      let origin;
      cy.get(`[data-testid="${TestId.ORIGIN}"]`)
        .as('origin')
        .then(([or]) => {
          origin = or;
        });

      cy.window()
        .then((win) => {
          win.__overlay__.setAbsolutelyPositioned(true);
          win.__overlay__.setConfig({
            origin,
            hasFlexibleDimensions: false,
            viewportMargin: 0,
            canPush: true,
          });
          win.__overlay__.setMiscProps({ });
        });
    });

    afterEach(function () {
      detachOverlay()
    });

    function generatePositionTest(
      title,
      originStyle,
      position,
      callback,
      options = { props: {}, misc: null },
    ) {
      it(title, function () {
        let origin;

        cy.get('@origin')
          .then(([or]) => {
            origin = or;
          });

        let windowAlias;

        cy.window()
          .then((win) => {
            windowAlias = win;
            win.__overlay__.setOriginStyle(originStyle);
            win.__overlay__.setConfig(props => ({
              ...props,
              ...(options.props || {}),
              preferredPositions: Array.isArray(position) ? position : [position],
            }));

            if (options.misc) {
              let finalMiscProps = options.misc;

              if (typeof options.misc === 'function') {
                finalMiscProps = options.misc(win);
              }

              win.__overlay__.setMiscProps(props => ({ ...props, ...finalMiscProps }));
            }
          });

        attachOverlay();

        cy.window()
          .its('__overlay__.state.pane')
          .should((overlay) => {
            const overlayRect = overlay.getBoundingClientRect();
            const originRect = origin.getBoundingClientRect();

            callback(overlayRect, originRect, windowAlias);
          });
      });
    }

    generatePositionTest(
      'should be able to push an overlay into the viewport when it goes out on the right',
      { top: 200, right: -DEFAULT_WIDTH / 2 },
      { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
      (overlayRect, originRect, win) => {
        expect(overlayRect.right).to.eq(win.innerWidth)
      },
    );

    generatePositionTest(
      'should be able to push an overlay into the viewport when it goes out on the left',
      { top: 200, left: -DEFAULT_WIDTH / 2 },
      { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
      (overlayRect) => {
        expect(overlayRect.left).to.eq(0);
      },
    );

    generatePositionTest(
      'should be able to push an overlay into the viewport when it goes out on the top',
      { top: -DEFAULT_HEIGHT * 2, left: 200 },
      { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
      (overlayRect) => {
        expect(overlayRect.top).to.eq(0);
      },
    );

    generatePositionTest(
      'should be able to push an overlay into the viewport when it goes out on the bottom',
      { bottom: -DEFAULT_HEIGHT / 2, left: 200 },
      { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
      (overlayRect, originRect, win) => {
        expect(overlayRect.bottom).to.eq(win.innerHeight);
      },
    );

    generatePositionTest(
      'should set a margin when pushing the overlay into the viewport horizontally',
      { top: 200, left: -DEFAULT_WIDTH / 2 },
      { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
      (overlayRect) => {
        expect(overlayRect.left).to.eq(15);
      },
      { props: { viewportMargin: 15 } },
    );

    generatePositionTest(
      'should set a margin when pushing the overlay into the viewport vertically',
      { top: -DEFAULT_HEIGHT / 2, left: 200 },
      { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
      (overlayRect) => {
        expect(overlayRect.top).to.eq(15);
      },
      { options: { viewportMargin: 15 } },
    );

    generatePositionTest(
      'should not mess with the left offset when pushing from the top',
      { top: -DEFAULT_HEIGHT / 2, left: 200 },
      { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
      (overlayRect) => {
        expect(overlayRect.left).to.eq(200);
      },
    );

    generatePositionTest(
      'should align to the trigger if the overlay is wider than the viewport, ' +
      'but the trigger is still within the viewport',
      { top: -DEFAULT_HEIGHT / 2, left: 200 },
      [
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
        { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' },
      ],
      (overlayRect, originRect) => {
        expect(overlayRect.left).to.eq(originRect.left);
      },
      // Set a large max-width to override the one that comes from the
      // overlay structural styles. Otherwise the `width` will stop at the viewport width.
      { misc: win => ({ maxWidth: '200vw', width: win.innerWidth + 100 }) },
    );

    it('should keep the element inside the viewport as the user is scrolling, ' +
      'with position locking disabled', function () {
      let origin;

      cy.get('@origin')
        .then(([or]) => {
          origin = or;
        });

      cy.window()
        .then((win) => {
          win.__overlay__.setOriginStyle({ top: -DEFAULT_HEIGHT / 2, left: 200 });
          win.__overlay__.setMiscProps({ showLargeElement: true, overflowY: true });
          win.__overlay__.setConfig(props => ({
            ...props,
            positionLocked: false,
            preferredPositions: [
              { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'start' },
            ],
          }));
        });

      attachOverlay();

      cy.window()
        .its('__overlay__.state.pane')
        .should((overlay) => {
          const overlayRect = overlay.getBoundingClientRect();

          expect(overlayRect.top).to.eq(0, 'Expect overlay to be inside the viewport initially');
        });

      cy.scrollTo(0, 100);

      cy.window()
        .its('__overlay__.state')
        .then((state) => {
          state.position.apply();
        });

      cy.window()
        .its('__overlay__.state.pane')
        .should((overlay) => {
          const overlayRect = overlay.getBoundingClientRect();

          expect(overlayRect.top).to.eq(0, 'Expected overlay to stay in viewport after scrolling');
        });
    });

    it('should not continue pushing the overlay as the user scrolls, ' +
      'if position locking is enabled', function () {
      let origin;

      cy.get('@origin')
        .then(([or]) => {
          origin = or;
        });

      cy.window()
        .then((win) => {
          win.__overlay__.setOriginStyle({ top: -DEFAULT_HEIGHT / 2, left: 200 });
          win.__overlay__.setMiscProps({ showLargeElement: true, overflowY: true });
          win.__overlay__.setConfig(props => ({
            ...props,
            positionLocked: true,
            preferredPositions: [
              { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'start' },
            ],
          }));
        });

      attachOverlay();

      const scrollBy = 100;

      cy.window()
        .its('__overlay__.state.pane')
        .should((overlay) => {
          const overlayRect = overlay.getBoundingClientRect();

          expect(overlayRect.top).to.eq(0);
        });

      cy.scrollTo(0, 100);

      cy.window()
        .its('__overlay__.state')
        .then((state) => {
          state.position.apply();
        });

      cy.window()
        .its('__overlay__.state.pane')
        .should((overlay) => {
          const overlayRect = overlay.getBoundingClientRect();

          expect(overlayRect.top).to.be.lt(0, 'Expected overlay to no longer be completely inside viewport');
        });
    });
  });

  describe('with flexible dimensions', function () {
    beforeEach(function () {
      let origin;
      cy.get(`[data-testid="${TestId.ORIGIN}"]`)
        .as('origin')
        .then(([or]) => {
          origin = or;
        });

      cy.window()
        .then((win) => {
          win.__overlay__.setAbsolutelyPositioned(true);
          win.__overlay__.setConfig({ origin, canPush: false });
          win.__overlay__.setMiscProps({ });
        });
    });

    afterEach(function () {
      detachOverlay()
    });

    it('should align the overlay to `flex-start` when ' +
      'the content is flowing to the right', function () {
      cy.window()
        .then((win) => {
          win.__overlay__.setConfig(props => ({
            ...props,
            hasFlexibleDimensions: true,
            canPush: false,
            preferredPositions: [
              { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
            ],
          }));
        });

      attachOverlay();

      cy.window()
        .its('__overlay__.state.host')
        .should((host) => {
          expect(host.style.alignItems).to.eq('flex-start');
        });
    });

    it('should align the overlay to `flex-end` when ' +
      'the content is flowing to the left', function () {
      cy.window()
        .then((win) => {
          win.__overlay__.setConfig(props => ({
            ...props,
            hasFlexibleDimensions: true,
            canPush: false,
            preferredPositions: [
              { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' },
            ],
          }));
        });

      attachOverlay();

      cy.window()
        .its('__overlay__.state.host')
        .should((host) => {
          expect(host.style.alignItems).to.eq('flex-end');
        });
    });

    it('should align the overlay to `center` when ' +
      'the content is centered', function () {
      cy.window()
        .then((win) => {
          win.__overlay__.setConfig(props => ({
            ...props,
            hasFlexibleDimensions: true,
            canPush: false,
            preferredPositions: [
              { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top' },
            ],
          }));
        });

      attachOverlay();

      cy.window()
        .its('__overlay__.state.host')
        .should((host) => {
          expect(host.style.alignItems).to.eq('center');
        });
    });

    it('should support offsets when centering', function () {
      let origin;

      cy.get('@origin')
        .then(([or]) => {
          origin = or;
        });

      cy.window()
        .then((win) => {
          win.__overlay__.setOriginStyle({ top: 200, left: 200 });
          win.__overlay__.setConfig(props => ({
            ...props,
            hasFlexibleDimensions: true,
            canPush: false,
            preferredPositions: [
              {
                originX: 'center',
                originY: 'center',
                overlayX: 'center',
                overlayY: 'center',
                offsetX: -15,
                offsetY: 20,
              },
            ],
          }));
        });

      attachOverlay();

      cy.window()
        .its('__overlay__.state.pane')
        .should((pane) => {
          const overlayRect = pane.getBoundingClientRect();
          const originRect = origin.getBoundingClientRect();

          expect(pane.style.transform).to.eq('translateX(-15px) translateY(20px)');
          expect(overlayRect.top + (DEFAULT_HEIGHT / 2)).to.eq(originRect.top + (DEFAULT_HEIGHT / 2) + 20);
          expect(overlayRect.left + (DEFAULT_WIDTH / 2)).to.eq(originRect.left + (DEFAULT_WIDTH / 2) - 15);
        });
    });
  });

  describe('positioning properties', function () {
    beforeEach(function () {
      let origin;
      cy.get(`[data-testid="${TestId.ORIGIN}"]`)
        .as('origin')
        .then(([or]) => {
          origin = or;
        });

      cy.window()
        .then((win) => {
          win.__overlay__.setAbsolutelyPositioned(true);
          win.__overlay__.setConfig({ origin });
          win.__overlay__.setMiscProps({ });
        });
    });

    afterEach(function () {
      detachOverlay();
    });

    describe('in ltr', function () {
      it('should use `left` when positioning an element at the start', function () {
        cy.window()
          .then((win) => {
            win.__overlay__.setConfig(config => ({
              ...config,
              preferredPositions: [
                { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'top' },
              ],
            }));
          });

        attachOverlay();

        cy.window()
          .its('__overlay__.state.host')
          .should((host) => {
            expect(host.style.left).to.be.ok;
            expect(host.style.right).not.to.be.ok;
          });
      });

      it('should use `right` when positioning an element at the end', function () {
        cy.window()
          .then((win) => {
            win.__overlay__.setConfig(config => ({
              ...config,
              preferredPositions: [
                { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'top' },
              ],
            }));
          });

        attachOverlay();

        cy.window()
          .its('__overlay__.state.host')
          .should((host) => {
            expect(host.style.right).to.be.ok;
            expect(host.style.left).not.to.be.ok;
          });
      });
    });

    describe('in rtl', function () {
      it('should use `right` when positioning an element at the start', function () {
        cy.window()
          .then((win) => {
            win.__overlay__.setMiscProps(props => ({ ...props, dir: 'rtl' }));
            win.__overlay__.setConfig(config => ({
              ...config,
              preferredPositions: [
                { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'top' },
              ],
            }));
          });

        attachOverlay();

        cy.window()
          .its('__overlay__.state.host')
          .should((host) => {
            expect(host.style.right).to.be.ok;
            expect(host.style.left).not.to.be.ok;
          });
      });
      it('should use `left` when positioning an element at the end', function () {
        cy.window()
          .then((win) => {
            win.__overlay__.setMiscProps(props => ({ ...props, dir: 'rtl' }));
            win.__overlay__.setConfig(config => ({
              ...config,
              preferredPositions: [
                { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'top' },
              ],
            }));
          });

        attachOverlay();

        cy.window()
          .its('__overlay__.state.host')
          .should((host) => {
            expect(host.style.left).to.be.ok;
            expect(host.style.right).not.to.be.ok;
          });
      });
    });

    describe('vertical', function () {
      it('should use `top` when positioning an element along the top', function () {
        cy.window()
          .then((win) => {
            win.__overlay__.setConfig(config => ({
              ...config,
              preferredPositions: [
                { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'top' },
              ],
            }));
          });

        attachOverlay();

        cy.window()
          .its('__overlay__.state.host')
          .should((host) => {
            expect(host.style.top).to.be.ok;
            expect(host.style.bottom).not.to.be.ok;
          });
      });

      it('should use `bottom` when positioning an element along the bottom', function () {
        cy.window()
          .then((win) => {
            win.__overlay__.setConfig(config => ({
              ...config,
              preferredPositions: [
                { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'bottom' },
              ],
            }));
          });

        attachOverlay();

        cy.window()
          .its('__overlay__.state.host')
          .should((host) => {
            expect(host.style.bottom).to.be.ok;
            expect(host.style.top).not.to.be.ok;
          });
      });
    });
  });

  describe('pane attributes', function () {
    beforeEach(function () {
      let origin;
      cy.get(`[data-testid="${TestId.ORIGIN}"]`)
        .as('origin')
        .then(([or]) => {
          origin = or;
        });

      cy.window()
        .then((win) => {
          win.__overlay__.setAbsolutelyPositioned(true);
          win.__overlay__.setConfig({
            origin,
            hasFlexibleDimensions: false,
            canPush: false,
          });
          win.__overlay__.setMiscProps({ });
        });
    });

    afterEach(function () {
      detachOverlay();
    });

    it('should be able to apply data attributes based on the position', function () {
      cy.window()
        .then((win) => {
          win.__overlay__.setConfig(config => ({
            ...config,
            preferredPositions: [{
              originX: 'start',
              originY: 'bottom',
              overlayX: 'start',
              overlayY: 'top',
              paneAttributes: {
                'data-overlay-is-below': true,
              },
            }],
          }));
        });

      attachOverlay();

      cy.window()
        .its('__overlay__.state.pane')
        .should('have.attr', 'data-overlay-is-below', 'true');
    });

    it('should be able to apply multiple data attributes based on the position', function () {
      cy.window()
        .then((win) => {
          win.__overlay__.setConfig(config => ({
            ...config,
            preferredPositions: [{
              originX: 'start',
              originY: 'bottom',
              overlayX: 'start',
              overlayY: 'top',
              paneAttributes: {
                'data-overlay-is-below': true,
                'data-is-positioned': true,
              },
            }],
          }));
        });

      attachOverlay();

      cy.window()
        .its('__overlay__.state.pane')
        .should('have.attr', 'data-overlay-is-below', 'true')
        .and('have.attr', 'data-is-positioned', 'true');
    });

    it('should be able to apply multiple data attributes based on the position', function () {
      cy.window()
        .then((win) => {
          win.__overlay__.setConfig(config => ({
            ...config,
            preferredPositions: [{
              originX: 'start',
              originY: 'bottom',
              overlayX: 'start',
              overlayY: 'top',
              paneAttributes: {
                'data-overlay-is-below': true,
                'data-is-positioned': true,
              },
            }],
          }));
        });

      attachOverlay();

      cy.window()
        .its('__overlay__.state.pane')
        .should('have.attr', 'data-overlay-is-below', 'true')
        .and('have.attr', 'data-is-positioned', 'true');
    });

    it('should remove the pane attributes when detaching', function () {
      cy.window()
        .then((win) => {
          win.__overlay__.setConfig(config => ({
            ...config,
            preferredPositions: [{
              originX: 'start',
              originY: 'bottom',
              overlayX: 'start',
              overlayY: 'top',
              paneAttributes: {
                'data-overlay-is-below': true,
              },
            }],
          }));
        });

      attachOverlay();

      cy.window()
        .its('__overlay__.state.pane')
        .should('have.attr', 'data-overlay-is-below', 'true');

      detachOverlay();

      cy.window()
        .its('__overlay__.state.pane')
        .should((pane) => {
          expect(pane.dataset.overlayIsBelow).not.to.be.ok;
        });
    });

    it('should clear the previous attributes when preferred position changes', function () {
      cy.window()
        .then((win) => {
          win.__overlay__.setOriginStyle({ top: 200, right: 25 });
          win.__overlay__.setConfig(config => ({
            ...config,
            preferredPositions: [{
              originX: 'end',
              originY: 'center',
              overlayX: 'start',
              overlayY: 'center',
              paneAttributes: {
                'data-overlay-is-center': true,
              },
            }, {
              originX: 'start',
              originY: 'bottom',
              overlayX: 'end',
              overlayY: 'top',
              paneAttributes: {
                'data-overlay-is-below': true,
              },
            }],
          }));
        });

      attachOverlay();

      cy.window()
        .its('__overlay__.state.pane')
        .should('have.attr', 'data-overlay-is-below', 'true')
        .and('not.have.attr', 'data-overlay-is-center');

      cy.window()
        .then((win) => {
          win.__overlay__.setOriginStyle({ top: 200, left: 200 });
          win.__overlay__.state.position.apply();
        });

      cy.window()
        .its('__overlay__.state.pane')
        .should('have.attr', 'data-overlay-is-center', 'true')
        .and('not.have.attr', 'data-overlay-is-below');
    });
  });
});
