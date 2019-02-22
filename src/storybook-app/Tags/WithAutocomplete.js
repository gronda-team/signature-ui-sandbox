import React from 'react';
import _ from 'lodash';
import { FormField, Label, Hint } from '../../lib/form-field';
import { Input } from '../../lib/input';
import { TagList, Tag } from '../../lib/tags';
import {COMMA, ENTER} from '../../cdk/keycodes/keys';

class WithAutocomplete extends React.Component {
  constructor() {
    super();

    this.state = {
      value: '',
      list: ['Bananas', 'Lettuce'],
    };
  }

  updateText = (event) => {
    this.setState({ value: event.target.value });
  };

  removeItem = ({ value }) => {
    this.setState(state => ({
      list: _.without(state.list, value),
    }));
  };

  addItem = ({ value }) => {
    if (!value) return;
    this.setState(state => ({
      list: state.list.indexOf(value) === -1 ?
        [...state.list, value] :
        state.list,
      value: state.list.indexOf(value) === -1 ?
        '' : state.value,
    }));
  };

  render() {
    return (
      <FormField style={{ width: '100%' }}>
        <Label>Grocery list</Label>
        <TagList>
          { this.state.list.map(item => (
            <Tag value={item} key={item} removable onRemove={this.removeItem}>
              { item }
            </Tag>
          ))}
          <Input
            extensions={['tag-list']}
            tagListSeparatorKeyCodes={[ENTER, COMMA]}
            onTagEnd={this.addItem}
            value={this.state.value}
            onChange={this.updateText}
            placeholder="Items"
          />
        </TagList>
        <Hint>
          Press <kbd>,</kbd> or <kbd>Enter</kbd> to automatically create a list item.
        </Hint>
      </FormField>
    );
  }
}

export default WithAutocomplete;
