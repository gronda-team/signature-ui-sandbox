import { TestId } from '../../../e2e/src/app/Scrollable';
import { byTestId } from './util';

function expectOverlapping(alias, shouldOverlap) {
  let el1;
  cy.get('@scrollContainer')
    .then(([el]) => {
      el1 = el;
      return cy.get(alias);
    })
    .should(([el2]) => {
      const r1 = el1.getBoundingClientRect();
      const r2 = el2.getBoundingClientRect();

      const actual =
        r1.left < r2.right && r1.right > r2.left && r1.top < r2.bottom && r1.bottom > r2.top;

      const errorMessage =
        `${JSON.stringify(r1)} should${shouldOverlap ? ' ' : ' not'} overlap with ${JSON.stringify(r2)}`;

      expect(actual).to.eq(shouldOverlap, errorMessage);
    });
}

function expectScrollOffsetToEqual(from, expected) {
  if (expected === 0) {
    cy.window()
      .then((win) => {
        expect(win.__scrollable__.measureScrollOffset(from)).to.eq(expected);
      });
  } else {
    let maximum;
    cy.get('@maxOffset')
      .then((off) => {
        maximum = off;
        return cy.window();
      })
      .then((win) => {
        expect(win.__scrollable__.measureScrollOffset(from)).to.eq(maximum);
      });
  }
}

const CELL_ORDER_TESTING = ['@firstRowStart', '@firstRowEnd', '@lastRowStart', '@lastRowEnd'];

const SCROLL_OFFSETS_TESTING = ['top', 'bottom', 'left', 'right', 'start', 'end'];

describe('Scrollable', function () {
  let MO = '@maxOffset';

  before(function () {
    cy.visit('/scrollable');
  });

  function generateTest(title, scrollTo, overlappingResults, offsetResults) {
    it(title, function() {
      if (scrollTo) {
        cy.window()
          .then((win) => {
            win.__scrollable__.scrollTo(scrollTo);
          });
      }

      CELL_ORDER_TESTING.forEach((cell, index) => {
        // Let elements finish updating
        cy.wait(0);
        expectOverlapping(cell, overlappingResults[index]);
      });

      SCROLL_OFFSETS_TESTING.forEach((cell, index) => {
        // Let elements finish updating
        cy.wait(0);
        expectScrollOffsetToEqual(cell, offsetResults[index]);
      });
    })
  }

  beforeEach(function () {
    cy.get(byTestId(TestId.SCROLL_CONTAINER)).as('scrollContainer');
  });

  describe('in LTR context', function () {
    beforeEach(function () {
      cy.get(byTestId(TestId.FIRST_ROW_START)).as('firstRowStart');
      cy.get(byTestId(TestId.FIRST_ROW_END)).as('firstRowEnd');
      cy.get(byTestId(TestId.LAST_ROW_START)).as('lastRowStart');
      cy.get(byTestId(TestId.LAST_ROW_END)).as('lastRowEnd');

      cy.get('@scrollContainer')
        .then(([el]) => {
          return el.scrollHeight - el.clientHeight;
        })
        .as('maxOffset');
    });

    generateTest(
      'should initially be scrolled to top-left',
      null,
      [true, false, false, false],
      [0, MO, 0, MO, 0, MO],
    );

    generateTest(
      'should scrollTo top-left',
      { top: 0, left: 0 },
      [true, false, false, false],
      [0, MO, 0, MO, 0, MO],
    );

    generateTest(
      'should scrollTo bottom right',
      { bottom: 0, right: 0 },
      [false, false, false, true],
      [MO, 0, MO, 0, MO, 0],
    );

    generateTest(
      'should scrollTo top-end',
      { top: 0, end: 0 },
      [false, true, false, false],
      [0, MO, MO, 0, MO, 0],
    );

    generateTest(
      'should scrollTo bottom-start',
      { bottom: 0, start: 0 },
      [false, false, true, false],
      [MO, 0, 0, MO, 0, MO],
    );
  });

  describe('in RTL context', function () {
    beforeEach(function () {
      cy.get('@scrollContainer')
        .scrollTo(0, 0);

      cy.window()
        .then((win) => {
          win.__suite__.setDir('rtl');
        });

      cy.get(byTestId(TestId.FIRST_ROW_START)).as('firstRowStart');
      cy.get(byTestId(TestId.FIRST_ROW_END)).as('firstRowEnd');
      cy.get(byTestId(TestId.LAST_ROW_START)).as('lastRowStart');
      cy.get(byTestId(TestId.LAST_ROW_END)).as('lastRowEnd');

      cy.get('@scrollContainer')
        .then(([el]) => {
          return el.scrollHeight - el.clientHeight;
        })
        .as('maxOffset');
    });

    generateTest(
      'should initially be scrolled to top-right',
      null,
      [true, false, false, false],
      [0, MO, MO, 0, 0, MO],
    );

    generateTest(
      'should scrollTo top-left',
      { top: 0, left: 0 },
      [false, true, false, false],
      [0, MO, 0, MO, MO, 0],
    );

    generateTest(
      'should scrollTo bottom-right',
      { bottom: 0, right: 0 },
      [false, false, true, false],
      [MO, 0, MO, 0, 0, MO],
    );

    generateTest(
      'should scrollTo top-end',
      { top: 0, end: 0 },
      [false, true, false, false],
      [0, MO, 0, MO, MO, 0],
    );

    generateTest(
      'should scrollTo bottom-start',
      { bottom: 0, start: 0 },
      [false, false, true, false],
      [MO, 0, MO, 0, 0, MO],
    );
  });
});
