import * as React from 'react';
import { cleanup, render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'
import _ from 'lodash';
import useSelectionModel from '../useSelectionModel';

const SAMPLE_DATA = ['alpha', 'beta', 'delta', 'gamma'];

const ALPHA_TEST_ID = 'alpha';
const BETA_TEST_ID = 'beta';
const ALPHA_SELECT_TEST_ID = 'alpha-select';
const ALPHA_DESELECT_TEST_ID = 'alpha-deselect';
const ALPHA_TOGGLE_TEST_ID = 'alpha-toggle';
const BETA_SELECT_TEST_ID = 'beta-select';
const BETA_TOGGLE_TEST_ID = 'beta-toggle';
const DELTA_TOGGLE_TEST_ID = 'delta-toggle';
const GAMMA_TOGGLE_TEST_ID = 'gamma-toggle';

describe('useSelectionModel', function () {
  describe('single selection', function () {
    let queryByText;
    let queryByTestId;

    beforeEach(function () {
      const rendered = render(<ExampleComponent multiple={false} />);
      queryByText = rendered.queryByText;
      queryByTestId = rendered.queryByTestId;
    });

    afterEach(function () {
      queryByText = null;
      queryByTestId = null;
      cleanup();
    });

    it('should select a single value', function () {
      expect(queryByText(/\+/)).toBe(null);

      fireEvent.click(queryByTestId(ALPHA_SELECT_TEST_ID));

      expect(queryByTestId(ALPHA_TEST_ID)).toHaveAttribute('data-selected', 'true');
    });

    it('should deselect a previously selected value', function () {
      fireEvent.click(queryByTestId(ALPHA_SELECT_TEST_ID));
      fireEvent.click(queryByTestId(BETA_SELECT_TEST_ID));

      expect(queryByTestId(ALPHA_TEST_ID)).toHaveAttribute('data-selected', 'false');
      expect(queryByTestId(BETA_TEST_ID)).toHaveAttribute('data-selected', 'true');
    });
  });

  describe('multiple selection', function () {
    let queryByText;
    let queryAllByText;
    let queryByTestId;
    let queryAllByTestId;
    let spy;

    beforeEach(function () {
      spy = jest.fn();
      const rendered = render(<ExampleComponent multiple={true} onChange={spy} />);
      queryByText = rendered.queryByText;
      queryAllByText = rendered.queryAllByText;
      queryByTestId = rendered.queryByTestId;
      queryAllByTestId = rendered.queryAllByTestId;
    });

    afterEach(function () {
      queryByText = null;
      queryByTestId = null;
      jest.clearAllMocks();
      cleanup();
    });

    it('should be able to select multiple options', function () {
      fireEvent.click(queryByTestId(ALPHA_SELECT_TEST_ID));
      fireEvent.click(queryByTestId(BETA_SELECT_TEST_ID));

      expect(queryAllByText(/\+/).length).toBe(2);
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('should be able to select multiple options at the same time', function () {
      fireEvent.click(queryByTestId('first-two'));

      expect(queryAllByText(/\+/).length).toBe(2);
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('changed event', function () {
    afterEach(function () {
      cleanup();
      jest.clearAllMocks();
    });

    it('should return both added and removed values', function () {
      const spy = jest.fn();
      const rendered = render(<ExampleComponent onChange={spy} />);

      fireEvent.click(rendered.queryByTestId(ALPHA_SELECT_TEST_ID));
      fireEvent.click(rendered.queryByTestId(BETA_SELECT_TEST_ID));

      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenLastCalledWith({
        added: ['beta'],
        removed: ['alpha'],
      });
    });

    describe('selection', function () {
      let spy;
      let rendered;

      beforeEach(function () {
        spy = jest.fn();
        rendered = render(<ExampleComponent onChange={spy} multiple />);
      });

      afterEach(function () {
        cleanup();
        jest.clearAllMocks();
      });

      it('should call the onChange event when a value is selected', function () {
        fireEvent.click(rendered.queryByTestId(ALPHA_SELECT_TEST_ID));

        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenLastCalledWith({
          added: ['alpha'],
          removed: [],
        });
      });

      it('should not emit multiple events for the same value', function () {
        fireEvent.click(rendered.queryByTestId('first-two'));
        fireEvent.click(rendered.queryByTestId('first-two'));

        expect(spy).toHaveBeenCalledTimes(1);
      });
    });

    describe('deselection', function () {
      let spy;
      let rendered;

      beforeEach(function () {
        spy = jest.fn();
        rendered = render(<ExampleComponent onChange={spy} multiple />);
      });

      afterEach(function () {
        cleanup();
        jest.clearAllMocks();
      });

      it('should emit an event when a value is deselected', function () {
        fireEvent.click(rendered.queryByTestId(ALPHA_TOGGLE_TEST_ID));
        fireEvent.click(rendered.queryByTestId(ALPHA_TOGGLE_TEST_ID));

        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenLastCalledWith({
          added: [],
          removed: ['alpha'],
        });
      });

      it('should not emit when a non-selected value is deselected', function () {
        fireEvent.click(rendered.queryByTestId(ALPHA_DESELECT_TEST_ID));

        expect(spy).not.toHaveBeenCalled();
      });

      it('should emit a single event when clearing all selected values', function () {
        fireEvent.click(rendered.queryByTestId(ALPHA_TOGGLE_TEST_ID));
        fireEvent.click(rendered.queryByTestId(BETA_TOGGLE_TEST_ID));
        fireEvent.click(rendered.queryByTestId(DELTA_TOGGLE_TEST_ID));
        fireEvent.click(rendered.queryByTestId(GAMMA_TOGGLE_TEST_ID));

        spy.mockClear();

        fireEvent.click(rendered.queryByTestId('clear'));
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenLastCalledWith({
          added: [],
          removed: ['alpha', 'beta', 'delta', 'gamma'],
        });
      });
    });
  });

  it('should be able to determine whether it is empty', function () {
    const rendered = render(<ExampleComponent />);

    expect(rendered.queryByTestId('empty')).toHaveTextContent('Empty');

    fireEvent.click(rendered.queryByTestId(ALPHA_TOGGLE_TEST_ID));

    expect(rendered.queryByTestId('empty')).toHaveTextContent('Has value');
  });

  it('should should be able to determine whether it has a value', function () {
    const rendered = render(<ExampleComponent />);

    expect(rendered.queryByTestId('value')).toHaveTextContent('Empty');

    fireEvent.click(rendered.queryByTestId(ALPHA_TOGGLE_TEST_ID));

    expect(rendered.queryByTestId('value')).toHaveTextContent('Has value');
  });

  it('should be able to determine whether multiple values can be selected', function () {
    const rendered = render(<ExampleComponent />);

    expect(rendered.queryByTestId('multiple')).toHaveTextContent('Single');

    rendered.rerender(<ExampleComponent multiple={true} />);

    expect(rendered.queryByTestId('multiple')).toHaveTextContent('Multiple');
  });

  it('should be able to toggle an option', function () {
    const rendered = render(<ExampleComponent />);

    fireEvent.click(rendered.queryByTestId(ALPHA_TOGGLE_TEST_ID));
    expect(rendered.queryByTestId(ALPHA_TEST_ID)).toHaveTextContent(/\+/);

    fireEvent.click(rendered.queryByTestId(ALPHA_TOGGLE_TEST_ID));
    expect(rendered.queryByTestId(ALPHA_TEST_ID)).not.toHaveTextContent(/\+/);
  });
});

/**
 * Example component to test out selection model.
 * @constructor
 */
function ExampleComponent({ onChange: __onChange, multiple }) {
  const [selected, updateSelected] = React.useState([]);

  const onChange = React.useCallback((event) => {
    updateSelected((array) => {
      let result = array;
      if (event.removed.length) {
        result = _.without(result, ...array);
      }

      if (event.added.length) {
        result = result.concat(event.added);
      }

      return result;
    });

    if (typeof __onChange === 'function') {
      __onChange(event);
    }
  }, [updateSelected, __onChange]);

  const selection = useSelectionModel(selected, { multiple, onChange });

  const selectFirstTwo = React.useCallback(() => {
    selection.select(...SAMPLE_DATA.filter((item, index) => index < 2));
  }, [selection.select]);

  return (
    <React.Fragment>
      <ul>
        { SAMPLE_DATA.map(sample => (
          <li key={sample} data-testid={sample} data-selected={selection.isSelected(sample)}>
            { sample }:{ selection.isSelected(sample) ? '+' : '' }
            <button data-testid={`${sample}-toggle`} onClick={() => selection.toggle(sample)}>Toggle</button>
            <button data-testid={`${sample}-select`} onClick={() => selection.select(sample)}>Select</button>
            <button data-testid={`${sample}-deselect`} onClick={() => selection.deselect(sample)}>Deselect</button>
          </li>
        )) }
      </ul>
      { multiple ? (
        <React.Fragment>
          <button data-testid="first-two" onClick={selectFirstTwo}>Select first two</button>
          <button data-testid="clear" onClick={selection.clear}>Clear all</button>
        </React.Fragment>
      ) : null }
      <div>
        <h1>Properties</h1>
        <p data-testid="empty">{ selection.isEmpty ? 'Empty' : 'Has value'}</p>
        <p data-testid="value">{ selection.hasValue ? 'Has value' : 'Empty'}</p>
        <p data-testid="multiple">{ selection.isMultiple ? 'Multiple' : 'Single'}</p>
      </div>
    </React.Fragment>
  );
}
