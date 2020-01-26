import { resetCalls } from '../../../e2e/src/util';
import { TOUCH_BUFFER_MS } from '../../../src/cdk/A11y/FocusMonitor/FocusMonitor';
import { byTestId } from './util';

describe('Focus Monitor', function () {
  before(function () {
    Cypress.Commands.add('typeTab', (shiftKey, ctrlKey) => {
      cy.focused().trigger('keydown', {
        keyCode: 9,
        which: 9,
        shiftKey: shiftKey,
        ctrlKey: ctrlKey
      });
    });
  });

  beforeEach(function () {
    cy.visit('/focus-monitor', {
      onBeforeLoad() {
        resetCalls();
      },
    });

    cy.get(byTestId('plain-button')).as('button');
    cy.get(byTestId('previous-focusable')).as('prev');

    cy.window()
      .its('__calls__')
      .as('calls')
      .then((calls) => {
        expect(calls).to.be.ok;
      });
  });

  it('should append focus monitor classes to monitored elements', function () {
    cy.get('@button')
      .should('not.have.attr', 'data-cdk-focus');

    cy.get('@button').focus();

    cy.get('@button')
      .should('have.attr', 'data-cdk-focus', 'program');

    cy.get('@calls').should('have.length', 1);
  });

  it('should detect focus via keyboard', function () {
    cy.get('@prev').focus();
    cy.typeTab();
    cy.get('@button').focus();
    cy.get('@button')
      .should('have.attr', 'data-cdk-focus', 'keyboard');
    cy.get('@calls')
      .should('be.deep.eq', ['keyboard']);
  });

  it('should detect focus via mouse', function () {
    cy.get('@button').trigger('mousedown').focus();
    cy.get('@button')
      .should('have.attr', 'data-cdk-focus', 'mouse');
    cy.get('@calls')
      .should('be.deep.eq', ['mouse']);
  });

  it('should detect focus via touch', function () {
    cy.get('@button').trigger('touchstart').focus();
    cy.wait(TOUCH_BUFFER_MS);

    cy.get('@button')
      .should('have.attr', 'data-cdk-focus', 'touch');
    cy.get('@calls')
      .should('be.deep.eq', ['touch']);
  });

  it('should detect programmatic focus', function () {
    cy.get('@button').focus();
    cy.get('@button')
      .should('have.attr', 'data-cdk-focus', 'program');
    cy.get('@calls')
      .should('be.deep.eq', ['program']);
  });
});
