import React from 'react';
import { FormField, Label, Hint } from '../../lib/form-field';
import { Input } from '../../lib/input';
import { TagList, Tag } from '../../lib/tags';
import {COMMA, ENTER} from '../../cdk/keycodes/keys';

class WithAutocomplete extends React.Component {
  constructor() {
    super();

    this.state = {
      value: '',
      list: ['Bananas'],
    };
  }

  updateText = (event) => {
    this.setState({ value: event.target.value });
  };

  removeItem = (value) => {
    console.log(value);
  };

  addItem = (value) => {
    console.log(value);
  };

  render() {
    return (
      <FormField style={{ width: '100%' }}>
        <Label>Grocery list</Label>
        <TagList>
          { this.state.list.map(item => (
            <Tag key={item} removable onRemove={this.removeItem}>
              { item }
            </Tag>
          ))}
          <Input
            extensions={['tag-list']}
            tagListSeparatorKeyCodes={[ENTER, COMMA]}
            onAddTag={this.addItem}
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
