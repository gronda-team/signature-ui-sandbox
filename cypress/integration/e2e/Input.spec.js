import { TestId } from '../../../e2e/src/app/Input/constants';
import { byTestId } from './util';
import { CUSTOM_AUTOSIZE_EVENT } from '../../../src/cdk/TextArea';

// Holds event objects that are called with the custom autosize resize event
let mock = {};

/**
 * @param win {Window}
 */
function addCustomEventListener(win) {
  const listener = (event) => {
    mock.event = event;
    win.removeEventListener(CUSTOM_AUTOSIZE_EVENT, listener);
  };

  win.addEventListener(CUSTOM_AUTOSIZE_EVENT, listener);
}

describe('Input', function () {
  before(function () {
    cy.visit('/input', {
      onBeforeLoad: addCustomEventListener,
    });
  });

  describe('TextArea autosize', function () {
    beforeEach(function () {
      mock = {};
      cy.viewport(1000, 660);

      cy.get(byTestId(TestId.TEXTAREA_AUTOSIZE)).find('textarea')
        .as('autosizeTextArea')
        .clear();
      cy.window().its('setAutosizeProps').should('be.ok');
      cy.window().invoke('setAutosizeProps', {
        mounted: true,
        autosizeEnabled: true,
        autosizeMinRows: null,
        autosizeMaxRows: null,
      });
    });

    it('should initially set the rows of a textarea to one', function () {
      cy.get('@autosizeTextArea')
        .invoke('prop', 'rows')
        .should('be.eq', 1);
    });

    it('should resize the textarea based on its content', function () {
      let beforeClientHeight;
      cy.get('@autosizeTextArea').invoke('innerHeight')
        .then((height) => {
          beforeClientHeight = height;
        });

      cy.get('@autosizeTextArea')
        .type('All this happened, more or less. The war parts, anyway, are pretty much true. ')
        .should(([$textarea]) => {
          expect($textarea.clientHeight).to.be.gt(beforeClientHeight);
          expect($textarea.clientHeight).to.equal($textarea.scrollHeight);
          beforeClientHeight = $textarea.clientHeight;
        })
        .type('One guy I knew really was shot in Dresden for taking a teapot that wasn\'t his.')
        .should(([$textarea]) => {
          expect($textarea.clientHeight).to.be.gt(beforeClientHeight);
          expect($textarea.scrollHeight).to.equal($textarea.scrollHeight);
        });
    });

    it('should set a min-height based on minRows prop', function () {
      let previousMinHeight;

      cy.get('@autosizeTextArea')
        .should(([$textarea]) => {
          expect($textarea.style.minHeight).not.to.be.ok;
        });

      cy.window()
        .invoke('setAutosizeProps', props => ({ ...props, autosizeMinRows: 4 }));

      cy.get('@autosizeTextArea')
        .should(([$textarea]) => {
          expect($textarea.style.minHeight).to.be.ok;
          previousMinHeight = parseInt($textarea.style.minHeight, 10);
        });

      cy.window()
        .invoke('setAutosizeProps', props => ({ ...props, autosizeMinRows: 6 }));

      cy.get('@autosizeTextArea')
        .should(([$textarea]) => {
          expect(parseInt($textarea.style.minHeight, 10)).to.be.gt(previousMinHeight);
        });
    });

    it('should set a max-height based on maxRows prop', function () {
      let previousMaxHeight;
      cy.get('@autosizeTextArea')
        .should(([$textarea]) => {
          expect($textarea.style.maxHeight).not.to.be.ok;
        });

      cy.window()
        .invoke('setAutosizeProps', props => ({ ...props, autosizeMaxRows: 4 }));

      cy.get('@autosizeTextArea')
        .should(([$textarea]) => {
          expect($textarea.style.maxHeight).to.be.ok;
          previousMaxHeight = parseInt($textarea.style.maxHeight, 10);
        });

      cy.window()
        .invoke('setAutosizeProps', props => ({ ...props, autosizeMaxRows: 6 }));

      cy.get('@autosizeTextArea')
        .should(([$textarea]) => {
          expect(parseInt($textarea.style.maxHeight, 10)).to.be.gt(previousMaxHeight);
        });
    });

    it('should reduce the textarea height when the minHeight decreases', function () {
      cy.window().invoke('setAutosizeProps', props => ({ ...props, mounted: false }));
      cy.window().invoke('setAutosizeProps', props => ({ ...props, mounted: true }));

      let previousMaxHeight;
      cy.get('@autosizeTextArea')
        .should(([$textarea]) => {
          expect($textarea.style.maxHeight).not.to.be.ok;
        });

      cy.window()
        .invoke('setAutosizeProps', props => ({ ...props, autosizeMaxRows: 6 }));

      cy.get('@autosizeTextArea')
        .should(([$textarea]) => {
          expect($textarea.style.maxHeight).to.be.ok;
          previousMaxHeight = parseInt($textarea.style.maxHeight, 10);
        });

      cy.window()
        .invoke('setAutosizeProps', props => ({ ...props, autosizeMaxRows: 3 }));

      cy.get('@autosizeTextArea')
        .should(([$textarea]) => {
          expect(parseInt($textarea.style.maxHeight, 10)).to.be.lt(previousMaxHeight);
        });
    });

    it('should calculate the proper height based on a specified number of max rows', function () {
      cy.window().invoke('setAutosizeProps', props => ({ ...props, mounted: false }));
      cy.window().invoke('setAutosizeProps', props => ({ ...props, mounted: true }));

      cy.get('@autosizeTextArea')
        .type([1, 2, 3, 4, 5, 6, 7, 8].join('{enter}'))
        .should(([$textarea]) => {
          expect($textarea.clientHeight).to.be.eq($textarea.scrollHeight);
        });

      cy.window().invoke('setAutosizeProps', props => ({ ...props, autosizeMaxRows: 5 }));

      cy.get('@autosizeTextArea')
        .should(([$textarea]) => {
          expect($textarea.clientHeight).to.be.lt($textarea.scrollHeight);
        });
    });

    it('should trigger a resize when the window is resized', function () {
      cy.wrap(mock).its('event').should('not.be.ok');
      cy.viewport('ipad-2');
      cy.wrap(mock).its('event').should('be.ok');
    });
  });
});
