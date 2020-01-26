import { resetCalls } from '../../../e2e/src/util';
import { byTestId } from './util';

describe('Focus Monitor', function () {
  beforeEach(function () {
    cy.visit('/checkbox', {
      onBeforeLoad() {
        resetCalls();
      },
    });

    cy.get(byTestId('checkbox')).as('checkbox');
    cy.get('@checkbox').find('input[type="checkbox"]').as('input');

    cy.window()
      .its('__calls__')
      .as('calls')
      .then((calls) => {
        expect(calls).to.be.ok;
      });
  });

  it('should be checked when clicked and unchecked when clicked again', function () {
    cy.get('@checkbox').click();
    cy.get('@input').should('have.prop', 'checked', true);

    cy.get('@checkbox').click();
    cy.get('@input').should('have.prop', 'checked', false);
  });

  it('should toggle the checkbox when pressing space', function () {
    cy.get('@input')
      .should('have.prop', 'checked', false)
      .trigger('keydown', { key: ' ' }, { force: true })
      .should('have.prop', 'checked', true);
  });
});
