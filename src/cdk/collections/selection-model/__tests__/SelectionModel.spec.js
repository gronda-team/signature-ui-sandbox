import * as React from 'react';
import { shallow } from 'enzyme';
import {SelectionModel} from '../../exports';

describe('SelectionModel', () => {
  let model;
  let instance;
  let onChangeSpy = jest.fn();

  beforeEach(() => {
    model = shallow(<SelectionModel onChange={onChangeSpy} />);
    instance = model.instance();
  });

  afterEach(() => {
    onChangeSpy.mockClear();
  });

  it('should be able to determine whether it is empty', () => {
    expect(instance.isEmpty()).toBe(true);
    model.setProps({ value: 1 });
    expect(instance.isEmpty()).toBe(false);
  });

  it('should be able to determine if it has a value', () => {
    expect(instance.hasValue()).toBe(false);
    model.setProps({ value: 1 });
    expect(instance.hasValue()).toBe(true);
  });

  it('should be able to determine whether multiple values can be selected', () => {
    expect(instance.isMultipleSelection()).toBe(false);
    model.setProps({ multiple: true });
    expect(instance.isMultipleSelection()).toBe(true);
  });

  describe('Single selection', () => {
    it('should be able to select a single value', () => {
      instance.select(1);
      expect(onChangeSpy).toHaveBeenCalledWith({
        removed: [], added: [1],
      });
    });

    it('should deselect the previously selected value', () => {
      model.setProps({ value: 1 });
      instance.select(2);
      expect(onChangeSpy).toHaveBeenCalledWith({
        removed: [1], added: [2],
      });
    });

    it('should not be able to select more than one option at a time', () => {
      // Try to select multiple items
      instance.select(1, 2);
      expect(onChangeSpy).toHaveBeenCalledWith({
        removed: [], added: [1],
      });
    });

    it('should toggle an option', () => {
      instance.toggle(1);
      expect(onChangeSpy).toHaveBeenCalledWith({
        removed: [], added: [1],
      });

      model.setProps({ value: 1 });
      instance.toggle(1);
      expect(onChangeSpy).toHaveBeenCalledWith({
        removed: [1], added: [],
      });
    });
  });

  describe('Multiple selection', () => {
    it('should be able to select multiple options', () => {
      model.setProps({ multiple: true });
      instance.select(1, 2);
      expect(onChangeSpy).toHaveBeenCalledWith({
        removed: [], added: [1, 2],
      });
    });
  });

  describe('onChange event', () => {
    it('should return the correct arguments', () => {
      instance.select(1);
      expect(onChangeSpy).toHaveBeenCalledWith({
        removed: [], added: [1],
      });
    });

    it('should return both the added and removed values', () => {
      model.setProps({ value: 1 });
      instance.select(2);
      expect(onChangeSpy).toHaveBeenCalledWith({
        removed: [1], added: [2],
      });
    });

    describe('Selection', () => {
      it('should call onChange when a value is selected', () => {
        instance.select(1);
        expect(onChangeSpy).toHaveBeenCalledWith({
          removed: [], added: [1],
        });
      });

      it('should not call onChange multiple times for the same value', () => {
        onChangeSpy.mockImplementation(({ added }) => {
          model.setProps({ value: added[0] });
        });
        instance.select(1);
        instance.select(1);

        expect(onChangeSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe('Deselection', () => {
      beforeEach(() => {
        model.setProps({ multiple: true, value: [1, 2, 3] });
      });

      it('should call onChange when a value is deselected', () => {
        instance.deselect(1);
        expect(onChangeSpy).toHaveBeenCalledWith({
          removed: [1], added: [],
        });
      });

      it('should not call onChange for a value that is not in the model', () => {
        instance.deselect(4);
        expect(onChangeSpy).not.toHaveBeenCalled();
      });

      it('should emit a single event when clearing all of the selected options', () => {
        instance.clear();

        expect(onChangeSpy).toHaveBeenCalledTimes(1);
        expect(onChangeSpy).toHaveBeenCalledWith({
          removed: [1, 2, 3], added: [],
        });
      });
    });
  });
});
